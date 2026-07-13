'use client';

import React, { useMemo, useRef, useEffect, useState, memo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SVG_STROKE_WIDTHS, SVG_VIEWBOX } from '@/lib/config';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

interface PasswordRequirementsChecklistProps {
  password: string;
  /** Show the checklist when password is not empty */
  showWhenEmpty?: boolean;
  className?: string;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Contains a number',
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: 'Contains special character (!@#$%^&*)',
    test: (password) => /[^a-zA-Z0-9]/.test(password),
  },
];

function PasswordRequirementsChecklistComponent({
  password,
  showWhenEmpty = false,
  className = '',
}: PasswordRequirementsChecklistProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showCompleteCelebration, setShowCompleteCelebration] = useState(false);
  const prevAllMetRef = useRef(false);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const requirements = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        met: req.test(password),
      })),
    [password]
  );

  const allMet = requirements.every((req) => req.met);
  const metCount = requirements.filter((req) => req.met).length;
  const total = requirements.length;
  const progressPercent = total > 0 ? (metCount / total) * 100 : 0;

  // Micro-UX: Celebrate when user first meets ALL password requirements
  // Provides delightful positive feedback at the exact moment of full compliance
  useEffect(() => {
    if (allMet && !prevAllMetRef.current) {
      setShowCompleteCelebration(true);
      celebrationTimeoutRef.current = setTimeout(() => {
        setShowCompleteCelebration(false);
      }, 1500);
    }
    prevAllMetRef.current = allMet;

    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, [allMet]);

  if (!password && !showWhenEmpty) return null;

  // Micro-UX: Dynamic progress bar color based on completion
  // Provides visual feedback about how close the user is to a valid password
  const progressColor = allMet
    ? 'bg-green-500'
    : metCount >= 3
      ? 'bg-amber-400'
      : 'bg-primary-500';

  const progressBgColor = allMet
    ? 'bg-green-100'
    : metCount >= 3
      ? 'bg-amber-100'
      : 'bg-gray-200';

  const countTextColor = allMet
    ? 'text-green-700'
    : metCount >= 3
      ? 'text-amber-600'
      : 'text-gray-600';

  return (
    <div
      className={`space-y-2 ${className}`}
      role="group"
      aria-label={`Password requirements: ${metCount} of ${total} met`}
    >
      {/* Micro-UX: Progress bar with count for at-a-glance completion status */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-700">
            Password must contain:
          </p>
          <span
            className={`text-xs font-medium tabular-nums transition-colors duration-200 ${countTextColor}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {metCount} of {total}
          </span>
        </div>
        <div
          className={`h-1.5 ${progressBgColor} rounded-full overflow-hidden transition-colors duration-300`}
          role="progressbar"
          aria-valuenow={metCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`Password requirements progress: ${metCount} of ${total} met`}
        >
          <div
            className={`h-full ${progressColor} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <ul className="space-y-1.5" aria-live="polite" aria-atomic="true">
        {requirements.map((req) => (
          <li
            key={req.id}
            className={`flex items-center gap-2 text-xs transition-all duration-200 ${
              req.met ? 'text-green-700 font-medium' : 'text-gray-500'
            }`}
            aria-label={`${req.label}: ${req.met ? 'met' : 'not met'}`}
          >
            <span
              className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                req.met ? 'bg-green-100' : 'bg-gray-100'
              }`}
              aria-hidden="true"
            >
              {req.met ? (
                <svg
                  className={`w-3 h-3 text-green-700 ${prefersReducedMotion ? '' : 'animate-in zoom-in duration-200'}`}
                  fill="none"
                  viewBox={SVG_VIEWBOX.STANDARD}
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.THICK}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3 h-3 text-gray-400"
                  fill="none"
                  viewBox={SVG_VIEWBOX.STANDARD}
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              )}
            </span>
            <span className="leading-none">{req.label}</span>
          </li>
        ))}
      </ul>
      {allMet && (
        <p
          className={`text-xs text-green-700 font-medium flex items-center gap-1.5 mt-2 ${showCompleteCelebration && !prefersReducedMotion ? 'animate-fade-in' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.THICK}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
          All requirements met
        </p>
      )}
    </div>
  );
}

export const PasswordRequirementsChecklist = memo(
  PasswordRequirementsChecklistComponent
);
