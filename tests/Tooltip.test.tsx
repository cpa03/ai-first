/**
 * Tooltip Component Tests
 *
 * Tests rendering, position arrow classes, keyboard shortcuts, hover/focus events, and Escape dismissal.
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tooltip from '@/components/Tooltip';

jest.useFakeTimers();

describe('Tooltip Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  describe('Basic Functionality & Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Tooltip content="Tooltip Content">
          <button>Hover Me</button>
        </Tooltip>
      );
      expect(screen.getByText('Hover Me')).toBeInTheDocument();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('shows tooltip content on mouse enter after delay', async () => {
      render(
        <Tooltip content="Tooltip Content" delay={100}>
          <button>Hover Me</button>
        </Tooltip>
      );

      const button = screen.getByText('Hover Me');
      fireEvent.mouseEnter(button.parentElement!);

      await act(async () => {
        jest.advanceTimersByTime(150);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Tooltip Content');
    });

    it('shows tooltip content on focus', async () => {
      render(
        <Tooltip content="Focus Tooltip" delay={100}>
          <button>Focus Me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Focus Me').parentElement!;
      fireEvent.focus(trigger);

      await act(async () => {
        jest.advanceTimersByTime(150);
      });

      expect(screen.getByRole('tooltip')).toHaveTextContent('Focus Tooltip');
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Tooltip Content" delay={100}>
          <button>Hover Me</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Hover Me').parentElement!;
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        jest.advanceTimersByTime(150);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.mouseLeave(trigger);

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('does not show tooltip when disabled is true', async () => {
      render(
        <Tooltip content="Disabled Tooltip" disabled delay={0}>
          <button>Disabled</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Disabled').parentElement!;
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts & Accessibility', () => {
    it('renders shortcut keys in tooltip when provided', async () => {
      render(
        <Tooltip content="Save File" shortcut={['Ctrl', 'S']} delay={0}>
          <button>Save</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Save').parentElement!;
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Save File');
      expect(tooltip).toHaveTextContent('Ctrl');
      expect(tooltip).toHaveTextContent('S');
    });

    it('hides tooltip when Escape key is pressed', async () => {
      render(
        <Tooltip content="Escape Me" delay={0}>
          <button>Escape Test</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Escape Test').parentElement!;
      fireEvent.mouseEnter(trigger);

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Arrow Position Classes', () => {
    it('applies correct top arrow class border-t-gray-800', async () => {
      render(
        <Tooltip content="Top Tooltip" position="top" delay={0}>
          <button>Top</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Top').parentElement!;
      jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
        top: 200,
        bottom: 220,
        left: 200,
        right: 250,
        width: 50,
        height: 20,
        x: 200,
        y: 200,
        toJSON: () => {},
      });

      fireEvent.mouseEnter(trigger);

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector('[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
      expect(arrow?.className).toContain('border-t-gray-800');
    });

    it('applies correct bottom arrow class border-b-gray-800', async () => {
      render(
        <Tooltip content="Bottom Tooltip" position="bottom" delay={0}>
          <button>Bottom</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Bottom').parentElement!;
      jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
        top: 200,
        bottom: 220,
        left: 200,
        right: 250,
        width: 50,
        height: 20,
        x: 200,
        y: 200,
        toJSON: () => {},
      });

      fireEvent.mouseEnter(trigger);

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector('[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
      expect(arrow?.className).toContain('border-b-gray-800');
    });

    it('applies correct left arrow class border-l-gray-800', async () => {
      render(
        <Tooltip content="Left Tooltip" position="left" delay={0}>
          <button>Left</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Left').parentElement!;
      jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
        top: 200,
        bottom: 220,
        left: 200,
        right: 250,
        width: 50,
        height: 20,
        x: 200,
        y: 200,
        toJSON: () => {},
      });

      fireEvent.mouseEnter(trigger);

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector('[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
      expect(arrow?.className).toContain('border-l-gray-800');
    });

    it('applies correct right arrow class border-r-gray-800', async () => {
      render(
        <Tooltip content="Right Tooltip" position="right" delay={0}>
          <button>Right</button>
        </Tooltip>
      );

      const trigger = screen.getByText('Right').parentElement!;
      jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
        top: 200,
        bottom: 220,
        left: 200,
        right: 250,
        width: 50,
        height: 20,
        x: 200,
        y: 200,
        toJSON: () => {},
      });

      fireEvent.mouseEnter(trigger);

      await act(async () => {
        jest.advanceTimersByTime(50);
      });

      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector('[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
      expect(arrow?.className).toContain('border-r-gray-800');
    });
  });
});
