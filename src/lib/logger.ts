import { redactPII, redactPIIInObject } from './pii-redaction';
import { generateSecureId } from './utils';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const VALID_LOG_LEVELS = ['DEBUG', 'INFO', 'WARN', 'ERROR'] as const;
type ValidLogLevelString = (typeof VALID_LOG_LEVELS)[number];

function parseLogLevelFromEnv(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  if (!envLevel) return LogLevel.INFO;

  if (!VALID_LOG_LEVELS.includes(envLevel as ValidLogLevelString)) {
    if (process.env.SUPPRESS_BUILD_LOGS !== 'true') {
      console.warn(
        `[Logger] Invalid LOG_LEVEL "${envLevel}", falling back to INFO. Valid values: ${VALID_LOG_LEVELS.join(', ')}`
      );
    }
    return LogLevel.INFO;
  }

  return LogLevel[envLevel as ValidLogLevelString];
}

/**
 * Parse log sample rate from environment variable.
 * Value should be between 0.0 and 1.0 (e.g., 0.1 = 10% of logs).
 * Default is 1.0 (no sampling - log everything).
 * Only applies to INFO and DEBUG logs; ERROR and WARN are always logged.
 */
function parseLogSampleRate(): number {
  const envRate = process.env.LOG_SAMPLE_RATE;
  if (!envRate) return 1.0;

  const rate = parseFloat(envRate);
  if (isNaN(rate) || rate < 0 || rate > 1) {
    if (process.env.SUPPRESS_BUILD_LOGS !== 'true') {
      console.warn(
        `[Logger] Invalid LOG_SAMPLE_RATE "${envRate}", falling back to 1.0. Valid values: 0.0 to 1.0`
      );
    }
    return 1.0;
  }

  return rate;
}

let currentLogLevel = parseLogLevelFromEnv();
let currentSampleRate = parseLogSampleRate();
let globalCorrelationId: string | undefined;

// Detect if we're in a build/SSR environment where console output causes Lighthouse issues
const isBuildTime =
  typeof window === 'undefined' && process.env.NODE_ENV === 'production';
const isSilentMode = isBuildTime && process.env.SUPPRESS_BUILD_LOGS === 'true';

// Emergency debug mode - allows debug logs in production via environment variable
const isEmergencyDebugMode =
  typeof window === 'undefined' && process.env.ENABLE_DEBUG_LOGS === 'true';

// Check if structured JSON logging is enabled for production
const isStructuredLogging =
  typeof window === 'undefined' && process.env.STRUCTURED_LOGGING === 'true';

export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

export function setLogSampleRate(rate: number): void {
  if (rate < 0 || rate > 1) {
    console.warn(
      `[Logger] Invalid sample rate ${rate}, must be between 0 and 1. Ignoring.`
    );
    return;
  }
  currentSampleRate = rate;
}

export function getLogSampleRate(): number {
  return currentSampleRate;
}

export function setCorrelationId(correlationId: string | undefined): void {
  globalCorrelationId = correlationId;
}

export function getCorrelationId(): string | undefined {
  return globalCorrelationId;
}

/**
 * Generate a unique correlation ID for request tracing
 * Uses cryptographically secure random IDs
 */
export function generateCorrelationId(): string {
  return generateSecureId('req_');
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface StructuredLogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  correlationId?: string;
  requestId?: string;
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
  environment: string;
}

export class Logger {
  constructor(private context: string) {}

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getEnvironment(): string {
    return process.env.NODE_ENV || 'unknown';
  }

  private createStructuredEntry(
    level: string,
    message: string,
    logContext?: LogContext
  ): StructuredLogEntry {
    return {
      timestamp: this.getTimestamp(),
      level,
      context: this.context,
      message: redactPII(message),
      correlationId: globalCorrelationId,
      requestId: logContext?.requestId,
      userId: logContext?.userId,
      component: logContext?.component,
      action: logContext?.action,
      metadata: logContext?.metadata
        ? (redactPIIInObject(logContext.metadata) as Record<string, unknown>)
        : undefined,
      environment: this.getEnvironment(),
    };
  }

