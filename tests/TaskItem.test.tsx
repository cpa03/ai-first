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
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  completion_percentage: 0,
  start_date: null,
  end_date: null,
  actual_hours: null,
  priority_score: 0,
  complexity_score: 0,
  tags: null,
  custom_fields: null,
  milestone_id: null,
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
  });
});
