import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScrollToTop from '../src/components/ScrollToTop';

const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: mockScrollTo,
});

describe('ScrollToTop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    });
  });

  it('should not render when scroll position is below threshold', () => {
    render(<ScrollToTop showAt={400} />);
    expect(
      screen.queryByLabelText(/Scroll to top of page/)
    ).not.toBeInTheDocument();
  });

  it('should render when scroll position is above threshold', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} />);

    fireEvent.scroll(window);

    expect(screen.getByLabelText(/Scroll to top of page/)).toBeInTheDocument();
  });

  it('should scroll to top when clicked', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} smooth={true} />);

    fireEvent.scroll(window);
    const button = screen.getByLabelText(/Scroll to top of page/);
    fireEvent.click(button);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('should scroll instantly when smooth is false', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} smooth={false} />);

    fireEvent.scroll(window);
    const button = screen.getByLabelText(/Scroll to top of page/);
    fireEvent.click(button);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'auto',
    });
  });

  it('should respond to Enter key press', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} />);

    fireEvent.scroll(window);
    const button = screen.getByLabelText(/Scroll to top of page/);
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockScrollTo).toHaveBeenCalled();
  });

  it('should respond to Space key press', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} />);

    fireEvent.scroll(window);
    const button = screen.getByLabelText(/Scroll to top of page/);
    fireEvent.keyDown(button, { key: ' ' });

    expect(mockScrollTo).toHaveBeenCalled();
  });

  it('should have correct accessibility attributes', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} />);

    fireEvent.scroll(window);
    const button = screen.getByLabelText(/Scroll to top of page/);
    const wrapper = button.closest('div[aria-live="polite"]');

    expect(button).toHaveAttribute('type', 'button');
    expect(wrapper).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Back to top')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} className="custom-class" />);

    fireEvent.scroll(window);
    const button = screen.getByLabelText(/Scroll to top of page/);
    const wrapper = button.closest('.custom-class');

    expect(wrapper).toBeInTheDocument();
  });

  it('should use default showAt value of 400', () => {
    Object.defineProperty(window, 'scrollY', { value: 350, writable: true });
    render(<ScrollToTop />);

    fireEvent.scroll(window);

    expect(
      screen.queryByLabelText(/Scroll to top of page/)
    ).not.toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { value: 450, writable: true });
    fireEvent.scroll(window);

    expect(screen.getByLabelText(/Scroll to top of page/)).toBeInTheDocument();
  });

  it('should remove event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<ScrollToTop />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });
});
