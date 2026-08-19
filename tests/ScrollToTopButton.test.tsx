import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScrollToTopButton from '@/components/ScrollToTopButton';

const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: mockScrollTo,
});

describe('ScrollToTopButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the scroll to top button correctly', () => {
    render(<ScrollToTopButton />);
    const button = screen.getByRole('button', { name: /Scroll to top/ });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Scroll to top')).toBeInTheDocument();
  });

  it('scrolls to top when clicked', () => {
    render(<ScrollToTopButton />);
    const button = screen.getByRole('button', { name: /Scroll to top/ });
    fireEvent.click(button);

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('scrolls to top when Enter key is pressed', () => {
    render(<ScrollToTopButton />);
    const button = screen.getByRole('button', { name: /Scroll to top/ });
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('scrolls to top when Space key is pressed', () => {
    render(<ScrollToTopButton />);
    const button = screen.getByRole('button', { name: /Scroll to top/ });
    fireEvent.keyDown(button, { key: ' ' });

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('sets isHoveredOrFocused state on hover', () => {
    render(<ScrollToTopButton />);
    const button = screen.getByRole('button', { name: /Scroll to top/ });
    const svg = button.querySelector('svg');

    // Initially should have translation if hovered (default mock motion is standard)
    expect(svg).not.toHaveClass('-translate-y-0.5');

    fireEvent.mouseEnter(button);
    expect(svg).toHaveClass('-translate-y-0.5');

    fireEvent.mouseLeave(button);
    expect(svg).not.toHaveClass('-translate-y-0.5');
  });

  it('sets isHoveredOrFocused state on focus', () => {
    render(<ScrollToTopButton />);
    const button = screen.getByRole('button', { name: /Scroll to top/ });
    const svg = button.querySelector('svg');

    expect(svg).not.toHaveClass('-translate-y-0.5');

    fireEvent.focus(button);
    expect(svg).toHaveClass('-translate-y-0.5');

    fireEvent.blur(button);
    expect(svg).not.toHaveClass('-translate-y-0.5');
  });
});
