import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '@/components/task-management/TaskItem';
import type { Task } from '@/lib/db';

describe('TaskItem Keyboard & Accessibility', () => {
  const mockTask: Task = {
    id: 'task-1',
    deliverable_id: 'deliv-1',
    title: 'Implement Authentication',
    description: 'Set up Supabase Auth with OAuth providers',
    status: 'todo',
    estimate: 4,
    assignee: 'Alex',
    risk_level: 'medium',
    milestone_id: null,
    actual_hours: null,
    completion_percentage: 0,
    priority_score: 1,
    complexity_score: 1,
    tags: null,
    custom_fields: null,
    deleted_at: null,
    start_date: null,
    end_date: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task details and proper ARIA labels', () => {
    render(
      <TaskItem task={mockTask} isUpdating={false} onToggle={mockOnToggle} />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Mark "Implement Authentication" as complete')
    );
    expect(button).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Set up Supabase Auth with OAuth providers')
    );
    expect(button).toHaveAttribute('aria-pressed', 'false');

    expect(screen.getByText('Implement Authentication')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText(/4h/i)).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText(/medium\s+risk/i)).toBeInTheDocument();
  });

  it('includes group-focus-visible:opacity-100 class on the keyboard shortcut hint badge', () => {
    render(
      <TaskItem task={mockTask} isUpdating={false} onToggle={mockOnToggle} />
    );

    const shortcutHint = screen.getByText('Space');
    expect(shortcutHint).toHaveClass('group-focus-visible:opacity-100');
    expect(shortcutHint).toHaveClass('group-hover:opacity-100');
  });

  it('triggers onToggle on mouse click', () => {
    render(
      <TaskItem task={mockTask} isUpdating={false} onToggle={mockOnToggle} />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalledWith('task-1', 'todo');
  });

  it('triggers onToggle when pressing Space or Enter key', () => {
    render(
      <TaskItem task={mockTask} isUpdating={false} onToggle={mockOnToggle} />
    );

    const button = screen.getByRole('button');

    fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnToggle).toHaveBeenCalledWith('task-1', 'todo');

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnToggle).toHaveBeenCalledTimes(2);
  });

  it('renders completed state with line-through title and completed status badge', () => {
    const completedTask: Task = { ...mockTask, status: 'completed' };
    render(
      <TaskItem
        task={completedTask}
        isUpdating={false}
        onToggle={mockOnToggle}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
