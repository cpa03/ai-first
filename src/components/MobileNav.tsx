'use client';

import { memo, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UI_CONFIG,
  MOBILE_NAV_CONFIG,
  HAMBURGER_MENU_CONFIG,
  Z_INDEX_LAYERS,
  CONTAINER_WIDTHS,
  RESPONSIVE_PADDING,
  MOBILE_NAV_TAILWIND,
  BG_COLORS,
  BORDER_COLORS,
  TEXT_COLORS,
  TRANSITION_CLASSES,
  DURATION_TAILWIND,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';
import { isFocusedOnInput } from '@/lib/dom-utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const navLinks = MOBILE_NAV_CONFIG.ITEMS;

function MobileNavComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
  const lastMenuItemRef = useRef<HTMLAnchorElement>(null);
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

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      firstMenuItemRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

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
                    border-b-2 ${active ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-800 hover:text-primary-600 hover:border-primary-300'}
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-t-md ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.MIN_SIZE} inline-flex items-center
                    ${active ? 'bg-primary-50/30' : 'hover:bg-gray-50'}
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
        className={`text-gray-700 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md p-2 ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.MIN_SIZE} ${TRANSITION_CLASSES.DEFAULT}`}
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
            className={`block ${HAMBURGER_MENU_CONFIG.LINE.WIDTH_CLASS} ${HAMBURGER_MENU_CONFIG.LINE.HEIGHT_CLASS} bg-current rounded-full ${TRANSITION_CLASSES.SLOW} ease-in-out motion-reduce:transition-none ${isOpen ? `rotate-45 translate-y-[${HAMBURGER_MENU_CONFIG.TRANSLATE_OFFSET.LARGE}]` : ''}`}
          />
          <span
            className={`block ${HAMBURGER_MENU_CONFIG.LINE.WIDTH_CLASS} ${HAMBURGER_MENU_CONFIG.LINE.HEIGHT_CLASS} bg-current rounded-full ${TRANSITION_CLASSES.SLOW} ease-in-out motion-reduce:transition-none mt-1.5 ${isOpen ? 'opacity-0 scale-0' : ''}`}
          />
          <span
            className={`block ${HAMBURGER_MENU_CONFIG.LINE.WIDTH_CLASS} ${HAMBURGER_MENU_CONFIG.LINE.HEIGHT_CLASS} bg-current rounded-full ${TRANSITION_CLASSES.SLOW} ease-in-out motion-reduce:transition-none mt-1.5 ${isOpen ? `-rotate-45 -translate-y-[${HAMBURGER_MENU_CONFIG.TRANSLATE_OFFSET.LARGE}]` : ''}`}
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
            {/* Micro-UX improvement: Close button for better discoverability */}
            <button
              type="button"
              onClick={closeMenu}
              className={`absolute top-4 right-4 ${HAMBURGER_MENU_CONFIG.CLOSE_BUTTON.SIZE_CLASS} flex items-center justify-center rounded-full bg-white/90 shadow-lg text-gray-600 hover:text-gray-900 hover:bg-white ${TRANSITION_CLASSES.DEFAULT} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`}
              aria-label={MOBILE_NAV_CONFIG.CLOSE_ARIA_LABEL}
            >
              <div
                className={`${HAMBURGER_MENU_CONFIG.CLOSE_BUTTON.ICON_SIZE_CLASS} flex flex-col justify-center items-center`}
              >
                <span
                  className={`block ${HAMBURGER_MENU_CONFIG.LINE.CLOSE_WIDTH_CLASS} ${HAMBURGER_MENU_CONFIG.LINE.HEIGHT_CLASS} bg-current rounded-full rotate-45 translate-y-[${HAMBURGER_MENU_CONFIG.TRANSLATE_OFFSET.SMALL}] transition-transform ${DURATION_TAILWIND[200]}`}
                />
                <span
                  className={`block ${HAMBURGER_MENU_CONFIG.LINE.CLOSE_WIDTH_CLASS} ${HAMBURGER_MENU_CONFIG.LINE.HEIGHT_CLASS} bg-current rounded-full -rotate-45 -translate-y-[${HAMBURGER_MENU_CONFIG.TRANSLATE_OFFSET.SMALL}] transition-transform ${DURATION_TAILWIND[200]}`}
                />
              </div>
            </button>
          </div>
          <div
            ref={menuRef}
            id="mobile-menu"
            className={`fixed top-16 left-0 right-0 ${BG_COLORS.DEFAULT} border-b ${BORDER_COLORS.LIGHT} shadow-2xl z-[${Z_INDEX_LAYERS.MOBILE_MENU}] animate-slide-down`}
          >
            <ul
              className={`${CONTAINER_WIDTHS.XL} mx-auto ${RESPONSIVE_PADDING.CLASS} py-8 space-y-2 ${BG_COLORS.DEFAULT}`}
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
                        border-l-[${MOBILE_NAV_TAILWIND.ACTIVE_LINK_BORDER_W}] ${active ? 'border-primary-600 bg-primary-50/50 text-primary-600' : 'border-transparent text-gray-800 hover:text-primary-600 hover:bg-gray-50'}
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.LARGE_SIZE} flex items-center justify-between
                      `}
                      aria-label={link.ariaLabel}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="flex items-center gap-3">
                        {active && (
                          <span
                            className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"
                            aria-hidden="true"
                          />
                        )}
                        {link.label}
                      </span>
                      <kbd
                        className={`hidden sm:inline-flex items-center px-1.5 py-0.5 ${BG_COLORS.PROGRESS_NEUTRAL} ${TEXT_COLORS.MUTED} rounded text-xs font-mono opacity-60`}
                        aria-hidden="true"
                      >
                        {index + 1}
                      </kbd>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </nav>
  );
}

export default memo(MobileNavComponent);
