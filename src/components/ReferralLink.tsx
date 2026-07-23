'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import CopyButton from './CopyButton';
import Tooltip from './Tooltip';
import { createLogger } from '@/lib/logger';
import { APP_CONFIG } from '@/lib/config/app';
import {
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  REFERRAL_LINK_LABELS,
  GRAY_CLASSES,
  WHITE_BG_PATTERNS,
  REFERRAL_ICON_CONTAINER,
  DURATION_TAILWIND,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';

// Logger for growth tracking events
const logger = createLogger('ReferralLink');

export interface ReferralLinkProps {
  /** The user's unique referral code */
  referralCode: string;
  /** Optional custom base URL for the referral link */
  baseUrl?: string;
  /** Callback fired when referral link is viewed */
  onView?: () => void;
  /** Callback fired when referral link is copied */
  onCopy?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ReferralLink Component
 *
 * Displays a user's unique referral link with copy functionality.
 * Used for viral growth loops - users share their referral link to earn rewards.
 *
 * @example
 * <ReferralLink referralCode="user123" />
 */
export default function ReferralLink({
  referralCode,
  baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : APP_CONFIG.URLS.BASE,
  onView,
  onCopy,
  className = '',
}: ReferralLinkProps) {
  // Generate the full referral URL
  const referralUrl = useMemo(() => {
    return `${baseUrl}/signup?ref=${referralCode}`;
  }, [baseUrl, referralCode]);

  // Track view on mount
  React.useEffect(() => {
    // Growth: Track referral link view event (analytics integration point)
    if (typeof window !== 'undefined' && window.location) {
      logger.info('Referral link viewed', { referralCode });
    }
    if (onView) {
      onView();
    }
  }, [referralCode, onView]);

  // Handle copy with tracking
  const handleCopy = () => {
    // Growth: Track referral link copy event (analytics integration point)
    if (typeof window !== 'undefined' && window.location) {
      logger.info('Referral link copied', { referralCode });
    }
    if (onCopy) {
      onCopy();
    }
  };

  const [isSelected, setIsSelected] = useState(false);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  const selectAll = useCallback((element: HTMLElement) => {
    triggerHapticFeedback();
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    setIsSelected(true);
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }
    selectionTimeoutRef.current = setTimeout(() => {
      setIsSelected(false);
    }, 2000);
  }, []);

  // Micro-UX: Click or focus + Enter/Space to select all text for easy custom copy
  const handleCodeClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    selectAll(e.currentTarget);
  }, [selectAll]);

  const handleCodeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectAll(e.currentTarget);
      }
    },
    [selectAll]
  );

  const handleBlur = useCallback(() => {
    setIsSelected(false);
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }
  }, []);

  return (
    <div
      className={`bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-100 ${className}`}
      role="region"
      aria-label={REFERRAL_LINK_LABELS.REGION_ARIA_LABEL}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-primary-900 mb-1">
            {REFERRAL_LINK_LABELS.TITLE}
          </h3>
          <p className="text-xs text-primary-700 mb-2">
            {REFERRAL_LINK_LABELS.DESCRIPTION}
          </p>
          <div className="flex items-center gap-2">
            <Tooltip
              content={
                isSelected
                  ? REFERRAL_LINK_LABELS.CODE_SELECTED_TITLE
                  : REFERRAL_LINK_LABELS.CODE_TITLE
              }
              position="top"
              className="flex-1 min-w-0"
            >
              <code
                onClick={handleCodeClick}
                onKeyDown={handleCodeKeyDown}
                onBlur={handleBlur}
                tabIndex={0}
                aria-label={`${referralUrl}. Press Space or Enter to select the link.`}
                className={`w-full min-w-0 px-3 py-2 ${WHITE_BG_PATTERNS.DEFAULT} border border-primary-200 rounded-md text-sm text-primary-800 truncate font-mono cursor-pointer ${GRAY_CLASSES.HOVER_BG_50} transition-all ${DURATION_TAILWIND[200]} outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`}
              >
                {referralUrl}
              </code>
            </Tooltip>
            <CopyButton
              textToCopy={referralUrl}
              label={REFERRAL_LINK_LABELS.COPY_LABEL}
              successLabel={REFERRAL_LINK_LABELS.COPY_SUCCESS_LABEL}
              ariaLabel={REFERRAL_LINK_LABELS.COPY_ARIA_LABEL}
              toastMessage={REFERRAL_LINK_LABELS.COPY_TOAST_MESSAGE}
              onCopy={handleCopy}
              variant="default"
            />
          </div>
        </div>

        <div className="flex-shrink-0 hidden sm:block">
          <div className={REFERRAL_ICON_CONTAINER}>
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
