'use client';

import { useEffect, useRef, memo } from 'react';

interface StatusAnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  delay?: number;
  triggered?: boolean;
}

function StatusAnnouncerComponent({
  message,
  politeness = 'polite',
  delay = 100,
  triggered = true,
}: StatusAnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null);
  const previousMessageRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (triggered && message && message !== previousMessageRef.current) {
      timeoutRef.current = setTimeout(() => {
        const announcer = announcerRef.current;
        if (announcer) {
          announcer.textContent = '';
          requestAnimationFrame(() => {
            announcer.textContent = message;
            previousMessageRef.current = message;
          });
        }
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, triggered, delay]);

  return (
    <div
      ref={announcerRef}
      className="sr-only"
      role="status"
      aria-live={politeness}
      aria-atomic="true"
    />
  );
}

StatusAnnouncerComponent.displayName = 'StatusAnnouncer';

export default memo(StatusAnnouncerComponent);
