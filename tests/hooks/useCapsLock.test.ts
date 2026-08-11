import { renderHook, act } from '@testing-library/react';
import { useCapsLock } from '@/hooks/useCapsLock';

describe('useCapsLock Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  const createMockEvent = (capsLockOn: boolean, key: string = '') => {
    return {
      key,
      getModifierState: (modifier: string) => {
        if (modifier === 'CapsLock') {
          return capsLockOn;
        }
        return false;
      },
    } as unknown as React.KeyboardEvent<HTMLInputElement> & React.FocusEvent<HTMLInputElement>;
  };

  it('should initialize with Caps Lock off', () => {
    const { result } = renderHook(() => useCapsLock());
    expect(result.current.isCapsLockOn).toBe(false);
  });

  it('should update state to true on keydown when Caps Lock is active', () => {
    const { result } = renderHook(() => useCapsLock());

    act(() => {
      result.current.handleKeyDown(createMockEvent(true));
    });

    expect(result.current.isCapsLockOn).toBe(true);
  });

  it('should update state to false on keyup when Caps Lock is inactive', () => {
    const { result } = renderHook(() => useCapsLock());

    act(() => {
      result.current.handleKeyDown(createMockEvent(true));
    });
    expect(result.current.isCapsLockOn).toBe(true);

    act(() => {
      result.current.handleKeyUp(createMockEvent(false));
    });

    expect(result.current.isCapsLockOn).toBe(false);
  });

  it('should reset state on blur', () => {
    const { result } = renderHook(() => useCapsLock());

    act(() => {
      result.current.handleKeyDown(createMockEvent(true));
    });
    expect(result.current.isCapsLockOn).toBe(true);

    act(() => {
      result.current.handleBlur();
    });

    expect(result.current.isCapsLockOn).toBe(false);
  });

  it('should handle global events', () => {
    const { result } = renderHook(() => useCapsLock());

    // Fire a global keyboard event
    const keyboardEvent = new KeyboardEvent('keydown');
    Object.defineProperty(keyboardEvent, 'getModifierState', {
      value: (modifier: string) => modifier === 'CapsLock',
    });

    act(() => {
      window.dispatchEvent(keyboardEvent);
    });

    expect(result.current.isCapsLockOn).toBe(true);

    // Fire a global mouse down event
    const mouseEvent = new MouseEvent('mousedown');
    Object.defineProperty(mouseEvent, 'getModifierState', {
      value: (modifier: string) => modifier === 'CapsLock',
    });

    act(() => {
      window.dispatchEvent(mouseEvent);
    });

    expect(result.current.isCapsLockOn).toBe(true);
  });
});
