'use client';

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

export default function ProgressStepper({
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
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => {
              return (
                <div
                  key={step.id}
                  className={`
                    w-2.5 h-2.5 rounded-full transition-colors duration-300
                    ${
                      step.completed || step.current
                        ? 'bg-primary-600'
                        : 'bg-gray-300'
                    }
                  `}
                  aria-current={step.current ? 'step' : undefined}
                  aria-label={`Question ${index + 1}`}
                />
              );
            })}
          </div>
          <span className="text-xs text-gray-600 font-medium">
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
            >
              <div className="flex items-center w-full">
                <div
                  className={`
                    flex items-center justify-center
                    w-10 h-10 rounded-full border-2
                    font-medium text-sm
                    transition-colors duration-300
                    ${
                      step.completed
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : step.current
                          ? 'border-primary-600 text-primary-600'
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
                      aria-hidden="true"
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
                <span
                  className={`
                    ml-3 text-sm font-medium
                    ${
                      step.current
                        ? 'text-primary-600'
                        : step.completed
                          ? 'text-gray-900'
                          : 'text-gray-500'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4
                    ${step.completed ? 'bg-primary-600' : 'bg-gray-300'}
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
}
