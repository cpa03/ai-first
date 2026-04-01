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
    expect(screen.queryByLabelText(/Back to top/)).not.toBeInTheDocument();
  });

  it('should render when scroll position is above threshold', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} />);

    fireEvent.scroll(window);

    expect(screen.getByLabelText(/Back to top/)).toBeInTheDocument();
  });

  it('should scroll to top when clicked', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} smooth={true} />);

    fireEvent.scroll(window);
    const button = screen.getByLabelText(/Back to top/);
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
    const button = screen.getByLabelText(/Back to top/);
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
    const button = screen.getByLabelText(/Back to top/);
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockScrollTo).toHaveBeenCalled();
  });

  it('should respond to Space key press', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} />);

    fireEvent.scroll(window);
    const button = screen.getByLabelText(/Back to top/);
    fireEvent.keyDown(button, { key: ' ' });

    expect(mockScrollTo).toHaveBeenCalled();
  });

  it('should have correct accessibility attributes', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop showAt={400} />);

    fireEvent.scroll(window);
    const button = screen.getByLabelText(/Back to top/);

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-live', 'polite');
  });

  it('should apply custom className to the container', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    const { container } = render(
      <ScrollToTop showAt={400} className="custom-class" />
    );

    fireEvent.scroll(window);
    const wrapper = container.firstChild;

    expect(wrapper).toHaveClass('custom-class');
  });

  it('should use default showAt value of 400', () => {
    Object.defineProperty(window, 'scrollY', { value: 350, writable: true });
    render(<ScrollToTop />);

    fireEvent.scroll(window);

    expect(screen.queryByLabelText(/Back to top/)).not.toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { value: 450, writable: true });
    fireEvent.scroll(window);

    expect(screen.getByLabelText(/Back to top/)).toBeInTheDocument();
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
