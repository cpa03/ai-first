import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeliverableCard } from '@/components/task-management/DeliverableCard';

describe('DeliverableCard', () => {
  const mockDeliverable = {
    id: 'deliv-1',
    title: 'Frontend Architecture',
    description: 'Setup React components and Tailwind layout',
    tasks: [
      {
        id: 'task-1',
        deliverable_id: 'deliv-1',
        title: 'Design Header',
        description: 'Design header layout',
        status: 'completed' as const,
        estimate: 4,
        start_date: null,
        end_date: null,
        actual_hours: 4,
        completion_percentage: 100,
        priority_score: 5,
        complexity_score: 2,
        risk_level: 'high' as const,
        tags: null,
        custom_fields: null,
        milestone_id: null,
        created_at: '2026-08-01',
        updated_at: '2026-08-01',
      },
      {
        id: 'task-2',
        deliverable_id: 'deliv-1',
        title: 'Implement Task List',
        description: 'Build task list component',
        status: 'in_progress' as const,
        estimate: 6,
        start_date: null,
        end_date: null,
        actual_hours: null,
        completion_percentage: 50,
        priority_score: 3,
        complexity_score: 3,
        risk_level: 'medium' as const,
        tags: null,
        custom_fields: null,
        milestone_id: null,
        created_at: '2026-08-01',
        updated_at: '2026-08-01',
      },
    ],
    progress: 50,
    completedCount: 1,
    totalCount: 2,
    totalHours: 10,
    completedHours: 4,
  };

  const defaultProps = {
    deliverable: mockDeliverable,
    isExpanded: false,
    updatingTaskId: null,
    onToggleExpand: jest.fn(),
    onToggleTask: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders deliverable header with title and progress details', () => {
    render(<DeliverableCard {...defaultProps} />);

    expect(screen.getByText('Frontend Architecture')).toBeInTheDocument();
    expect(
      screen.getByText('Setup React components and Tailwind layout')
    ).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('includes focus ring and active tactile styling on header button', () => {
    render(<DeliverableCard {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: /Frontend Architecture/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-primary-500');
    expect(button).toHaveClass('active:scale-[0.99]');
  });

  it('calls onToggleExpand when header button is clicked', () => {
    render(<DeliverableCard {...defaultProps} />);

    const button = screen.getByRole('button', {
      name: /Frontend Architecture/i,
    });
    fireEvent.click(button);

    expect(defaultProps.onToggleExpand).toHaveBeenCalledWith('deliv-1');
  });

  it('renders tasks when deliverable is expanded', () => {
    render(<DeliverableCard {...defaultProps} isExpanded={true} />);

    expect(screen.getByText('Design Header')).toBeInTheDocument();
    expect(screen.getByText('Implement Task List')).toBeInTheDocument();
  });
});
