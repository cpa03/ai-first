import React from 'react';
import { render, screen } from '@testing-library/react';
import { TaskItem } from '../src/components/task-management/TaskItem';
import { Task } from '../src/lib/db';

// Mock Tooltip to verify its usage
jest.mock('../src/components/Tooltip', () => {
  return jest.fn(({ children, content }) => (
    <div data-testid="tooltip-mock" data-tooltip-content={content}>
      {children}
    </div>
  ));
});

const mockTask: Task = {
  id: 'task-1',
  deliverable_id: 'del-1',
  title: 'Test Task',
  description: 'Test Description',
  assignee: 'John Doe',
  status: 'todo',
  estimate: 5,
  start_date: null,
  end_date: null,
  actual_hours: null,
  completion_percentage: 0,
  priority_score: 0,
  complexity_score: 0,
  risk_level: 'high',
  tags: null,
  custom_fields: null,
  milestone_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

describe('TaskItem', () => {
  it('renders task metadata with tooltips', () => {
    render(
      <TaskItem
        task={mockTask}
        isUpdating={false}
        onToggle={() => {}}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('5h')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('high risk')).toBeInTheDocument();

    const tooltips = screen.getAllByTestId('tooltip-mock');

    // Check for specific tooltip contents
    const tooltipContents = tooltips.map(t => t.getAttribute('data-tooltip-content'));

    expect(tooltipContents).toContain('Estimated effort: 5 hours');
    expect(tooltipContents).toContain('Assigned to: John Doe');
    expect(tooltipContents).toContain('High risk level');
    // Updated to match the actual message logic in TASK_MANAGEMENT_MESSAGES.ARIA.CHECKBOX_LABEL
    expect(tooltipContents).toContain('Mark "Test Task" as complete');
  });

  it('renders singular hour correctly in tooltip', () => {
    const singularTask: Task = {
      ...mockTask,
      estimate: 1
    };

    render(
      <TaskItem
        task={singularTask}
        isUpdating={false}
        onToggle={() => {}}
      />
    );

    const tooltips = screen.getAllByTestId('tooltip-mock');
    const tooltipContents = tooltips.map(t => t.getAttribute('data-tooltip-content'));
    expect(tooltipContents).toContain('Estimated effort: 1 hour');
  });

  it('does not render tooltips for missing metadata', () => {
    const minimalTask: Task = {
      ...mockTask,
      estimate: 0,
      assignee: '',
      risk_level: 'low'
    };

    render(
      <TaskItem
        task={minimalTask}
        isUpdating={false}
        onToggle={() => {}}
      />
    );

    const tooltips = screen.getAllByTestId('tooltip-mock');
    const tooltipContents = tooltips.map(t => t.getAttribute('data-tooltip-content'));

    expect(tooltipContents).not.toContain('Estimated effort: 0 hours');
    expect(tooltipContents).not.toContain('Assigned to: ');
    expect(tooltipContents).not.toContain('Low risk level');

    // Should still have the checkbox tooltip
    expect(tooltipContents).toContain('Mark "Test Task" as complete');
  });
});
