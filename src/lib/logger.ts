import { redactPII, redactPIIInObject } from './pii-redaction';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

let currentLogLevel = LogLevel.INFO;
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

export function setCorrelationId(correlationId: string | undefined): void {
  globalCorrelationId = correlationId;
}

export function getCorrelationId(): string | undefined {
  return globalCorrelationId;
}

/**
 * Generate a unique correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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
    return currentLogLevel <= level;
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
      if (level === LogLevel.ERROR) console.error(output);
      else if (level === LogLevel.WARN) console.warn(output);
      else console.log(output);
    } else {
      const formattedMessage = this.formatMessage(message, logContext);
      const sanitizedArgs = args.map((a) => redactPIIInObject(a));
      const prefix = `[${this.getTimestamp()}] [${this.context}]`;

      if (level === LogLevel.ERROR) {
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
