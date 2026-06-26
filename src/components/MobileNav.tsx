'use client';

import { memo, useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UI_CONFIG,
  MOBILE_NAV_CONFIG,
  SVG_STROKE_WIDTHS,
  Z_INDEX_LAYERS,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';

const navLinks = MOBILE_NAV_CONFIG.ITEMS;

function MobileNavComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
  const lastMenuItemRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

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
                    transition-all duration-300 ease-out
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
        className="text-gray-700 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md p-2 ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.MIN_SIZE} transition-all duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="mobile-menu"
        aria-label={MOBILE_NAV_CONFIG.TOGGLE_ARIA_LABEL(isOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop overlay with close button */}
          <div
            className={`fixed inset-0 top-16 bg-black bg-opacity-50 backdrop-blur-sm z-[${Z_INDEX_LAYERS.MOBILE_OVERLAY}] fade-in`}
            onClick={closeMenu}
            onTouchEnd={closeMenu}
            aria-hidden="true"
          >
            {/* Micro-UX improvement: Close button for better discoverability */}
            <button
              type="button"
              onClick={closeMenu}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label={MOBILE_NAV_CONFIG.CLOSE_ARIA_LABEL}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            ref={menuRef}
            id="mobile-menu"
            className={`fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-2xl z-[${Z_INDEX_LAYERS.MOBILE_MENU}] animate-slide-down`}
          >
            <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-2 bg-white">
              {navLinks.map((link, index) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
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
                        transition-all duration-300 ease-out rounded-md
                        border-l-[3px] ${active ? 'border-primary-600 bg-primary-50/50 text-primary-600' : 'border-transparent text-gray-800 hover:text-primary-600 hover:bg-gray-50'}
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${UI_CONFIG.ACCESSIBILITY.TOUCH_TARGET.LARGE_SIZE} flex items-center
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
