import {
  Logger,
  LogLevel,
  setLogLevel,
  createLogger,
  LogContext,
} from '@/lib/logger';

describe('Logger Module', () => {
  beforeEach(() => {
    setLogLevel(LogLevel.INFO);
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setLogLevel(LogLevel.INFO);
  });

  describe('LogLevel Enum', () => {
    it('should have correct numeric values', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
    });

    it('should have correct priority order', () => {
      expect(LogLevel.DEBUG < LogLevel.INFO).toBe(true);
      expect(LogLevel.INFO < LogLevel.WARN).toBe(true);
      expect(LogLevel.WARN < LogLevel.ERROR).toBe(true);
    });
  });

  describe('setLogLevel', () => {
    it('should change current log level', () => {
      const logger = new Logger('TestContext');

      setLogLevel(LogLevel.ERROR);
      logger.info('Should not log');
      expect(console.info).not.toHaveBeenCalled();

      setLogLevel(LogLevel.DEBUG);
      logger.info('Should log');
      expect(console.info).toHaveBeenCalled();
    });

    it('should accept all log level values', () => {
      expect(() => setLogLevel(LogLevel.DEBUG)).not.toThrow();
      expect(() => setLogLevel(LogLevel.INFO)).not.toThrow();
      expect(() => setLogLevel(LogLevel.WARN)).not.toThrow();
      expect(() => setLogLevel(LogLevel.ERROR)).not.toThrow();
    });

    it('should persist log level across logger instances', () => {
      setLogLevel(LogLevel.WARN);

      const logger1 = new Logger('Context1');
      const logger2 = new Logger('Context2');

      logger1.info('Should not log');
      logger2.info('Should not log');
      expect(console.info).not.toHaveBeenCalled();

      logger1.warn('Should log');
      logger2.warn('Should log');
      expect(console.warn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Logger Constructor', () => {
    it('should create logger with context string', () => {
      const logger = new Logger('MyContext');
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should accept empty string as context', () => {
      expect(() => new Logger('')).not.toThrow();
    });

    it('should accept long context strings', () => {
      const longContext = 'VeryLongContextStringForTesting';
      const logger = new Logger(longContext);
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should accept context with special characters', () => {
      const logger = new Logger('Context-123_Test');
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('formatMessage', () => {
    it('should return message unchanged when no context provided', () => {
      const logger = new Logger('Test');
      const message = 'Simple message';
      expect(logger['formatMessage'](message)).toBe(message);
    });

    it('should include requestId in formatted message', () => {
      const logger = new Logger('Test');
      const context: LogContext = { requestId: 'req_123' };
      const result = logger['formatMessage']('Message', context);
      expect(result).toContain('req:req_123');
    });

    it('should include userId in formatted message', () => {
      const logger = new Logger('Test');
      const context: LogContext = { userId: 'user_456' };
      const result = logger['formatMessage']('Message', context);
      expect(result).toContain('user:user_456');
    });

    it('should include component in formatted message', () => {
      const logger = new Logger('Test');
      const context: LogContext = { component: 'AuthService' };
      const result = logger['formatMessage']('Message', context);
      expect(result).toContain('comp:AuthService');
    });

    it('should include action in formatted message', () => {
      const logger = new Logger('Test');
      const context: LogContext = { action: 'login' };
      const result = logger['formatMessage']('Message', context);
      expect(result).toContain('action:login');
    });

    it('should include multiple context fields', () => {
      const logger = new Logger('Test');
      const context: LogContext = {
        requestId: 'req_123',
        userId: 'user_456',
        component: 'AuthService',
        action: 'login',
      };
      const result = logger['formatMessage']('Message', context);
      expect(result).toContain('req:req_123');
      expect(result).toContain('user:user_456');
      expect(result).toContain('comp:AuthService');
      expect(result).toContain('action:login');
    });

    it('should append context in brackets to message', () => {
      const logger = new Logger('Test');
      const context: LogContext = { requestId: 'req_1' };
      const result = logger['formatMessage']('Test message', context);
      expect(result).toBe('Test message [req:req_1]');
    });

    it('should handle empty context object', () => {
      const logger = new Logger('Test');
      const context: LogContext = {};
      const result = logger['formatMessage']('Message', context);
      expect(result).toBe('Message');
    });
  });

  describe('formatArgs', () => {
    it('should return args unchanged when no metadata', () => {
      const logger = new Logger('Test');
      const args = ['arg1', 'arg2'];
      const result = logger['formatArgs'](args, undefined);
      expect(result).toEqual(args);
    });

    it('should return args unchanged when context has no metadata', () => {
      const logger = new Logger('Test');
      const context: LogContext = { requestId: 'req_1' };
      const args = ['arg1'];
      const result = logger['formatArgs'](args, context);
      expect(result).toEqual(args);
    });

    it('should append metadata to args when present', () => {
      const logger = new Logger('Test');
      const context: LogContext = { metadata: { key: 'value' } };
      const args = ['arg1', 'arg2'];
      const result = logger['formatArgs'](args, context);
      expect(result).toEqual(['arg1', 'arg2', { key: 'value' }]);
    });

    it('should handle empty args with metadata', () => {
      const logger = new Logger('Test');
      const context: LogContext = { metadata: { data: 'test' } };
      const result = logger['formatArgs']([], context);
      expect(result).toEqual([{ data: 'test' }]);
    });

    it('should handle complex metadata objects', () => {
      const logger = new Logger('Test');
      const metadata = {
        userId: '123',
        timestamp: '2024-01-01',
        nested: { key: 'value' },
      };
      const context: LogContext = { metadata };
      const args = ['message'];
      const result = logger['formatArgs'](args, context);
      expect(result).toEqual(['message', metadata]);
    });
  });

  describe('debug', () => {
    it('should log debug message when level is DEBUG', () => {
      setLogLevel(LogLevel.DEBUG);
      const logger = new Logger('TestLogger');
      logger.debug('Debug message');
      expect(console.debug).toHaveBeenCalledWith('[TestLogger] Debug message');
    });

    it('should not log debug message when level is INFO', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('TestLogger');
      logger.debug('Debug message');
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should log with multiple args', () => {
      setLogLevel(LogLevel.DEBUG);
      const logger = new Logger('TestLogger');
      logger.debug('Message', 'arg1', 'arg2');
      expect(console.debug).toHaveBeenCalledWith(
        '[TestLogger] Message',
        'arg1',
        'arg2'
      );
    });

    it('should handle objects as args', () => {
      setLogLevel(LogLevel.DEBUG);
      const logger = new Logger('TestLogger');
      const obj = { key: 'value', num: 123 };
      logger.debug('Message', obj);
      expect(console.debug).toHaveBeenCalledWith('[TestLogger] Message', obj);
    });

    it('should handle empty args', () => {
      setLogLevel(LogLevel.DEBUG);
      const logger = new Logger('TestLogger');
      logger.debug('Message');
      expect(console.debug).toHaveBeenCalledWith('[TestLogger] Message');
    });
  });

  describe('debugWithContext', () => {
    it('should log with context when level is DEBUG', () => {
      setLogLevel(LogLevel.DEBUG);
      const logger = new Logger('TestLogger');
      const context: LogContext = { requestId: 'req_123' };
      logger.debugWithContext('Message', context);
      expect(console.debug).toHaveBeenCalledWith(
        '[TestLogger] Message [req:req_123]'
      );
    });

    it('should not log when level is INFO', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('TestLogger');
      const context: LogContext = { requestId: 'req_123' };
      logger.debugWithContext('Message', context);
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should log with context and additional args', () => {
      setLogLevel(LogLevel.DEBUG);
      const logger = new Logger('TestLogger');
      const context: LogContext = { requestId: 'req_123', userId: 'user_456' };
      logger.debugWithContext('Message', context, 'extraArg');
      expect(console.debug).toHaveBeenCalledWith(
        '[TestLogger] Message [req:req_123 user:user_456]',
        'extraArg'
      );
    });

    it('should include metadata in output', () => {
      setLogLevel(LogLevel.DEBUG);
      const logger = new Logger('TestLogger');
      const context: LogContext = { metadata: { key: 'value' } };
      logger.debugWithContext('Message', context);
      expect(console.debug).toHaveBeenCalledWith('[TestLogger] Message', {
        key: 'value',
      });
    });

    it('should handle context with all fields', () => {
      setLogLevel(LogLevel.DEBUG);
      const logger = new Logger('TestLogger');
      const context: LogContext = {
        requestId: 'req_123',
        userId: 'user_456',
        component: 'TestComponent',
        action: 'testAction',
        metadata: { data: 'test' },
      };
      logger.debugWithContext('Message', context);
      expect(console.debug).toHaveBeenCalledWith(
        '[TestLogger] Message [req:req_123 user:user_456 comp:TestComponent action:testAction]',
        { data: 'test' }
      );
    });
  });

  describe('info', () => {
    it('should log info message when level is INFO', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('TestLogger');
      logger.info('Info message');
      expect(console.info).toHaveBeenCalledWith('[TestLogger] Info message');
    });

    it('should log info message when level is DEBUG', () => {
      setLogLevel(LogLevel.DEBUG);
      const logger = new Logger('TestLogger');
      logger.info('Info message');
      expect(console.info).toHaveBeenCalledWith('[TestLogger] Info message');
    });

    it('should not log info message when level is WARN', () => {
      setLogLevel(LogLevel.WARN);
      const logger = new Logger('TestLogger');
      logger.info('Info message');
      expect(console.info).not.toHaveBeenCalled();
    });

    it('should log with multiple args', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('TestLogger');
      logger.info('Message', 'arg1', 123, { key: 'value' });
      expect(console.info).toHaveBeenCalledWith(
        '[TestLogger] Message',
        'arg1',
        123,
        { key: 'value' }
      );
    });
  });

  describe('infoWithContext', () => {
    it('should log with context when level is INFO', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('TestLogger');
      const context: LogContext = { requestId: 'req_123' };
      logger.infoWithContext('Message', context);
      expect(console.info).toHaveBeenCalledWith(
        '[TestLogger] Message [req:req_123]'
      );
    });

    it('should not log when level is WARN', () => {
      setLogLevel(LogLevel.WARN);
      const logger = new Logger('TestLogger');
      const context: LogContext = { requestId: 'req_123' };
      logger.infoWithContext('Message', context);
      expect(console.info).not.toHaveBeenCalled();
    });

    it('should include metadata in output', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('TestLogger');
      const context: LogContext = { metadata: { userId: '123' } };
      logger.infoWithContext('Message', context);
      expect(console.info).toHaveBeenCalledWith('[TestLogger] Message', {
        userId: '123',
      });
    });
  });

  describe('warn', () => {
    it('should log warn message when level is WARN', () => {
      setLogLevel(LogLevel.WARN);
      const logger = new Logger('TestLogger');
      logger.warn('Warning message');
      expect(console.warn).toHaveBeenCalledWith('[TestLogger] Warning message');
    });

    it('should log warn message when level is INFO', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('TestLogger');
      logger.warn('Warning message');
      expect(console.warn).toHaveBeenCalledWith('[TestLogger] Warning message');
    });

    it('should not log warn message when level is ERROR', () => {
      setLogLevel(LogLevel.ERROR);
      const logger = new Logger('TestLogger');
      logger.warn('Warning message');
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should log with error objects', () => {
      setLogLevel(LogLevel.WARN);
      const logger = new Logger('TestLogger');
      const error = new Error('Test error');
      logger.warn('Warning occurred', error);
      expect(console.warn).toHaveBeenCalledWith(
        '[TestLogger] Warning occurred',
        error
      );
    });
  });

  describe('warnWithContext', () => {
    it('should log with context when level is WARN', () => {
      setLogLevel(LogLevel.WARN);
      const logger = new Logger('TestLogger');
      const context: LogContext = { component: 'AuthService' };
      logger.warnWithContext('Message', context);
      expect(console.warn).toHaveBeenCalledWith(
        '[TestLogger] Message [comp:AuthService]'
      );
    });

    it('should not log when level is ERROR', () => {
      setLogLevel(LogLevel.ERROR);
      const logger = new Logger('TestLogger');
      const context: LogContext = { component: 'AuthService' };
      logger.warnWithContext('Message', context);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should include metadata and error in output', () => {
      setLogLevel(LogLevel.WARN);
      const logger = new Logger('TestLogger');
      const error = new Error('Test error');
      const context: LogContext = { metadata: { error: error.message } };
      logger.warnWithContext('Message', context);
      expect(console.warn).toHaveBeenCalledWith('[TestLogger] Message', {
        error: error.message,
      });
    });
  });

  describe('error', () => {
    it('should log error message when level is ERROR', () => {
      setLogLevel(LogLevel.ERROR);
      const logger = new Logger('TestLogger');
      logger.error('Error message');
      expect(console.error).toHaveBeenCalledWith('[TestLogger] Error message');
    });

    it('should log error message when level is WARN', () => {
      setLogLevel(LogLevel.WARN);
      const logger = new Logger('TestLogger');
      logger.error('Error message');
      expect(console.error).toHaveBeenCalledWith('[TestLogger] Error message');
    });

    it('should not log error message when level is higher than ERROR', () => {
      const logger = new Logger('TestLogger');
      setLogLevel((LogLevel.ERROR + 1) as any);
      logger.error('Error message');
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should log with error object', () => {
      setLogLevel(LogLevel.ERROR);
      const logger = new Logger('TestLogger');
      const error = new Error('Something went wrong');
      logger.error('Failed operation', error);
      expect(console.error).toHaveBeenCalledWith(
        '[TestLogger] Failed operation',
        error
      );
    });

    it('should log with multiple error objects', () => {
      setLogLevel(LogLevel.ERROR);
      const logger = new Logger('TestLogger');
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      logger.error('Multiple errors', error1, error2);
      expect(console.error).toHaveBeenCalledWith(
        '[TestLogger] Multiple errors',
        error1,
        error2
      );
    });
  });

  describe('errorWithContext', () => {
    it('should log with context when level is ERROR', () => {
      setLogLevel(LogLevel.ERROR);
      const logger = new Logger('TestLogger');
      const context: LogContext = { requestId: 'req_123', action: 'delete' };
      logger.errorWithContext('Message', context);
      expect(console.error).toHaveBeenCalledWith(
        '[TestLogger] Message [req:req_123 action:delete]'
      );
    });

    it('should include metadata in error output', () => {
      setLogLevel(LogLevel.ERROR);
      const logger = new Logger('TestLogger');
      const error = new Error('Database error');
      const context: LogContext = {
        metadata: { errorCode: 500, message: error.message },
      };
      logger.errorWithContext('Message', context);
      expect(console.error).toHaveBeenCalledWith('[TestLogger] Message', {
        errorCode: 500,
        message: error.message,
      });
    });

    it('should include error object and metadata', () => {
      setLogLevel(LogLevel.ERROR);
      const logger = new Logger('TestLogger');
      const error = new Error('API error');
      const context: LogContext = {
        requestId: 'req_123',
        metadata: { endpoint: '/api/users', error: error.message },
      };
      logger.errorWithContext('Request failed', context, error);
      expect(console.error).toHaveBeenCalledWith(
        '[TestLogger] Request failed [req:req_123]',
        error,
        { endpoint: '/api/users', error: error.message }
      );
    });
  });

  describe('createLogger', () => {
    it('should create Logger instance with context', () => {
      const logger = createLogger('MyService');
      expect(logger).toBeInstanceOf(Logger);
      logger.info('Test');
      expect(console.info).toHaveBeenCalledWith('[MyService] Test');
    });

    it('should return new instance each call', () => {
      const logger1 = createLogger('Service1');
      const logger2 = createLogger('Service2');
      expect(logger1).not.toBe(logger2);
    });

    it('should create loggers with different contexts', () => {
      setLogLevel(LogLevel.INFO);
      const logger1 = createLogger('ServiceA');
      const logger2 = createLogger('ServiceB');

      logger1.info('Message from A');
      logger2.info('Message from B');

      expect(console.info).toHaveBeenCalledWith('[ServiceA] Message from A');
      expect(console.info).toHaveBeenCalledWith('[ServiceB] Message from B');
    });
  });

  describe('LogContext Interface', () => {
    it('should accept all optional fields', () => {
      const context: LogContext = {
        requestId: 'req_123',
        userId: 'user_456',
        component: 'Component',
        action: 'action',
        metadata: { key: 'value' },
      };
      expect(context.requestId).toBe('req_123');
      expect(context.userId).toBe('user_456');
      expect(context.component).toBe('Component');
      expect(context.action).toBe('action');
      expect(context.metadata).toEqual({ key: 'value' });
    });

    it('should accept partial context', () => {
      const context1: LogContext = { requestId: 'req_123' };
      const context2: LogContext = { userId: 'user_456' };
      const context3: LogContext = { metadata: { key: 'value' } };

      expect(context1.requestId).toBe('req_123');
      expect(context2.userId).toBe('user_456');
      expect(context3.metadata).toEqual({ key: 'value' });
    });

    it('should accept empty context', () => {
      const context: LogContext = {};
      expect(Object.keys(context)).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long messages', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('Test');
      const longMessage = 'x'.repeat(10000);
      logger.info(longMessage);
      expect(console.info).toHaveBeenCalledWith(`[Test] ${longMessage}`);
    });

    it('should handle special characters in messages', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('Test');
      const message = 'Message with \n\t\r special chars';
      logger.info(message);
      expect(console.info).toHaveBeenCalledWith(`[Test] ${message}`);
    });

    it('should handle undefined args', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('Test');
      logger.info('Message', undefined, undefined);
      expect(console.info).toHaveBeenCalledWith(
        '[Test] Message',
        undefined,
        undefined
      );
    });

    it('should handle null args', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('Test');
      logger.info('Message', null, null);
      expect(console.info).toHaveBeenCalledWith('[Test] Message', null, null);
    });

    it('should handle circular references in metadata', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('Test');
      const circular: any = { name: 'test' };
      circular.self = circular;
      const context: LogContext = { metadata: circular };

      expect(() => logger.infoWithContext('Message', context)).not.toThrow();
    });

    it('should handle arrays in args', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('Test');
      const array = [1, 2, 3, { key: 'value' }];
      logger.info('Message', array);
      expect(console.info).toHaveBeenCalledWith('[Test] Message', array);
    });

    it('should handle numbers as messages', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('Test');
      logger.info(123 as any);
      expect(console.info).toHaveBeenCalledWith('[Test] 123');
    });

    it('should handle empty strings as messages', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('Test');
      logger.info('');
      expect(console.info).toHaveBeenCalledWith('[Test] ');
    });

    it('should handle rapid logging without errors', () => {
      setLogLevel(LogLevel.INFO);
      const logger = new Logger('Test');
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`);
      }
      expect(console.info).toHaveBeenCalledTimes(1000);
    });
  });
});
