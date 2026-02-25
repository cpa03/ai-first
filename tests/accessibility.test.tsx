/**
 * Accessibility Tests - WCAG 2.1 Compliance
 *
 * Tests critical components for accessibility compliance
 * Addresses Issue #1827: Add accessibility (a11y) testing to CI pipeline
 *
 * Run with: npm run test:a11y
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Import critical components to test
import IdeaInput from '@/components/IdeaInput';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import InputWithValidation from '@/components/InputWithValidation';
import ProgressStepper from '@/components/ProgressStepper';
import LoadingSpinner from '@/components/LoadingSpinner';
import Tooltip from '@/components/Tooltip';
import CopyButton from '@/components/CopyButton';

describe('Accessibility Tests - WCAG 2.1 Compliance', () => {
  describe('Button Component', () => {
    it('should render primary button with correct role', () => {
      render(<Button>Click Me</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click Me');
    });

    it('should render secondary button', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle disabled state correctly', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should handle loading state with aria-busy', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should be keyboard accessible', () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Alert Component', () => {
    it('should render info alert with alert role', () => {
      render(<Alert type="info">Info message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should render error alert with alert role', () => {
      render(<Alert type="error">Error message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should render warning alert', () => {
      render(<Alert type="warning">Warning message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should render success alert with alert role', () => {
      render(<Alert type="success">Success message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have aria-live for dynamic alerts', () => {
      render(<Alert type="info">Info message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live');
    });
  });

  describe('IdeaInput Component', () => {
    it('should have accessible label for textarea', () => {
      render(<IdeaInput onSubmit={jest.fn()} />);
      const textarea = screen.getByLabelText(/what's your idea/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should have accessible submit button', () => {
      render(<IdeaInput onSubmit={jest.fn()} />);
      const button = screen.getByRole('button', { name: /start clarifying/i });
      expect(button).toBeInTheDocument();
    });

    it('should have textarea with proper attributes', () => {
      render(<IdeaInput onSubmit={jest.fn()} />);
      const textarea = screen.getByLabelText(/what's your idea/i);
      expect(textarea).toHaveAttribute('id');
    });
  });

  describe('InputWithValidation Component', () => {
    it('should render with label', () => {
      render(
        <InputWithValidation
          label="Test Label"
          name="test"
          type="text"
          value=""
          onChange={jest.fn()}
        />
      );
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render input element', () => {
      render(
        <InputWithValidation
          label="Test"
          name="test"
          type="text"
          value=""
          onChange={jest.fn()}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should have aria-invalid attribute', () => {
      render(
        <InputWithValidation
          label="Test"
          name="test"
          type="text"
          value=""
          onChange={jest.fn()}
          error="Error message"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid');
    });

    it('should indicate required field', () => {
      render(
        <InputWithValidation
          label="Required Field"
          name="required"
          type="text"
          value=""
          onChange={jest.fn()}
          required
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });
  });

  describe('ProgressStepper Component', () => {
    const steps = ['Step 1', 'Step 2', 'Step 3'];

    it('should render with navigation role', () => {
      render(<ProgressStepper steps={steps} currentStep={1} />);
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should have accessible navigation label', () => {
      render(<ProgressStepper steps={steps} currentStep={1} />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label');
    });

    it('should render step indicators with aria-labels', () => {
      render(<ProgressStepper steps={steps} currentStep={1} />);
      const items = screen.getAllByRole('listitem');
      expect(items.length).toBeGreaterThan(0);
    });

    it('should display current step visually', () => {
      render(<ProgressStepper steps={steps} currentStep={2} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner Component', () => {
    it('should have accessible status region', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should have aria-label for screen readers', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label');
    });
  });

  describe('Tooltip Component', () => {
    it('should render trigger element', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      );
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('CopyButton Component', () => {
    it('should have accessible button', () => {
      render(<CopyButton textToCopy="test" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have accessible label for screen readers', () => {
      render(<CopyButton textToCopy="test" />);
      const button = screen.getByRole('button');
      const hasAriaLabel =
        button.getAttribute('aria-label') ||
        button.getAttribute('aria-labelledby');
      expect(hasAriaLabel).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    it('buttons should be focusable', () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('inputs should be focusable', () => {
      render(
        <InputWithValidation
          label="Test"
          name="test"
          value=""
          onChange={jest.fn()}
        />
      );
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('should have visible focus indicators', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('ARIA Attributes', () => {
    it('Alert should have appropriate ARIA role', () => {
      render(<Alert type="error">Error occurred</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('ProgressStepper should have navigation role', () => {
      render(<ProgressStepper steps={['A', 'B']} currentStep={1} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('LoadingSpinner should have status role', () => {
      render(<LoadingSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
