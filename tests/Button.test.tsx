import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '@/components/Button';

describe('Button', () => {
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
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
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
});
