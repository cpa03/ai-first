import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { createLogger } from '../logger';
import { AGENT_CONFIG } from '../config/constants';
import { API_ERROR_MESSAGES } from '../config/error-messages';
import { DB_TABLES } from '../config/database-tables';
import type { ConnectionHealth } from './types';

const logger = createLogger('DatabaseHealth');
const { DATABASE } = AGENT_CONFIG;

/**
 * Connection health metrics for observability
 */
export interface ConnectionMetrics {
  totalConnections: number;
  failedConnections: number;
  lastSuccessfulConnection: Date | null;
  lastFailedConnection: Date | null;
  totalQueries: number;
  failedQueries: number;
}

/**
 * Serialized connection metrics (with ISO strings instead of Date objects)
 */
export interface SerializedConnectionMetrics extends Omit<
  ConnectionMetrics,
  'lastSuccessfulConnection' | 'lastFailedConnection'
> {
  lastSuccessfulConnection: string | null;
  lastFailedConnection: string | null;
  connectionHealthy: boolean;
  lastHealthCheck: string | null;
  connectionRetries: number;
}

/**
 * Database connection health monitor
 *
 * This class handles all health check operations for the database service,
 * including client and admin connection verification, metrics tracking,
 * and health status reporting.
 */
export class ConnectionHealthMonitor {
  private connectionRetries = 0;
  private connectionHealthy = false;
  private lastHealthCheck: Date | null = null;

  // Connection metrics for observability
  private connectionMetrics: ConnectionMetrics = {
    totalConnections: 0,
    failedConnections: 0,
    lastSuccessfulConnection: null,
    lastFailedConnection: null,
    totalQueries: 0,
    failedQueries: 0,
  };

  /**
   * Check client and admin connection health
   *
   * @param client - Supabase client for user operations
   * @param getAdmin - Function to get admin client
   * @returns Connection health status
   */
  async checkConnection(
    client: ReturnType<typeof createClient<Database>> | null,
    getAdmin: () => ReturnType<typeof createClient<Database>> | null
  ): Promise<ConnectionHealth> {
    // Check client connection
    let clientHealthy = false;
    try {
      if (!client) {
        this.connectionMetrics.failedConnections++;
        this.connectionMetrics.lastFailedConnection = new Date();
      } else {
        this.connectionMetrics.totalConnections++;

        const healthCheckPromise = client
          .from(DB_TABLES.IDEAS)
          .select('id')
          .limit(1);

        const timeoutPromise = new Promise<{ error: Error }>((_, reject) => {
          setTimeout(() => {
            reject(new Error(API_ERROR_MESSAGES.DB.HEALTH_CHECK_TIMEOUT));
          }, DATABASE.HEALTH_CHECK_TIMEOUT_MS);
        });

        const { error } = await Promise.race([
          healthCheckPromise,
          timeoutPromise
            .then(() => ({ error: null }))
            .catch((err) => ({
              error: err,
            })),
        ]);

        const timedOut =
          error instanceof Error &&
          error.message === API_ERROR_MESSAGES.DB.HEALTH_CHECK_TIMEOUT;

        if (timedOut) {
          logger.warn(
            `Database client health check timed out after ${DATABASE.HEALTH_CHECK_TIMEOUT_MS}ms`
          );
        }

        clientHealthy = !error && !timedOut;
      }
    } catch {
      clientHealthy = false;
    }

    // Check admin connection
    let adminHealthy = false;
    try {
      const admin = getAdmin();
      if (!admin) {
        // Admin client not initialized - consider it unhealthy
        adminHealthy = false;
      } else {
        // Test admin connection with a simple query
        // Using agent_logs table which is commonly used for admin operations
        const adminHealthCheckPromise = admin
          .from(DB_TABLES.AGENT_LOGS)
          .select('id')
          .limit(1);

        const timeoutPromise = new Promise<{ error: Error }>((_, reject) => {
          setTimeout(() => {
            reject(new Error(API_ERROR_MESSAGES.DB.ADMIN_HEALTH_CHECK_TIMEOUT));
          }, DATABASE.HEALTH_CHECK_TIMEOUT_MS);
        });

        const { error } = await Promise.race([
          adminHealthCheckPromise,
          timeoutPromise
            .then(() => ({ error: null }))
            .catch((err) => ({
              error: err,
            })),
        ]);

        const timedOut =
          error instanceof Error &&
          error.message === API_ERROR_MESSAGES.DB.ADMIN_HEALTH_CHECK_TIMEOUT;

        if (timedOut) {
          logger.warn(
            `Database admin health check timed out after ${DATABASE.HEALTH_CHECK_TIMEOUT_MS}ms`
          );
        }

        adminHealthy = !error && !timedOut;
      }
    } catch {
      adminHealthy = false;
    }

    // Update connection metrics
    const allHealthy = clientHealthy && adminHealthy;
    this.connectionHealthy = allHealthy;
    this.lastHealthCheck = new Date();

    if (!allHealthy) {
      this.connectionMetrics.failedConnections++;
      this.connectionMetrics.lastFailedConnection = new Date();
    } else {
      this.connectionMetrics.lastSuccessfulConnection = new Date();
    }

    return { client: clientHealthy, admin: adminHealthy };
  }

  /**
   * Check if connection is healthy (not stale)
   */
  isConnectionHealthy(): boolean {
    if (!this.lastHealthCheck) return false;
    const staleThreshold = new Date(
      Date.now() - DATABASE.HEALTH_CHECK_STALE_THRESHOLD_MS
    );
    return this.connectionHealthy && this.lastHealthCheck > staleThreshold;
  }

  /**
   * Get serialized connection metrics
   */
  getConnectionMetrics(): SerializedConnectionMetrics {
    return {
      ...this.connectionMetrics,
      lastSuccessfulConnection:
        this.connectionMetrics.lastSuccessfulConnection?.toISOString() ?? null,
      lastFailedConnection:
        this.connectionMetrics.lastFailedConnection?.toISOString() ?? null,
      connectionHealthy: this.connectionHealthy,
      lastHealthCheck: this.lastHealthCheck?.toISOString() ?? null,
      connectionRetries: this.connectionRetries,
    };
  }

  /**
   * Reset connection health tracking
   */
  resetHealthTracking(): void {
    this.connectionHealthy = false;
    this.lastHealthCheck = null;
    this.connectionRetries = 0;
  }

  /**
   * Increment connection retries
   */
  incrementRetries(): void {
    this.connectionRetries++;
  }

  /**
   * Get current health status
   */
  getHealthStatus(): {
    healthy: boolean;
    lastCheck: Date | null;
    retries: number;
  } {
    return {
      healthy: this.connectionHealthy,
      lastCheck: this.lastHealthCheck,
      retries: this.connectionRetries,
    };
  }
}
