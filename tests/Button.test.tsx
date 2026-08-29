import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Button from '@/components/Button';
import Tooltip from '@/components/Tooltip';

describe('Button', () => {
  describe('keyboard shortcut tooltip', () => {
    it('shows tooltip with keyboard shortcut on hover when shortcut prop is provided', async () => {
      const user = userEvent.setup();
      render(<Button shortcut={['⌘', 'S']}>Save</Button>);
      const button = screen.getByRole('button', { name: /save/i });

      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // In test environment (Linux), ⌘ is converted to Ctrl
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
    });

    it('does not show tooltip when shortcut prop is not provided', async () => {
      const user = userEvent.setup();
      render(<Button>Save</Button>);
      const button = screen.getByRole('button', { name: /save/i });

      await user.hover(button);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('does not show tooltip when button is disabled', async () => {
      const user = userEvent.setup();
      render(
        <Button shortcut={['⌘', 'S']} disabled>
          Save
        </Button>
      );
      const button = screen.getByRole('button', { name: /save/i });

      await user.hover(button);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('does not show tooltip when button is loading', async () => {
      const user = userEvent.setup();
      render(
        <Button shortcut={['⌘', 'S']} loading>
          Loading
        </Button>
      );
      const button = screen.getByRole('button', { name: /loading/i });

      await user.hover(button);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('converts ⌘ to Ctrl on non-Mac platforms', async () => {
      const user = userEvent.setup();
      Object.defineProperty(window.navigator, 'platform', {
        value: 'Win32',
        configurable: true,
      });

      render(<Button shortcut={['⌘', 'S']}>Save</Button>);
      const button = screen.getByRole('button', { name: /save/i });

      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
    });

    it('does not render separator border-l when content is empty and only shortcut is provided', async () => {
      const user = userEvent.setup();
      render(<Button shortcut={['⌘', 'S']}>Save</Button>);
      const button = screen.getByRole('button', { name: /save/i });

      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      const ctrlElement = screen.getByText('Ctrl');
      const container = ctrlElement.parentElement;
      expect(container).not.toHaveClass('border-l');
    });

    it('renders separator border-l when both content and shortcut are provided in Tooltip', async () => {
      const user = userEvent.setup();
      render(
        <Tooltip content="Tooltip content" shortcut={['⌘', 'S']}>
          <button>Hover me</button>
        </Tooltip>
      );
      const button = screen.getByRole('button', { name: /hover me/i });

      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      expect(screen.getByText('Tooltip content')).toBeInTheDocument();
      const ctrlElement = screen.getByText('Ctrl');
      const container = ctrlElement.parentElement;
      expect(container).toHaveClass('border-l');
    });
  });

  describe('tactile feedback and accessibility', () => {
    it('applies tactile hover and active scale feedback when enabled', () => {
      render(<Button variant="primary">Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });

      expect(button.className).toContain('hover:scale-[1.02]');
      expect(button.className).toContain('active:scale-[0.98]');
    });

    it('suppresses active scale feedback when disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });

      expect(button.className).toContain('hover:scale-100');
      expect(button.className).toContain('active:scale-100');
    });
  });

  describe('focus ring accessibility', () => {
    it('primary variant has primary focus ring color', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button', { name: /primary/i });

      expect(button.className).toContain('focus-visible:ring-primary-500');
    });

    it('secondary variant has gray focus ring color', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button', { name: /secondary/i });

      expect(button.className).toContain('focus-visible:ring-gray-500');
    });

    it('outline variant has gray focus ring color', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button', { name: /outline/i });

      expect(button.className).toContain('focus-visible:ring-gray-500');
    });

    it('ghost variant has gray focus ring color', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button', { name: /ghost/i });

      expect(button.className).toContain('focus-visible:ring-gray-500');
    });
  });

  describe('basic functionality', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole('button', { name: /click me/i })
      ).toBeInTheDocument();
    });

    it('has aria-busy when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });

      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('is disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });

      expect(button).toBeDisabled();
    });

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });

      expect(button).toBeDisabled();
    });
  });

  describe('accessibility - reduced motion', () => {
    it('calls onClick even when ripple animation is skipped', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });

      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not create ripple elements when button is disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      const button = screen.getByRole('button', { name: /disabled/i });

      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
      expect(
        button.querySelector('span.animate-ripple')
      ).not.toBeInTheDocument();
    });
  });
});
