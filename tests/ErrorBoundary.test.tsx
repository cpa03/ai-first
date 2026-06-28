import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '@/components/ErrorBoundary';

const ThrowingComponent = () => {
  throw new Error('Test error');
};

const GoodComponent = () => <div>Child content</div>;

describe('ErrorBoundary', () => {
  describe('keyboard shortcut hints', () => {
    it('renders Enter key hint near retry button when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const enterHint = screen.getByText('Enter');
      expect(enterHint).toBeInTheDocument();
      expect(enterHint.tagName).toBe('KBD');
    });

    it('renders Escape key hint near home button when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const escHint = screen.getByText('Esc');
      expect(escHint).toBeInTheDocument();
      expect(escHint.tagName).toBe('KBD');
    });

    it('shows "to retry" label next to Enter hint', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('to retry')).toBeInTheDocument();
    });

    it('shows "to go home" label next to Escape hint', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('to go home')).toBeInTheDocument();
    });

    it('keyboard hints are hidden on mobile (hidden sm:flex)', () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      const hints = screen.getAllByText(/^(Enter|Esc)$/);
      hints.forEach((hint) => {
        const parentSpan = hint.closest('span');
        expect(parentSpan?.className).toContain('hidden sm:flex');
      });
    });
  });

  describe('renders children when no error', () => {
    it('renders children correctly', () => {
      render(
        <ErrorBoundary>
          <GoodComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });
});
