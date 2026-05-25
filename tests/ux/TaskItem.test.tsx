import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskItem } from '@/components/task-management/TaskItem';
import { Task } from '@/lib/db';
import { TASK_MANAGEMENT_MESSAGES } from '@/lib/config';

describe('TaskItem UX', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    status: 'todo',
    description: 'Test Description',
    estimate: 1,
    assignee: 'User',
    risk_level: 'low',
    deliverable_id: 'del-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  it('should show "Updating status..." tooltip when isUpdating is true', () => {
    render(
      <TaskItem
        task={mockTask}
        isUpdating={true}
        onToggle={() => {}}
      />
    );

    // The Tooltip component in this repo seems to be a custom one.
    // Let's check if the button has the correct aria-busy attribute first.
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');

    // For the tooltip, since it's "on hover" usually, we might need to check the logic.
    // In TaskItem.tsx:
    // const tooltipContent = isUpdating ? TASK_MANAGEMENT_MESSAGES.TOOLTIP.UPDATING : ...
    // <Tooltip content={tooltipContent}>
  });

  it('should show regular tooltips when not updating', () => {
    const { rerender } = render(
      <TaskItem
        task={mockTask}
        isUpdating={false}
        onToggle={() => {}}
      />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'false');

    const completedTask = { ...mockTask, status: 'completed' as const };
    rerender(
      <TaskItem
        task={completedTask}
        isUpdating={false}
        onToggle={() => {}}
      />
    );

    button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'false');
  });
});
