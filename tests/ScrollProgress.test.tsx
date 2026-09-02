import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ScrollProgress from '@/components/ScrollProgress';

describe('ScrollProgress Component', () => {
  let originalScrollY: number;
  let originalScrollTo: typeof window.scrollTo;

  beforeEach(() => {
    originalScrollY = window.scrollY;
    originalScrollTo = window.scrollTo;

    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'innerHeight', {
      value: 1000,
      writable: true,
      configurable: true,
    });

    window.scrollTo = jest.fn((options) => {
      if (typeof options === 'object' && options !== null && 'top' in options) {
        window.scrollY = options.top || 0;
      }
    }) as unknown as typeof window.scrollTo;

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(performance.now());
      return null as unknown as number;
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', {
      value: originalScrollY,
      writable: true,
      configurable: true,
    });
    window.scrollTo = originalScrollTo;
    jest.restoreAllMocks();
  });

  it('renders null when scrolled less than 1%', () => {
    window.scrollY = 5; // 5 / 1000 = 0.5%
    const { container } = render(<ScrollProgress />);

    act(() => {
      fireEvent.scroll(window);
    });

    expect(container.firstChild).toBeNull();
  });

  it('renders progress bar when scrolled >= 1%', () => {
    window.scrollY = 200; // 200 / 1000 = 20%
    render(<ScrollProgress />);

    act(() => {
      fireEvent.scroll(window);
    });

    const slider = screen.getByRole('slider');
    expect(slider).toBeDefined();
    expect(slider.getAttribute('aria-valuenow')).toBe('20');
  });

  it('skips redundant state updates when scroll delta is < 0.1%', () => {
    window.scrollY = 200; // 20%
    render(<ScrollProgress />);

    act(() => {
      fireEvent.scroll(window);
    });

    const slider = screen.getByRole('slider');
    expect(slider.getAttribute('aria-valuenow')).toBe('20');

    // Small scroll delta: 0.2px out of 1000px = 0.02% (< 0.1%)
    act(() => {
      window.scrollY = 200.2;
      fireEvent.scroll(window);
    });

    // aria-valuenow is Math.round(scrollPercent), should remain 20
    expect(slider.getAttribute('aria-valuenow')).toBe('20');

    // Larger scroll delta: 10px out of 1000px = 1.0% (>= 0.1%)
    act(() => {
      window.scrollY = 210;
      fireEvent.scroll(window);
    });

    // aria-valuenow updates to 21
    expect(slider.getAttribute('aria-valuenow')).toBe('21');
  });

  it('handles keyboard navigation correctly', () => {
    window.scrollY = 500; // 50%
    render(<ScrollProgress />);

    act(() => {
      fireEvent.scroll(window);
    });

    const slider = screen.getByRole('slider');

    act(() => {
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 550,
      behavior: 'smooth',
    });

    act(() => {
      fireEvent.keyDown(slider, { key: 'Home' });
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });

    act(() => {
      fireEvent.keyDown(slider, { key: 'End' });
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 1000,
      behavior: 'smooth',
    });
  });

  it('handles touch drag events correctly', () => {
    window.scrollY = 200; // 20%
    render(<ScrollProgress />);

    act(() => {
      fireEvent.scroll(window);
    });

    const slider = screen.getByRole('slider');

    // Mock getBoundingClientRect for width calculation (e.g., bar width = 500px)
    jest.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 500,
      height: 10,
      right: 500,
      bottom: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Touch start at 250px (50% of width)
    act(() => {
      fireEvent.touchStart(slider, {
        touches: [{ clientX: 250 }],
      });
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 500, // 50% of 1000px scrollable height
      behavior: 'smooth',
    });

    // Touch move to 375px (75% of width)
    act(() => {
      fireEvent.touchMove(slider, {
        touches: [{ clientX: 375 }],
      });
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 750, // 75% of 1000px
      behavior: 'smooth',
    });

    // Touch end
    act(() => {
      fireEvent.touchEnd(slider);
    });
  });
});
