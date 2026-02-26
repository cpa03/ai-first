/**
 * Accessibility Axe Tests - WCAG 2.1 Compliance
 *
 * Automated accessibility testing using axe-core.
 * Run with: npm run test:a11y
 *
 * @see https://github.com/dequelabs/axe-core
 * @see https://www.w3.org/WAI/WCAG21/quickref/
 */

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import InputWithValidation from '@/components/InputWithValidation';
import Tooltip from '@/components/Tooltip';
import MobileNav from '@/components/MobileNav';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Axe Tests - WCAG 2.1', () => {
  describe('Button Component', () => {
    it('primary button should have no axe violations', async () => {
      const { container } = render(<Button variant="primary">Click Me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('secondary button should have no axe violations', async () => {
      const { container } = render(
        <Button variant="secondary">Click Me</Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('loading button should have no axe violations', async () => {
      const { container } = render(<Button loading>Loading</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('disabled button should have no axe violations', async () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('outline button should have no axe violations', async () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ghost button should have no axe violations', async () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Alert Component', () => {
    it('error alert should have no axe violations', async () => {
      const { container } = render(
        <Alert type="error" title="Error">
          Error occurred
        </Alert>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('info alert should have no axe violations', async () => {
      const { container } = render(
        <Alert type="info" title="Info">
          Info message
        </Alert>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('warning alert should have no axe violations', async () => {
      const { container } = render(
        <Alert type="warning" title="Warning">
          Warning message
        </Alert>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('success alert should have no axe violations', async () => {
      const { container } = render(
        <Alert type="success" title="Success">
          Success!
        </Alert>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('dismissible alert should have no axe violations', async () => {
      const { container } = render(
        <Alert type="info" onClose={() => {}}>
          Dismissible
        </Alert>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('InputWithValidation Component', () => {
    it('basic input should have no axe violations', async () => {
      const { container } = render(
        <InputWithValidation
          label="Email"
          id="test-email"
          name="email"
          type="email"
          value=""
          onChange={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('input with error should have no axe violations', async () => {
      const { container } = render(
        <InputWithValidation
          label="Email"
          id="test-email-error"
          name="email"
          type="email"
          value="invalid"
          onChange={() => {}}
          error="Invalid email"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('required input should have no axe violations', async () => {
      const { container } = render(
        <InputWithValidation
          label="Name"
          id="test-name"
          name="name"
          type="text"
          value=""
          onChange={() => {}}
          required
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('input with help text should have no axe violations', async () => {
      const { container } = render(
        <InputWithValidation
          label="Password"
          id="test-password"
          name="password"
          type="password"
          value=""
          onChange={() => {}}
          helpText="Must be at least 8 characters"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('textarea should have no axe violations', async () => {
      const { container } = render(
        <InputWithValidation
          label="Message"
          id="test-message"
          name="message"
          value=""
          onChange={() => {}}
          multiline
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Tooltip Component', () => {
    it('basic tooltip should have no axe violations', async () => {
      const { container } = render(
        <Tooltip content="Helpful tip">
          <button>Hover me</button>
        </Tooltip>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('tooltip with string content should have no axe violations', async () => {
      const { container } = render(
        <Tooltip content="Rich content">
          <button>Hover me</button>
        </Tooltip>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('MobileNav Component', () => {
    it('mobile nav should have no axe violations', async () => {
      const { container } = render(<MobileNav />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
