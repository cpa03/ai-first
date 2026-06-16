'use client';

import React from 'react';
import { UI_CONFIG } from '@/lib/config';

interface Step {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

const ProgressStepperComponent = function ProgressStepper({
  steps,
  currentStep,
}: ProgressStepperProps) {
  return (
    <nav
      className="mb-6 sm:mb-8"
      aria-label="Question progress"
      role="navigation"
    >
      <div className="sm:hidden">
        <div className="flex items-center justify-between px-2">
          <ol className="flex items-center space-x-2">
            {steps.map((step, index) => {
              return (
                <li
                  key={step.id}
                  className={`
                    rounded-full transition-all duration-300 ease-out
                    ${
                      step.current
                        ? 'w-4 h-4 bg-primary-600 scale-110 shadow-md shadow-primary-200'
                        : step.completed
                          ? 'w-3 h-3 bg-primary-600'
                          : 'w-3 h-3 bg-gray-300'
                    }
                  `}
                  aria-current={step.current ? 'step' : undefined}
                  aria-label={`Question ${index + 1}: ${step.current ? 'Current' : step.completed ? 'Completed' : 'Upcoming'}`}
                />
              );
            })}
          </ol>
          <span
            className="text-xs text-gray-700 font-medium tabular-nums"
            aria-hidden="true"
          >
            {currentStep + 1} / {steps.length}
          </span>
        </div>
      </div>

      <ol className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`flex-1 ${!isLast ? 'flex items-center' : ''}`}
              aria-current={step.current ? 'step' : undefined}
              aria-label={`${step.label}: ${step.current ? 'Current' : step.completed ? 'Completed' : 'Upcoming'}`}
            >
              <div className="flex items-center w-full" aria-hidden="true">
                <div
                  className={`
                    flex items-center justify-center
                    w-10 h-10 rounded-full border-2
                    font-medium text-sm ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.MIN_SIZE}
                    transition-all duration-300
                    ${
                      step.completed
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : step.current
                          ? 'border-primary-600 text-primary-600 animate-gentle-pulse'
                          : 'border-gray-300 text-gray-500'
                    }
                  `}
                >
                  {step.completed ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-label="Completed"
                      role="img"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex flex-col ml-3">
                  <span
                    className={`
                      text-sm font-medium
                      ${
                        step.current
                          ? 'text-primary-600'
                          : step.completed
                            ? 'text-gray-900'
                            : 'text-gray-700'
                      }
                    `}
                  >
                    {step.label}
                  </span>
                  {step.current && (
                    <span className="text-xs text-primary-500 font-medium">
                      Step {currentStep + 1} of {steps.length}
                    </span>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4
                    ${step.completed ? 'bg-primary-600' : 'bg-gray-300'}
                    transition-colors duration-300
                  `}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default React.memo(ProgressStepperComponent);
