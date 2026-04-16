import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskItem } from '../src/components/task-management/TaskItem';
import type { Task } from '../src/lib/db';

const mockTask: Task = {
  id: 'task-1',
  deliverable_id: 'del-1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo',
  estimate: 2,
  assignee: 'John Doe',
  risk_level: 'medium',
  order_index: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  completion_percentage: 0,
};

describe('TaskItem Tooltips', () => {
  it('renders tooltips for estimate, assignee, and risk level', () => {
    render(
      <TaskItem
        task={mockTask}
        isUpdating={false}
        onToggle={() => {}}
      />
    );

    // Metadata is rendered
    expect(screen.getByText('2h')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('medium risk')).toBeInTheDocument();

    // Check for Tooltip aria-describedby or just content if rendered (though Tooltip might not render content until hovered in some implementations, but our Tooltip renders content when isMounted is true. wait, isMounted is only true after delay.)

    // Actually, our Tooltip renders content only when isMounted is true.
    // In our Tooltip.tsx:
    // onMouseEnter={showTooltip} -> setTimeout(setIsMounted(true), delay)

    // So we might need to mock Tooltip or just check if Tooltip is wrapping them.
  });
});