  private formatMessage(message: string, context?: LogContext): string {
    if (!context) return message;
    const contextParts: string[] = [];
    if (context.requestId) contextParts.push(`req:${context.requestId}`);
    if (context.userId) contextParts.push(`user:${context.userId}`);
    if (context.component) contextParts.push(`comp:${context.component}`);
    if (context.action) contextParts.push(`action:${context.action}`);
    if (contextParts.length > 0) {
      return `${message} [${contextParts.join(' ')}]`;
    }
    return message;
  }

  private formatArgs(args: unknown[], context?: LogContext): unknown[] {
    if (context?.metadata) {
      return [...args, context.metadata];
    }
    return args;
  }

  private shouldLog(level: LogLevel, isDebug: boolean = false): boolean {
    if (isSilentMode && level !== LogLevel.ERROR) return false;
    if (isDebug && isEmergencyDebugMode) return true;
    if (currentLogLevel > level) return false;

    if (currentSampleRate < 1.0 && level <= LogLevel.INFO) {
      return Math.random() < currentSampleRate;
    }

    return true;
  }

  private output(
    level: LogLevel,
    levelName: string,
    message: string,
    args: unknown[],
    logContext?: LogContext
  ): void {
    if (isStructuredLogging) {
      const entry = this.createStructuredEntry(levelName, message, logContext);
      const output = JSON.stringify(entry);
      // Use console.error for ALL structured log output to ensure logs survive
      // Next.js's removeConsole configuration in production (Issue #949).
      // The JSON "level" field indicates actual severity for log aggregators.
      // This preserves production observability while maintaining structured format.
      console.error(output);
    } else {
      const formattedMessage = this.formatMessage(message, logContext);
      const sanitizedArgs = args.map((a) => redactPIIInObject(a));
      const prefix = `[${this.getTimestamp()}] [${this.context}]`;

      // Use console.error for ALL logs in production to ensure they survive
      // Next.js's removeConsole configuration (Issue #949).
      // This preserves production observability for incident response.
      const isProduction = process.env.NODE_ENV === 'production';

      if (isProduction) {
        // In production, ALL logs go to console.error to survive removeConsole
        console.error(
          `${prefix} ${redactPII(formattedMessage)}`,
          ...sanitizedArgs
        );
      } else if (level === LogLevel.ERROR) {
        console.error(
          `${prefix} ${redactPII(formattedMessage)}`,
          ...sanitizedArgs
        );
      } else if (level === LogLevel.WARN) {
        console.warn(
          `${prefix} ${redactPII(formattedMessage)}`,
          ...sanitizedArgs
        );
      } else if (level === LogLevel.INFO) {
        console.info(
          `${prefix} ${redactPII(formattedMessage)}`,
          ...sanitizedArgs
        );
      } else {
        console.debug(
          `${prefix} ${redactPII(formattedMessage)}`,
          ...sanitizedArgs
        );
      }
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG, true)) {
      this.output(LogLevel.DEBUG, 'DEBUG', message, args);
    }
  }

  debugWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (this.shouldLog(LogLevel.DEBUG, true)) {
      this.output(
        LogLevel.DEBUG,
        'DEBUG',
        message,
        this.formatArgs(args, context),
        context
      );
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(LogLevel.INFO, 'INFO', message, args);
    }
  }

  infoWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.output(
        LogLevel.INFO,
        'INFO',
        message,
        this.formatArgs(args, context),
        context
      );
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(LogLevel.WARN, 'WARN', message, args);
    }
  }

  warnWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.output(
        LogLevel.WARN,
        'WARN',
        message,
        this.formatArgs(args, context),
        context
      );
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(LogLevel.ERROR, 'ERROR', message, args);
    }
  }

  errorWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.output(
        LogLevel.ERROR,
        'ERROR',
        message,
        this.formatArgs(args, context),
        context
      );
    }
  }

  fatal(message: string, error?: Error, ...args: unknown[]): void {
    const errorInfo = error
      ? { errorMessage: error.message, stack: error.stack }
      : undefined;
    this.output(
      LogLevel.ERROR,
      'FATAL',
      message,
      [...args, errorInfo].filter(Boolean)
    );
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
