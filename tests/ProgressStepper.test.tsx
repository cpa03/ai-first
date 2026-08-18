import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgressStepper from '@/components/ProgressStepper';

describe('ProgressStepper Component', () => {
  const mockSteps = [
    { id: 'step-1', label: 'Step 1: Idea', completed: true, current: false },
    { id: 'step-2', label: 'Step 2: Details', completed: false, current: true },
    { id: 'step-3', label: 'Step 3: Review', completed: false, current: false },
  ];

  it('renders correctly with steps and progress details', () => {
    render(<ProgressStepper steps={mockSteps} currentStep={1} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getAllByText('Step 2: Details')[0]).toBeInTheDocument();
  });

  it('supports step click events when onStepClick is provided', () => {
    const handleStepClick = jest.fn();
    render(
      <ProgressStepper
        steps={mockSteps}
        currentStep={1}
        onStepClick={handleStepClick}
      />
    );

    // Find and click the step button by accessible label or item content
    const stepButtons = screen.getAllByRole('button');
    // Step 1 button is index 0 or index 1
    const step1Button = stepButtons.find((btn) =>
      btn.getAttribute('aria-label')?.includes('Step 1: Idea') ||
      btn.getAttribute('aria-label')?.includes('Question 1')
    );

    expect(step1Button).toBeDefined();
    if (step1Button) {
      fireEvent.click(step1Button);
    }

    expect(handleStepClick).toHaveBeenCalledWith(0);
  });

  it('handles keyboard navigation using left and right arrow keys', () => {
    const handleStepClick = jest.fn();
    render(
      <ProgressStepper
        steps={mockSteps}
        currentStep={1}
        onStepClick={handleStepClick}
      />
    );

    // Dispatch ArrowRight on document
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(handleStepClick).toHaveBeenCalledWith(2);

    handleStepClick.mockClear();

    // Dispatch ArrowLeft on document
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(handleStepClick).toHaveBeenCalledWith(0);
  });

  it('handles Enter and Space keydown events on individual step buttons', () => {
    const handleStepClick = jest.fn();
    render(
      <ProgressStepper
        steps={mockSteps}
        currentStep={1}
        onStepClick={handleStepClick}
      />
    );

    const stepButtons = screen.getAllByRole('button');
    const step1Button = stepButtons.find((btn) =>
      btn.getAttribute('aria-label')?.includes('Step 1: Idea') ||
      btn.getAttribute('aria-label')?.includes('Question 1')
    );

    expect(step1Button).toBeDefined();
    if (step1Button) {
      fireEvent.keyDown(step1Button, { key: 'Enter' });
      expect(handleStepClick).toHaveBeenCalledWith(0);

      handleStepClick.mockClear();

      fireEvent.keyDown(step1Button, { key: ' ' });
      expect(handleStepClick).toHaveBeenCalledWith(0);
    }
  });
});
