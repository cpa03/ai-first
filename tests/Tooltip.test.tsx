/**
 * Tooltip Component Tests
 *
 * Tests tooltip accessibility, display toggling, positioning, keyboard shortcuts formatting, and touch interactions
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tooltip from '@/components/Tooltip';
import { PLATFORM } from '@/lib/dom-utils';

jest.useFakeTimers();

describe('Tooltip Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders trigger children correctly', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter and hides on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip content text" delay={100}>
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' }).parentElement!;

    fireEvent.mouseEnter(trigger);

    act(() => {
      jest.advanceTimersByTime(150);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Tooltip content text');

    fireEvent.mouseLeave(trigger);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus and hides on blur', async () => {
    render(
      <Tooltip content="Focus tooltip" delay={0}>
        <button>Focus Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Focus Trigger' }).parentElement!;

    fireEvent.focus(trigger);

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(trigger);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('dismisses tooltip when Escape key is pressed', async () => {
    render(
      <Tooltip content="Press escape" delay={0}>
        <button>Escape Trigger</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Escape Trigger' }).parentElement!;

    fireEvent.focus(trigger);

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('formats platform-aware shortcut keys correctly for Mac', async () => {
    jest.spyOn(PLATFORM, 'isMac').mockReturnValue(true);

    render(
      <Tooltip content="Copy text" shortcut={['⌘', 'C']} delay={0}>
        <button>Copy</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Copy' }).parentElement!;

    fireEvent.mouseEnter(trigger);

    act(() => {
      jest.advanceTimersByTime(50);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('⌘');
    expect(tooltip).toHaveTextContent('C');
  });

  it('formats platform-aware shortcut keys correctly for Windows/Non-Mac', async () => {
    jest.spyOn(PLATFORM, 'isMac').mockReturnValue(false);

    render(
      <Tooltip content="Copy text" shortcut={['⌘', 'C']} delay={0}>
        <button>Copy</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Copy' }).parentElement!;

    fireEvent.mouseEnter(trigger);

    act(() => {
      jest.advanceTimersByTime(50);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Ctrl');
    expect(tooltip).toHaveTextContent('C');
  });

  it('handles touch interactions correctly', async () => {
    render(
      <Tooltip content="Touch tooltip" delay={0}>
        <button>Touch Target</button>
      </Tooltip>
    );

    const trigger = screen.getByRole('button', { name: 'Touch Target' }).parentElement!;

    fireEvent.touchStart(trigger);

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.touchEnd(trigger);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
