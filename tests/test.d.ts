/**
 * Test environment type declarations
 */

import { AIModelConfig } from '../src/lib/ai';

declare global {
  namespace NodeJS {
    interface Global {
      fetch: jest.Mock<Promise<Response>>;
      localStorageMock: {
        getItem: jest.Mock;
        setItem: jest.Mock;
        removeItem: jest.Mock;
        clear: jest.Mock;
        mockClear: () => void;
      };
      sessionStorageMock: {
        getItem: jest.Mock;
        setItem: jest.Mock;
        removeItem: jest.Mock;
        clear: jest.Mock;
        mockClear: () => void;
      };
      performance: {
        mark: jest.Mock;
        measure: jest.Mock;
        clearMarks: jest.Mock;
        clearMeasures: jest.Mock;
        getEntriesByName: jest.Mock;
        getEntriesByType: jest.Mock;
        now: jest.Mock;
        marks: Record<string, any>;
        measures: Record<string, any>;
      };
      WebSocket: jest.Mock;
    }
  }
}

// Type augmentations for Jest mocks
type MockedFunction<T extends (...args: any[]) => any> = jest.Mock<
  ReturnType<T>,
  Parameters<T>
>;

type MockedClass<T extends new (...args: any[]) => any> = jest.MockedClass<T>;

export {};
