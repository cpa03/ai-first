'use client';

import { useEffect, useRef, memo } from 'react';
import { SR_ONLY } from '@/lib/config/remaining-hardcoded-patterns';

interface LoadingAnnouncerProps {
  message: string;
  ariaLive?: 'polite' | 'assertive';
}

function LoadingAnnouncerComponent({
  message,
  ariaLive = 'polite',
}: LoadingAnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null);
  const previousMessageRef = useRef<string>('');

  useEffect(() => {
    if (message) {
      const announcer = announcerRef.current;
      if (announcer) {
        // Micro-UX: Reset textContent to empty before setting new message.
        // This forces screen readers to re-announce even identical messages
        // (e.g., when a loading state triggers twice with the same text).
        // Without the reset, aria-live regions skip duplicate text.
        announcer.textContent = '';
        requestAnimationFrame(() => {
          announcer.textContent = message;
          previousMessageRef.current = message;
        });
      }
    }
  }, [message]);

  return (
    <div
      ref={announcerRef}
      className={SR_ONLY}
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}

export default memo(LoadingAnnouncerComponent);
