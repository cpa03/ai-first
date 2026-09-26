'use client';

import { useEffect, useRef, memo } from 'react';
import { usePathname } from 'next/navigation';
import { SR_ONLY } from '@/lib/config/remaining-hardcoded-patterns';

/**
 * Micro-UX: Route change announcer for screen readers.
 *
 * Announces the current page title to assistive technology whenever the
 * route changes, satisfying WCAG 4.1.3 (Status Messages). Without this,
 * screen reader users navigating between pages receive no audible
 * confirmation that the page has changed.
 *
 * Uses the same clear-then-set pattern as StatusAnnouncer to guarantee
 * the live region re-announces even when the same text is set twice
 * (e.g. navigating back to a previously visited route).
 */
function RouteAnnouncerComponent() {
  const pathname = usePathname();
  const announcerRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef<string>('');

  useEffect(() => {
    if (!pathname || pathname === previousPathRef.current) return;

    const announcer = announcerRef.current;
    if (!announcer) return;

    // Build a human-readable page name from the pathname
    const pageName = getPageTitle(pathname);

    // Clear then set in a microtask to force the screen reader to re-announce
    // even when navigating to a route it has announced before.
    announcer.textContent = '';
    requestAnimationFrame(() => {
      announcer.textContent = `${pageName} page loaded`;
      previousPathRef.current = pathname;
    });
  }, [pathname]);

  return (
    <div
      ref={announcerRef}
      className={SR_ONLY}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    />
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Home';

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Home';

  // Map known routes to human-readable titles
  const routeTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    clarify: 'Clarify',
    results: 'Results',
    login: 'Login',
    signup: 'Sign up',
    auth: 'Authentication',
    admin: 'Admin',
  };

  const firstSegment = segments[0]?.toLowerCase() ?? '';
  return routeTitles[firstSegment] ?? capitalize(firstSegment);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

RouteAnnouncerComponent.displayName = 'RouteAnnouncer';

export default memo(RouteAnnouncerComponent);
