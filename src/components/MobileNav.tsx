'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface NavLink {
  href: string;
  label: string;
  ariaLabel: string;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home', ariaLabel: 'Navigate to home page' },
  {
    href: '/dashboard',
    label: 'Dashboard',
    ariaLabel: 'Navigate to dashboard',
  },
  { href: '/clarify', label: 'Clarify', ariaLabel: 'Navigate to clarify page' },
  { href: '/results', label: 'Results', ariaLabel: 'Navigate to results page' },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);
  const lastMenuItemRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleNavClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  if (!isMobile) {
    return (
      <nav aria-label="Main navigation" className="flex space-x-4 sm:space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-gray-800 hover:text-primary-600 px-4 py-3 text-sm sm:text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md min-h-[44px] inline-flex items-center hover:bg-gray-50"
            aria-label={link.ariaLabel}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Main navigation">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md p-2 min-h-[44px] min-w-[44px] transition-all duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="mobile-menu"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
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
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg"
          role="menu"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
            {navLinks.map((link, index) => (
              <button
                key={link.href}
                ref={
                  index === 0
                    ? firstMenuItemRef
                    : index === navLinks.length - 1
                      ? lastMenuItemRef
                      : undefined
                }
                onClick={() => handleNavClick(link.href)}
                className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[48px] flex items-center"
                role="menuitem"
                aria-label={link.ariaLabel}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
