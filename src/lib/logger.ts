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

export class Logger {
  constructor(private context: string) {}

  debug(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.debug(`[${this.context}] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.INFO) {
      console.info(`[${this.context}] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(`[${this.context}] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(`[${this.context}] ${message}`, ...args);
    }
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
