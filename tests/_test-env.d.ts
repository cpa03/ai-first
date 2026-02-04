/**
 * Test environment type declarations
 */

declare global {
  // Mock for fetch with Jest methods
  var fetch: jest.Mock<Promise<Response>>;

  // Mock for localStorage/sessionStorage defined in jest.setup.js
  var localStorageMock: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear: jest.Mock;
    mockClear: () => void;
  };

  var sessionStorageMock: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear: jest.Mock;
    mockClear: () => void;
  };

  // Performance API mocks
  var performance: {
    mark: jest.Mock;
    measure: jest.Mock;
    clearMarks: jest.Mock;
    clearMeasures: jest.Mock;
    getEntriesByName: jest.Mock;
    getEntriesByType: jest.Mock;
    now: jest.Mock;
  };

  // WebSocket mock
  var WebSocket: jest.Mock;
}

// Type augmentations for Jest mocks
type MockedFunction<T extends (...args: any[]) => any> = jest.Mock<
  ReturnType<T>,
  Parameters<T>
>;

type MockedClass<T extends new (...args: any[]) => any> = jest.MockedClass<T>;

export {};
