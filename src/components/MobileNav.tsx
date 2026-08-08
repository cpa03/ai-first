'use client';

import { memo, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UI_CONFIG,
  MOBILE_NAV_CONFIG,
  HAMBURGER_MENU_CONFIG,
  CONTAINER_WIDTHS,
  RESPONSIVE_PADDING,
  BG_COLORS,
  BORDER_COLORS,
  TEXT_COLORS,
  TRANSITION_CLASSES,
  DURATION_TAILWIND,
  MOBILE_NAV_ACTIVE_INDICATOR,
  MOBILE_NAV_CLOSE_HINT,
  MOBILE_NAV_CLOSE_HINT_TEXT,
  MOBILE_NAV_CLOSE_HINT_KBD,
  GRAY_CLASSES,
  Z_INDEX_LAYERS,
  ANIMATION_CONFIG,
  PRIMARY_ACTIVE_LINK,
  SPACE_Y_PATTERNS,
  BODY_OVERFLOW_CONFIG,
  MT_CLASSES,
  GAP_CLASSES,
} from '@/lib/config';
import { PAGE_ELEMENT_IDS } from '@/lib/config/element-ids';
import { MOBILE_NAV_TAILWIND } from '@/lib/config/tailwind-arbitrary';
import { FOCUS_RING_PATTERNS } from '@/lib/config/remaining-styles';
import { HAMBURGER_SIZES } from '@/lib/config/icon-sizes';
import { triggerHapticFeedback } from '@/lib/utils';
import { isFocusedOnInput } from '@/lib/dom-utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const navLinks = MOBILE_NAV_CONFIG.ITEMS;

function MobileNavComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hintsVisible, setHintsVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
  const lastMenuItemRef = useRef<HTMLAnchorElement>(null);
  const hintsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();

  const isActive = useCallback(
    (href: string): boolean => {
      if (href === '/') return pathname === '/';
      return pathname === href || pathname.startsWith(href);
    },
    [pathname]
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < UI_CONFIG.BREAKPOINTS.MD);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Micro-UX: Auto-close mobile menu when pathname changes
  // This ensures the menu doesn't stay open after programmatic navigation
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Micro-UX: Keyboard shortcuts for quick navigation between menu items
  // Number keys 1-5 allow users to jump directly to menu items
  // This improves keyboard accessibility and discoverability
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target) || e.metaKey || e.ctrlKey || e.altKey)
        return;

      const stepNumber = parseInt(e.key, 10);
      if (stepNumber >= 1 && stepNumber <= navLinks.length) {
        e.preventDefault();
        triggerHapticFeedback();
        const linkIndex = stepNumber - 1;
        const link = navLinks[linkIndex];
        if (link) {
          router.push(link.href);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMobile, router]);

  // Cleanup hints timeout on unmount
  useEffect(() => {
    return () => {
      if (hintsTimeoutRef.current) {
        clearTimeout(hintsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = BODY_OVERFLOW_CONFIG.VALUES.HIDDEN;
      firstMenuItemRef.current?.focus();

      if (!prefersReducedMotion) {
        setHintsVisible(true);
        if (hintsTimeoutRef.current) clearTimeout(hintsTimeoutRef.current);
        hintsTimeoutRef.current = setTimeout(() => {
          setHintsVisible(false);
        }, MOBILE_NAV_CONFIG.KEYBOARD_HINTS_VISIBLE_DURATION_MS);
      }
    } else {
      document.body.style.overflow = BODY_OVERFLOW_CONFIG.VALUES.UNSET;
      setHintsVisible(false);
      if (hintsTimeoutRef.current) {
        clearTimeout(hintsTimeoutRef.current);
        hintsTimeoutRef.current = null;
      }
    }
    return () => {
      document.body.style.overflow = BODY_OVERFLOW_CONFIG.VALUES.UNSET;
    };
  }, [isOpen, isMobile, prefersReducedMotion]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (!firstMenuItemRef.current || !lastMenuItemRef.current) return;

      if (
        event.shiftKey &&
        document.activeElement === firstMenuItemRef.current
      ) {
        event.preventDefault();
        lastMenuItemRef.current?.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastMenuItemRef.current
      ) {
        event.preventDefault();
        firstMenuItemRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  const toggleMenu = useCallback(() => {
    triggerHapticFeedback();
    setIsOpen((prev) => !prev);
  }, []);

  if (!isMobile) {
    return (
      <nav aria-label={MOBILE_NAV_CONFIG.ARIA_LABEL}>
        <ul className="flex space-x-2 sm:space-x-4">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    px-4 py-3 text-sm sm:text-base font-medium
                    ${TRANSITION_CLASSES.SLOW} ease-out
                    border-b-2                     ${active ? 'border-primary-600 text-primary-600' : `border-transparent ${GRAY_CLASSES.TEXT_800} hover:text-primary-600 hover:border-primary-300`}
                    ${FOCUS_RING_PATTERNS.DEFAULT} rounded-t-md ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.MIN_SIZE} inline-flex items-center
                    ${active ? 'bg-primary-50/30' : `${GRAY_CLASSES.HOVER_BG_50}`}
                  `}
                  aria-label={link.ariaLabel}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label={MOBILE_NAV_CONFIG.ARIA_LABEL}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`${GRAY_CLASSES.TEXT_700} ${GRAY_CLASSES.HOVER_TEXT_900} ${FOCUS_RING_PATTERNS.DEFAULT} rounded-md p-2 ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.MIN_SIZE} ${TRANSITION_CLASSES.DEFAULT}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="mobile-menu"
        aria-label={MOBILE_NAV_CONFIG.TOGGLE_ARIA_LABEL(isOpen)}
      >
        {/* Micro-UX: Animated hamburger icon that morphs between menu and close states */}
        {/* Uses CSS transforms for smooth 60fps animation instead of swapping SVG elements */}
        <div
          className={`${HAMBURGER_MENU_CONFIG.CONTAINER.WIDTH_CLASS} ${HAMBURGER_MENU_CONFIG.CONTAINER.HEIGHT_CLASS} flex flex-col justify-center items-center ${isOpen ? 'hamburger-open' : ''}`}
          aria-hidden="true"
        >
          <span
            className={`block ${HAMBURGER_MENU_CONFIG.LINE.WIDTH_CLASS} ${HAMBURGER_MENU_CONFIG.LINE.HEIGHT_CLASS} bg-current rounded-full ${TRANSITION_CLASSES.SLOW} ease-in-out motion-reduce:transition-none ${isOpen ? 'rotate-45 translate-y-1' : ''}`}
          />
          <span
            className={`block ${HAMBURGER_MENU_CONFIG.LINE.WIDTH_CLASS} ${HAMBURGER_MENU_CONFIG.LINE.HEIGHT_CLASS} bg-current rounded-full ${TRANSITION_CLASSES.SLOW} ease-in-out motion-reduce:transition-none ${MT_CLASSES.MD_SM} ${isOpen ? 'opacity-0 scale-0' : ''}`}
          />
          <span
            className={`block ${HAMBURGER_MENU_CONFIG.LINE.WIDTH_CLASS} ${HAMBURGER_MENU_CONFIG.LINE.HEIGHT_CLASS} bg-current rounded-full ${TRANSITION_CLASSES.SLOW} ease-in-out motion-reduce:transition-none ${MT_CLASSES.MD_SM} ${isOpen ? '-rotate-45 -translate-y-1' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop overlay with close button */}
          <div
            className={`fixed inset-0 top-16 ${BG_COLORS.OVERLAY_DARK} backdrop-blur-sm z-[${Z_INDEX_LAYERS.MOBILE_OVERLAY}] fade-in`}
            onClick={closeMenu}
            onTouchEnd={closeMenu}
            aria-hidden="true"
          >
            {/* Micro-UX improvement: Enhanced close button for better discoverability */}
            {/* Added entrance animation, larger touch target, and keyboard shortcut hint */}
            <button
              type="button"
              onClick={closeMenu}
              className={`absolute top-4 right-4 ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.MEDIUM_SIZE} flex items-center justify-center rounded-full bg-white shadow-xl ${BORDER_COLORS.LIGHT} ${GRAY_CLASSES.TEXT_700} hover:${GRAY_CLASSES.TEXT_900} hover:${GRAY_CLASSES.HOVER_BG_50} hover:shadow-2xl hover:scale-105 active:scale-95 ${TRANSITION_CLASSES.DEFAULT} ${FOCUS_RING_PATTERNS.DEFAULT} animate-fade-in`}
              aria-label={`${MOBILE_NAV_CONFIG.CLOSE_ARIA_LABEL} (Escape)`}
              title="Press Escape to close"
            >
              <div
                className={`${HAMBURGER_SIZES.CONTAINER} flex flex-col justify-center items-center`}
              >
                <span
                  className={`block ${HAMBURGER_SIZES.LINE} bg-current rounded-full rotate-45 translate-y-0.5 transition-transform ${DURATION_TAILWIND[200]}`}
                />
                <span
                  className={`block ${HAMBURGER_SIZES.LINE} bg-current rounded-full -rotate-45 -translate-y-0.5 transition-transform ${DURATION_TAILWIND[200]}`}
                />
              </div>
            </button>
            {/* Micro-UX: Subtle keyboard shortcut hint near close button */}
            <div
              className="absolute top-4 right-16 animate-fade-in"
              style={{
                animationDelay: `${ANIMATION_CONFIG.MOBILE_NAV.HINT_DELAY}ms`,
              }}
            >
              <span
                className={`inline-flex items-center px-2 py-1 rounded-md bg-white/80 shadow-sm text-xs ${GRAY_CLASSES.TEXT_500} font-mono backdrop-blur-sm`}
              >
                Esc
              </span>
            </div>
          </div>
          <div
            ref={menuRef}
            id={PAGE_ELEMENT_IDS.MOBILE_MENU}
            className={`fixed top-16 left-0 right-0 ${BG_COLORS.DEFAULT} border-b ${BORDER_COLORS.LIGHT} shadow-2xl z-[${Z_INDEX_LAYERS.MOBILE_MENU}] animate-slide-down`}
          >
            <ul
              className={`${CONTAINER_WIDTHS.XL} mx-auto ${RESPONSIVE_PADDING.CLASS} py-8 ${SPACE_Y_PATTERNS.SM} ${BG_COLORS.DEFAULT}`}
            >
              {navLinks.map((link, index) => {
                const active = isActive(link.href);
                return (
                  <li
                    key={link.href}
                    className={
                      !prefersReducedMotion
                        ? `animate-mobile-menu-item animate-mobile-menu-item-${index + 1}`
                        : ''
                    }
                  >
                    <Link
                      href={link.href}
                      ref={
                        index === 0
                          ? firstMenuItemRef
                          : index === navLinks.length - 1
                            ? lastMenuItemRef
                            : undefined
                      }
                      onClick={closeMenu}
                      className={`
                        w-full text-left px-6 py-4 text-lg font-semibold
                        ${TRANSITION_CLASSES.SLOW} ease-out rounded-md
                        border-l-[${MOBILE_NAV_TAILWIND.ACTIVE_LINK_BORDER_W}] ${active ? PRIMARY_ACTIVE_LINK : `border-transparent ${GRAY_CLASSES.TEXT_800} hover:text-primary-600 ${GRAY_CLASSES.HOVER_BG_50}`}
                        ${FOCUS_RING_PATTERNS.DEFAULT} ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.LARGE_SIZE} flex items-center justify-between
                      `}
                      aria-label={link.ariaLabel}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={`flex items-center ${GAP_CLASSES.LG}`}>
                        {active && (
                          <span
                            className={MOBILE_NAV_ACTIVE_INDICATOR}
                            aria-hidden="true"
                          />
                        )}
                        {link.label}
                      </span>
                      <kbd
                        className={`inline-flex items-center px-1.5 py-0.5 ${BG_COLORS.PROGRESS_NEUTRAL} ${TEXT_COLORS.MUTED} rounded text-xs font-mono transition-opacity ${DURATION_TAILWIND[300]} ${
                          hintsVisible ? 'opacity-60' : 'opacity-0'
                        }`}
                        aria-hidden="true"
                      >
                        {index + 1}
                      </kbd>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {/* Micro-UX: Keyboard hint for closing menu */}
            {/* Helps keyboard users discover the Escape key shortcut for closing the mobile menu */}
            <div
              className={`${RESPONSIVE_PADDING.CLASS} ${MOBILE_NAV_CLOSE_HINT}`}
            >
              <p className={MOBILE_NAV_CLOSE_HINT_TEXT}>
                <kbd className={MOBILE_NAV_CLOSE_HINT_KBD}>Esc</kbd>
                <span>to close</span>
              </p>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

export default memo(MobileNavComponent);
