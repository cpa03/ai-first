'use client';

import { useEffect, useRef } from 'react';

interface LoadingAnnouncerProps {
  message: string;
  ariaLive?: 'polite' | 'assertive';
}

export default function LoadingAnnouncer({
  message,
  ariaLive = 'polite',
}: LoadingAnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null);
  const previousMessageRef = useRef<string>('');

  useEffect(() => {
    if (message && message !== previousMessageRef.current) {
      const announcer = announcerRef.current;
      if (announcer) {
        announcer.textContent = message;
        previousMessageRef.current = message;
      }
    }
  }, [message]);

  return (
    <div
      ref={announcerRef}
      className="sr-only"
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
