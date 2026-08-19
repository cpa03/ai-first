/**
 * Alert Component Tests
 *
 * Tests keyboard shortcuts, auto-dismiss, snooze, and accessibility
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from '@/components/Alert';

jest.useFakeTimers();

describe('Alert Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  describe('Keyboard Shortcuts', () => {
    it('should dismiss alert when "d" key is pressed', async () => {
      const onClose = jest.fn();
      await act(async () => {
        render(
          <Alert type="error" onClose={onClose}>
            Error message
          </Alert>
        );
      });

      const alert = screen.getByRole('alert');
      await act(async () => {
        fireEvent.keyDown(alert, { key: 'd' });
        jest.advanceTimersByTime(200);
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should dismiss alert when "Escape" key is pressed', async () => {
      const onClose = jest.fn();
      await act(async () => {
        render(
          <Alert type="error" onClose={onClose}>
            Error message
          </Alert>
        );
      });

      const alert = screen.getByRole('alert');
      await act(async () => {
        fireEvent.keyDown(alert, { key: 'Escape' });
        jest.advanceTimersByTime(200);
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not dismiss alert when "d" is pressed without onClose', async () => {
      await act(async () => {
        render(<Alert type="error">Error message</Alert>);
      });

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      await act(async () => {
        fireEvent.keyDown(alert, { key: 'd' });
        jest.advanceTimersByTime(200);
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should not snooze alert when "s" is pressed on non-auto-dismiss alert', async () => {
      const onClose = jest.fn();
      await act(async () => {
        render(
          <Alert type="error" onClose={onClose}>
            Error message
          </Alert>
        );
      });

      const alert = screen.getByRole('alert');
      await act(async () => {
        fireEvent.keyDown(alert, { key: 's' });
        jest.advanceTimersByTime(200);
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should snooze alert when "s" is pressed on auto-dismiss alert', async () => {
      const onClose = jest.fn();
      await act(async () => {
        render(
          <Alert type="success" onClose={onClose} autoDismiss>
            Success message
          </Alert>
        );
      });

      const alert = screen.getByRole('alert');
      await act(async () => {
        fireEvent.keyDown(alert, { key: 's' });
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have tabIndex for keyboard focusability', async () => {
      await act(async () => {
        render(<Alert type="info">Info message</Alert>);
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('tabindex', '0');
    });

    it('should have correct aria-live for error alerts', async () => {
      await act(async () => {
        render(<Alert type="error">Error message</Alert>);
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have correct aria-live for info alerts', async () => {
      await act(async () => {
        render(<Alert type="info">Info message</Alert>);
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('should include dismiss shortcut hint in aria-label when onClose is provided', async () => {
      await act(async () => {
        render(
          <Alert type="error" onClose={jest.fn()}>
            Error message
          </Alert>
        );
      });

      const alert = screen.getByRole('alert');
      const ariaLabel = alert.getAttribute('aria-label');
      expect(ariaLabel).not.toContain('Press s to snooze');
      expect(ariaLabel).toContain('Press d to dismiss');
    });

    it('should include snooze shortcut hint in aria-label only when autoDismiss is enabled', async () => {
      await act(async () => {
        render(
          <Alert type="info" onClose={jest.fn()} autoDismiss>
            Info message
          </Alert>
        );
      });

      const alert = screen.getByRole('alert');
      const ariaLabel = alert.getAttribute('aria-label');
      expect(ariaLabel).toContain('Press s to snooze');
      expect(ariaLabel).toContain('Press d to dismiss');
    });

    it('should show shortcut hint container on focus when onClose is provided', async () => {
      await act(async () => {
        render(
          <Alert type="info" onClose={jest.fn()}>
            Info message
          </Alert>
        );
      });

      const alert = screen.getByRole('alert');
      await act(async () => {
        fireEvent.focus(alert);
      });

      const hintText = screen.getByText('dismiss');
      expect(hintText).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should render different alert types with correct styles', () => {
      const { rerender } = render(<Alert type="error">Error</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<Alert type="warning">Warning</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<Alert type="info">Info</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();

      rerender(<Alert type="success">Success</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should show close button when onClose is provided', async () => {
      await act(async () => {
        render(
          <Alert type="error" onClose={jest.fn()}>
            Error message
          </Alert>
        );
      });

      expect(screen.getByLabelText('Dismiss alert')).toBeInTheDocument();
    });

    it('should not show close button when onClose is not provided', async () => {
      await act(async () => {
        render(<Alert type="error">Error message</Alert>);
      });

      expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
    });
  });
});
