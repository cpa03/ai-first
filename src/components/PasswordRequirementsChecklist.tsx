'use client';

import React, { useMemo, useRef, useEffect, useState, memo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  COMPONENT_CONFIG,
  PASSWORD_VALIDATION_CONFIG,
  TRANSITION_CLASSES,
  TEXT_COLORS,
  BG_COLORS,
} from '@/lib/config';

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
    label: PASSWORD_VALIDATION_CONFIG.REQUIREMENTS_LABELS.LENGTH,
    test: (password) =>
      password.length >=
      PASSWORD_VALIDATION_CONFIG.REQUIREMENTS_LENGTHS.MIN_PASSWORD_LENGTH,
  },
  {
    id: 'uppercase',
    label: PASSWORD_VALIDATION_CONFIG.REQUIREMENTS_LABELS.UPPERCASE,
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: PASSWORD_VALIDATION_CONFIG.REQUIREMENTS_LABELS.LOWERCASE,
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: PASSWORD_VALIDATION_CONFIG.REQUIREMENTS_LABELS.NUMBER,
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: PASSWORD_VALIDATION_CONFIG.REQUIREMENTS_LABELS.SPECIAL,
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
  const [hasAppeared, setHasAppeared] = useState(false);
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
      }, COMPONENT_CONFIG.PASSWORD_REQUIREMENTS.CELEBRATION_DURATION_MS);
    }
    prevAllMetRef.current = allMet;

    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, [allMet]);

  // Micro-UX: Track when checklist first becomes visible for staggered entrance animation
  // Creates a delightful cascading reveal that guides user attention through requirements
  useEffect(() => {
    if (password && !hasAppeared && !prefersReducedMotion) {
      requestAnimationFrame(() => {
        setHasAppeared(true);
      });
    }
    if (!password) {
      setHasAppeared(false);
    }
  }, [password, hasAppeared, prefersReducedMotion]);

  if (!password && !showWhenEmpty) return null;

  // Micro-UX: Dynamic progress bar color based on completion
  // Provides visual feedback about how close the user is to a valid password
  const progressColor = allMet
    ? BG_COLORS.SUCCESS
    : metCount >= 3
      ? BG_COLORS.WARNING
      : BG_COLORS.BRAND;

  const progressBgColor = allMet
    ? BG_COLORS.SUCCESS_LIGHT
    : metCount >= 3
      ? BG_COLORS.WARNING_LIGHT
      : BG_COLORS.LIGHT_DARK;

  const countTextColor = allMet
    ? TEXT_COLORS.SUCCESS_DARK
    : metCount >= 3
      ? TEXT_COLORS.WARNING_LIGHT
      : TEXT_COLORS.SECONDARY;

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
            className={`text-xs font-medium tabular-nums ${TRANSITION_CLASSES.COLOR_DEFAULT} ${countTextColor}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {metCount} of {total}
          </span>
        </div>
        <div
          className={`h-1.5 ${progressBgColor} rounded-full overflow-hidden ${TRANSITION_CLASSES.COLOR_SLOW}`}
          role="progressbar"
          aria-valuenow={metCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`Password requirements progress: ${metCount} of ${total} met`}
        >
          <div
            className={`h-full ${progressColor} rounded-full ${TRANSITION_CLASSES.SLOW_EASE_OUT}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <ul className="space-y-1.5" aria-live="polite" aria-atomic="true">
        {requirements.map((req, index) => (
          <li
            key={req.id}
            className={`flex items-center gap-2 text-xs ${TRANSITION_CLASSES.DEFAULT} ${
              req.met
                ? `${TEXT_COLORS.SUCCESS_DARK} font-medium`
                : TEXT_COLORS.MUTED
            } ${hasAppeared && !prefersReducedMotion ? `animate-checklist-item animate-checklist-item-${index + 1}` : ''}`}
            aria-label={`${req.label}: ${req.met ? 'met' : 'not met'}`}
          >
            <span
              className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${TRANSITION_CLASSES.DEFAULT} ${
                req.met ? BG_COLORS.SUCCESS_LIGHT : BG_COLORS.LIGHTER
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
            <span
              className={`leading-none ${req.met && !prefersReducedMotion ? 'animate-strikethrough' : ''}`}
            >
              {req.label}
            </span>
          </li>
        ))}
      </ul>
      {allMet && (
        <p
          className={`text-xs ${TEXT_COLORS.SUCCESS_DARK} font-medium flex items-center gap-1.5 mt-2 ${showCompleteCelebration && !prefersReducedMotion ? 'animate-fade-in' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${BG_COLORS.SUCCESS_LIGHT}`}
          >
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
          {PASSWORD_VALIDATION_CONFIG.REQUIREMENTS_LABELS.ALL_MET}
        </p>
      )}
    </div>
  );
}

export const PasswordRequirementsChecklist = memo(
  PasswordRequirementsChecklistComponent
);
