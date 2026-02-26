'use client';

import React, { useMemo } from 'react';
import CopyButton from './CopyButton';
import { createLogger } from '@/lib/logger';

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
    : 'https://ideaflow.ai',
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

  return (
    <div
      className={`bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-100 ${className}`}
      role="region"
      aria-label="Referral link"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-primary-900 mb-1">
            Share Your Referral Link
          </h3>
          <p className="text-xs text-primary-700 mb-2">
            Invite friends and earn rewards when they sign up!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 px-3 py-2 bg-white border border-primary-200 rounded-md text-sm text-primary-800 truncate font-mono">
              {referralUrl}
            </code>
            <CopyButton
              textToCopy={referralUrl}
              label="Copy"
              successLabel="Copied!"
              ariaLabel="Copy referral link"
              toastMessage="Referral link copied!"
              onCopy={handleCopy}
              variant="default"
            />
          </div>
        </div>

        <div className="flex-shrink-0 hidden sm:block">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
