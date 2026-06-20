import { cn } from '@/lib/utils';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Mock tailwind-merge to verify when it's called
jest.mock('tailwind-merge', () => ({
  twMerge: jest.fn((str) => str),
}));

describe('cn optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should bypass twMerge for empty class strings', () => {
    const result = cn('');
    expect(result).toBe('');
    expect(twMerge).not.toHaveBeenCalled();
  });

  it('should bypass twMerge for single class strings', () => {
    const result = cn('px-4');
    expect(result).toBe('px-4');
    expect(twMerge).not.toHaveBeenCalled();
  });

  it('should bypass twMerge for multiple inputs that resolve to a single class', () => {
    const result = cn('px-4', false && 'py-2', null, undefined);
    expect(result).toBe('px-4');
    expect(twMerge).not.toHaveBeenCalled();
  });

  it('should NOT bypass twMerge for multiple classes', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toBe('px-4 py-2');
    expect(twMerge).toHaveBeenCalledTimes(1);
    expect(twMerge).toHaveBeenCalledWith('px-4 py-2');
  });

  it('should NOT bypass twMerge for conflicting classes (even if single string)', () => {
    // Note: if it's a single string with a space, it won't bypass
    const result = cn('px-4 px-8');
    expect(result).toBe('px-4 px-8'); // twMerge mock just returns input
    expect(twMerge).toHaveBeenCalledTimes(1);
    expect(twMerge).toHaveBeenCalledWith('px-4 px-8');
  });

  it('should handle complex conditional single class', () => {
    const isActive = true;
    const result = cn({ 'bg-blue-500': isActive, 'bg-red-500': !isActive });
    expect(result).toBe('bg-blue-500');
    expect(twMerge).not.toHaveBeenCalled();
  });
});
