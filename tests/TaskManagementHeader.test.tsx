import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskManagementHeader } from '@/components/task-management/TaskManagementHeader';

describe('TaskManagementHeader', () => {
  const mockProps = {
    totalDeliverables: 3,
    totalTasks: 10,
    completedTasks: 4,
    totalHours: 20,
    completedHours: 8,
    overallProgress: 40,
    onExpandAll: jest.fn(),
    onCollapseAll: jest.fn(),
    onScrollToNextIncomplete: jest.fn(),
    hasNextIncomplete: true,
    statusFilter: 'all' as const,
    onFilterChange: jest.fn(),
    filterCounts: { all: 10, in_progress: 6, completed: 4 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders filter radio buttons with descriptive aria-labels', () => {
    render(<TaskManagementHeader {...mockProps} />);

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(3);

    expect(radioButtons[0]).toHaveAttribute(
      'aria-label',
      'Filter by All tasks, 10 tasks available, selected'
    );
    expect(radioButtons[1]).toHaveAttribute(
      'aria-label',
      'Filter by In Progress tasks, 6 tasks available'
    );
    expect(radioButtons[2]).toHaveAttribute(
      'aria-label',
      'Filter by Completed tasks, 4 tasks available'
    );
  });

  it('handles clicking filter buttons, triggers onFilterChange, and includes active scale styling', () => {
    render(<TaskManagementHeader {...mockProps} />);

    const inProgressButton = screen.getByRole('radio', {
      name: /Filter by In Progress tasks/i,
    });

    expect(inProgressButton.className).toContain('active:scale-95');
    expect(inProgressButton.className).toContain('motion-reduce:active:scale-100');

    fireEvent.click(inProgressButton);

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('in_progress');
  });

  it('announces filter changes to screen readers via StatusAnnouncer', () => {
    jest.useFakeTimers();
    render(<TaskManagementHeader {...mockProps} />);

    const inProgressButton = screen.getByRole('radio', {
      name: /Filter by In Progress tasks/i,
    });

    fireEvent.click(inProgressButton);

    jest.advanceTimersByTime(200);

    const announcers = screen.getAllByRole('status', { hidden: true });
    const hasAnnouncement = announcers.some((announcer) =>
      announcer.textContent?.includes('Showing 6 in_progress tasks')
    );
    expect(hasAnnouncement).toBe(true);
    jest.useRealTimers();
  });

  it('supports arrow key navigation across the radio group', () => {
    render(<TaskManagementHeader {...mockProps} />);

    const allButton = screen.getByRole('radio', {
      name: /Filter by All tasks/i,
    });
    allButton.focus();

    fireEvent.keyDown(allButton, { key: 'ArrowRight' });

    expect(mockProps.onFilterChange).toHaveBeenCalledWith('in_progress');
  });
});
