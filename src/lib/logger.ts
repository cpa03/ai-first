import { redactPII, redactPIIInObject } from './pii-redaction';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

let currentLogLevel = LogLevel.INFO;

export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export class Logger {
  constructor(private context: string) {}

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
    const safeArgs = args || [];
    if (context?.metadata) {
      return [...safeArgs, context.metadata];
    }
    return safeArgs;
  }

  debug(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
      const sanitizedArgs = (args || []).map((a) => redactPIIInObject(a));
      console.debug(`[${this.context}] ${redactPII(message)}`, ...sanitizedArgs);
    }
  }

  debugWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
      const allArgs = this.formatArgs(args || [], context);
      const sanitizedArgs = (allArgs || []).map((a) => redactPIIInObject(a));
      console.debug(
        `[${this.context}] ${redactPII(this.formatMessage(message, context))}`,
        ...sanitizedArgs
      );
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.INFO) {
      const sanitizedArgs = (args || []).map((a) => redactPIIInObject(a));
      console.info(`[${this.context}] ${redactPII(message)}`, ...sanitizedArgs);
    }
  }

  infoWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (currentLogLevel <= LogLevel.INFO) {
      const allArgs = this.formatArgs(args || [], context);
      const sanitizedArgs = (allArgs || []).map((a) => redactPIIInObject(a));
      console.info(
        `[${this.context}] ${redactPII(this.formatMessage(message, context))}`,
        ...sanitizedArgs
      );
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.WARN) {
      const sanitizedArgs = (args || []).map((a) => redactPIIInObject(a));
      console.warn(`[${this.context}] ${redactPII(message)}`, ...sanitizedArgs);
    }
  }

  warnWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (currentLogLevel <= LogLevel.WARN) {
      const allArgs = this.formatArgs(args || [], context);
      const sanitizedArgs = (allArgs || []).map((a) => redactPIIInObject(a));
      console.warn(
        `[${this.context}] ${redactPII(this.formatMessage(message, context))}`,
        ...sanitizedArgs
      );
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.ERROR) {
      const sanitizedArgs = (args || []).map((a) => redactPIIInObject(a));
      console.error(`[${this.context}] ${redactPII(message)}`, ...sanitizedArgs);
    }
  }

  errorWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (currentLogLevel <= LogLevel.ERROR) {
      const allArgs = this.formatArgs(args || [], context);
      const sanitizedArgs = (allArgs || []).map((a) => redactPIIInObject(a));
      console.error(
        `[${this.context}] ${redactPII(this.formatMessage(message, context))}`,
        ...sanitizedArgs
      );
    }
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
