import { ConnectionHealthMonitor } from '@/lib/db/health';

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

interface MockQueryChain {
  from: jest.Mock;
  select?: jest.Mock;
  limit?: jest.Mock;
}

const createMockClient = (error: Error | null = null): MockQueryChain => ({
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue({ error }),
    }),
  }),
});

const createThrowingClient = (errorMessage: string): MockQueryChain => ({
  from: jest.fn().mockImplementation(() => {
    throw new Error(errorMessage);
  }),
});

describe('ConnectionHealthMonitor', () => {
  let monitor: ConnectionHealthMonitor;

  beforeEach(() => {
    monitor = new ConnectionHealthMonitor();
  });

  describe('checkConnection', () => {
    it('should return healthy when both client and admin are healthy', async () => {
      const mockClient = createMockClient();
      const mockAdmin = createMockClient();

      const result = await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      expect(result).toEqual({ client: true, admin: true });
    });

    it('should return unhealthy client when client is null', async () => {
      const mockAdmin = createMockClient();

      const result = await monitor.checkConnection(
        null,
        () => mockAdmin as never
      );

      expect(result).toEqual({ client: false, admin: true });
    });

    it('should return unhealthy admin when admin is null', async () => {
      const mockClient = createMockClient();

      const result = await monitor.checkConnection(
        mockClient as never,
        () => null
      );

      expect(result).toEqual({ client: true, admin: false });
    });

    it('should return unhealthy when client query returns error', async () => {
      const mockClient = createMockClient(new Error('Query failed'));
      const mockAdmin = createMockClient();

      const result = await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      expect(result).toEqual({ client: false, admin: true });
    });

    it('should handle client query rejection', async () => {
      const mockClient = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockRejectedValue(new Error('Connection refused')),
          }),
        }),
      };
      const mockAdmin = createMockClient();

      const result = await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      expect(result.client).toBe(false);
    });

    it('should handle admin query rejection', async () => {
      const mockClient = createMockClient();
      const mockAdmin = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockRejectedValue(new Error('Connection refused')),
          }),
        }),
      };

      const result = await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      expect(result.admin).toBe(false);
    });

    it('should handle client throwing exception', async () => {
      const mockClient = createThrowingClient('Connection error');
      const mockAdmin = createMockClient();

      const result = await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      expect(result).toEqual({ client: false, admin: true });
    });

    it('should handle admin throwing exception', async () => {
      const mockClient = createMockClient();
      const getAdmin = jest.fn().mockImplementation(() => {
        throw new Error('Admin connection error');
      });

      const result = await monitor.checkConnection(
        mockClient as never,
        getAdmin
      );

      expect(result).toEqual({ client: true, admin: false });
    });

    it('should update connection metrics on successful check', async () => {
      const mockClient = createMockClient();
      const mockAdmin = createMockClient();

      await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      const metrics = monitor.getConnectionMetrics();
      expect(metrics.totalConnections).toBe(1);
      expect(metrics.failedConnections).toBe(0);
      expect(metrics.lastSuccessfulConnection).not.toBeNull();
    });

    it('should update connection metrics on failed check', async () => {
      const mockClient = createMockClient(new Error('Failed'));
      const mockAdmin = createMockClient();

      await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      const metrics = monitor.getConnectionMetrics();
      expect(metrics.failedConnections).toBe(1);
      expect(metrics.lastFailedConnection).not.toBeNull();
    });
  });

  describe('isConnectionHealthy', () => {
    it('should return false when no health check has been performed', () => {
      expect(monitor.isConnectionHealthy()).toBe(false);
    });

    it('should return true when connection is healthy and recent', async () => {
      const mockClient = createMockClient();
      const mockAdmin = createMockClient();

      await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      expect(monitor.isConnectionHealthy()).toBe(true);
    });

    it('should return false when connection is unhealthy', async () => {
      const mockClient = createMockClient(new Error('Failed'));
      const mockAdmin = createMockClient();

      await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      expect(monitor.isConnectionHealthy()).toBe(false);
    });
  });

  describe('getConnectionMetrics', () => {
    it('should return initial metrics', () => {
      const metrics = monitor.getConnectionMetrics();

      expect(metrics).toEqual({
        totalConnections: 0,
        failedConnections: 0,
        lastSuccessfulConnection: null,
        lastFailedConnection: null,
        totalQueries: 0,
        failedQueries: 0,
        connectionHealthy: false,
        lastHealthCheck: null,
        connectionRetries: 0,
      });
    });

    it('should serialize dates to ISO strings', async () => {
      const mockClient = createMockClient();
      const mockAdmin = createMockClient();

      await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      const metrics = monitor.getConnectionMetrics();
      expect(typeof metrics.lastSuccessfulConnection).toBe('string');
      expect(typeof metrics.lastHealthCheck).toBe('string');
    });
  });

  describe('resetHealthTracking', () => {
    it('should reset all health tracking state', async () => {
      const mockClient = createMockClient();
      const mockAdmin = createMockClient();

      await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );
      monitor.incrementRetries();

      monitor.resetHealthTracking();

      const metrics = monitor.getConnectionMetrics();
      expect(metrics.connectionHealthy).toBe(false);
      expect(metrics.lastHealthCheck).toBeNull();
      expect(metrics.connectionRetries).toBe(0);
    });
  });

  describe('incrementRetries', () => {
    it('should increment retry count', () => {
      monitor.incrementRetries();
      monitor.incrementRetries();

      const metrics = monitor.getConnectionMetrics();
      expect(metrics.connectionRetries).toBe(2);
    });
  });

  describe('getHealthStatus', () => {
    it('should return initial health status', () => {
      const status = monitor.getHealthStatus();

      expect(status).toEqual({
        healthy: false,
        lastCheck: null,
        retries: 0,
      });
    });

    it('should return updated health status after check', async () => {
      const mockClient = createMockClient();
      const mockAdmin = createMockClient();

      await monitor.checkConnection(
        mockClient as never,
        () => mockAdmin as never
      );

      const status = monitor.getHealthStatus();
      expect(status.healthy).toBe(true);
      expect(status.lastCheck).not.toBeNull();
    });
  });
});
