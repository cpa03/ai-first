'use client';

import { useMemo, useRef, useEffect, useState, memo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useConfetti } from '@/hooks/useConfetti';
import {
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  COMPONENT_CONFIG,
  PASSWORD_VALIDATION_CONFIG,
  TRANSITION_CLASSES,
  TEXT_COLORS,
  BG_COLORS,
  PROGRESS_BAR_A11Y,
  DURATION_TAILWIND,
  COMPONENT_STATE_COLORS,
  ICON_SIZES,
  HEIGHT_ONLY,
  SPACE_Y_PATTERNS,
  CONFETTI_DOT,
} from '@/lib/config';
import { PASSWORD_REQUIREMENTS_LABELS } from '@/lib/config/component-labels';

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
  const { fire: fireConfetti, particles: confettiParticles } = useConfetti();
  const [showCompleteCelebration, setShowCompleteCelebration] = useState(false);
  const [hasAppeared, setHasAppeared] = useState(false);
  const [newlyMetIds, setNewlyMetIds] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState('');
  const prevAllMetRef = useRef(false);
  const prevMetIdsRef = useRef<Set<string>>(new Set());
  const prevMetCountRef = useRef(0);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const newlyMetTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const timeouts = newlyMetTimeoutsRef;
    return () => {
      timeouts.current.forEach((timeout) => clearTimeout(timeout));
      timeouts.current.clear();
    };
  }, []);

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

  const getStrengthLevel = (count: number): 'WEAK' | 'MEDIUM' | 'STRONG' => {
    if (count <= 1) return 'WEAK';
    if (count <= 3) return 'MEDIUM';
    return 'STRONG';
  };

  const strengthLevel = getStrengthLevel(metCount);
  const strengthLabel =
    PASSWORD_REQUIREMENTS_LABELS.STRENGTH_LABELS[strengthLevel];

  // Micro-UX: Celebrate when user first meets ALL password requirements
  // Provides delightful positive feedback at the exact moment of full compliance
  useEffect(() => {
    if (allMet && !prevAllMetRef.current) {
      setShowCompleteCelebration(true);
      fireConfetti();
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
  }, [allMet, fireConfetti]);

  // Micro-UX: Track individual requirement transitions and trigger animation
  // Provides delightful positive feedback when each individual requirement is satisfied
  useEffect(() => {
    const currentMetIds = new Set(
      requirements.filter((req) => req.met).map((req) => req.id)
    );
    const prevMetIds = prevMetIdsRef.current;

    const newlyMet = new Set<string>();
    currentMetIds.forEach((id) => {
      if (!prevMetIds.has(id)) {
        newlyMet.add(id);
      }
    });

    if (newlyMet.size > 0 && !prefersReducedMotion) {
      setNewlyMetIds((prev) => {
        const next = new Set(prev);
        newlyMet.forEach((id) => next.add(id));
        return next;
      });

      newlyMet.forEach((id) => {
        const existingTimeout = newlyMetTimeoutsRef.current.get(id);
        if (existingTimeout) clearTimeout(existingTimeout);

        const timeout = setTimeout(() => {
          setNewlyMetIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          newlyMetTimeoutsRef.current.delete(id);
        }, COMPONENT_CONFIG.PASSWORD_REQUIREMENTS.NEWLY_MET_ANIMATION_MS);
        newlyMetTimeoutsRef.current.set(id, timeout);
      });
    }

    prevMetIdsRef.current = currentMetIds;
  }, [requirements, prefersReducedMotion]);

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

  useEffect(() => {
    if (prevMetCountRef.current !== metCount) {
      if (prevMetCountRef.current > 0 || metCount > 0) {
        setAnnouncement(
          PASSWORD_REQUIREMENTS_LABELS.PROGRESS_ANNOUNCEMENT(metCount, total)
        );
      }
      prevMetCountRef.current = metCount;
    }
  }, [metCount, total]);

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
      aria-label={PASSWORD_REQUIREMENTS_LABELS.GROUP_ARIA_LABEL(
        metCount,
        total
      )}
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      <div className={SPACE_Y_PATTERNS.SM_MD}>
        <div className="flex items-center justify-between">
          <p className={`text-xs font-medium ${TEXT_COLORS.MUTED_DARK}`}>
            {PASSWORD_REQUIREMENTS_LABELS.HEADER_TEXT}
          </p>
          <span
            className={`text-xs font-medium tabular-nums ${TRANSITION_CLASSES.COLOR_DEFAULT} ${countTextColor}`}
          >
            {strengthLabel} · {metCount} of {total}
          </span>
        </div>
        <div
          className={`${HEIGHT_ONLY.SM_XS} ${progressBgColor} rounded-full overflow-hidden ${TRANSITION_CLASSES.COLOR_SLOW}`}
          role="progressbar"
          aria-valuenow={metCount}
          aria-valuemin={PROGRESS_BAR_A11Y.VALUE_MIN}
          aria-valuemax={total}
          aria-label={PASSWORD_REQUIREMENTS_LABELS.PROGRESS_ARIA_LABEL(
            metCount,
            total
          )}
        >
          <div
            className={`h-full ${progressColor} rounded-full ${TRANSITION_CLASSES.SLOW_EASE_OUT}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <ul className={SPACE_Y_PATTERNS.SM_MD} aria-live="polite">
        {requirements.map((req, index) => (
          <li
            key={req.id}
            className={`flex items-center gap-2 text-xs ${TRANSITION_CLASSES.DEFAULT} ${
              req.met
                ? `${TEXT_COLORS.SUCCESS_DARK} font-medium`
                : TEXT_COLORS.MUTED
            } ${hasAppeared && !prefersReducedMotion ? `animate-checklist-item animate-checklist-item-${index + 1}` : ''} ${newlyMetIds.has(req.id) && !prefersReducedMotion ? 'animate-requirement-met' : ''}`}
            aria-label={PASSWORD_REQUIREMENTS_LABELS.REQUIREMENT_ARIA_LABEL(
              req.label,
              req.met
            )}
          >
            <span
              className={`flex-shrink-0 ${ICON_SIZES.MD} rounded-full flex items-center justify-center ${TRANSITION_CLASSES.DEFAULT} ${
                req.met ? BG_COLORS.SUCCESS_LIGHT : BG_COLORS.LIGHTER
              }`}
              aria-hidden="true"
            >
              {req.met ? (
                <svg
                  className={`${ICON_SIZES.SM} ${COMPONENT_STATE_COLORS.PASSWORD.MET_CHECKMARK} ${prefersReducedMotion ? '' : `animate-in zoom-in ${DURATION_TAILWIND[200]}`}`}
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
                  className={`${ICON_SIZES.SM} ${COMPONENT_STATE_COLORS.PASSWORD.UNMET_ICON}`}
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
          className={`relative text-xs ${TEXT_COLORS.SUCCESS_DARK} font-medium flex items-center gap-1.5 mt-2 ${showCompleteCelebration && !prefersReducedMotion ? 'animate-fade-in' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`inline-flex items-center justify-center ${ICON_SIZES.MD} rounded-full ${BG_COLORS.SUCCESS_LIGHT}`}
          >
            <svg
              className={ICON_SIZES.SM}
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
          {confettiParticles.map((particle) => (
            <span
              key={particle.id}
              className={CONFETTI_DOT}
              style={
                {
                  left: '50%',
                  top: '50%',
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  '--confetti-x': `${particle.x}px`,
                  '--confetti-y': `${particle.y}px`,
                  animationDelay: `${particle.delay}ms`,
                } as React.CSSProperties
              }
              aria-hidden="true"
            />
          ))}
        </p>
      )}
    </div>
  );
}

export const PasswordRequirementsChecklist = memo(
  PasswordRequirementsChecklistComponent
);
