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
    if (context?.metadata) {
      return [...args, context.metadata];
    }
    return args;
  }

  debug(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.debug(`[${this.context}] ${message}`, ...args);
    }
  }

  debugWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.debug(
        `[${this.context}] ${this.formatMessage(message, context)}`,
        ...this.formatArgs(args, context)
      );
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.INFO) {
      console.info(`[${this.context}] ${message}`, ...args);
    }
  }

  infoWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (currentLogLevel <= LogLevel.INFO) {
      console.info(
        `[${this.context}] ${this.formatMessage(message, context)}`,
        ...this.formatArgs(args, context)
      );
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(`[${this.context}] ${message}`, ...args);
    }
  }

  warnWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(
        `[${this.context}] ${this.formatMessage(message, context)}`,
        ...this.formatArgs(args, context)
      );
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(`[${this.context}] ${message}`, ...args);
    }
  }

  errorWithContext(
    message: string,
    context: LogContext,
    ...args: unknown[]
  ): void {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(
        `[${this.context}] ${this.formatMessage(message, context)}`,
        ...this.formatArgs(args, context)
      );
    }
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
