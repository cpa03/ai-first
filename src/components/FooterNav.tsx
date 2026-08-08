'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GRAY_CLASSES,
  DURATION_TAILWIND,
  PRIMARY_FOCUS_RING,
  ACTIVE_DOT,
  SPACE_Y_PATTERNS,
  FOOTER_NAV_STYLES,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';

interface FooterNavColumn {
  readonly title: string;
  readonly items: readonly {
    readonly href: string;
    readonly label: string;
    readonly ariaLabel?: string;
  }[];
}

interface FooterNavProps {
  readonly columns: readonly FooterNavColumn[];
}

/**
 * Micro-UX: Keyboard navigation for footer navigation links.
 * Arrow keys move between items, Home/End jump to first/last.
 * Matches the patterns in FeatureGrid and WhyChooseSection for consistency.
 */
function FooterNavComponent({ columns }: FooterNavProps) {
  const pathname = usePathname();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const isActive = useCallback(
    (href: string): boolean => {
      if (href === '/') return pathname === '/';
      return pathname === href || pathname.startsWith(href);
    },
    [pathname]
  );

  const allItems = columns.flatMap((col) => col.items);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isFooterLink = target.hasAttribute('data-footer-link');
      if (!isFooterLink) return;

      const currentIndex = allItems.findIndex(
        (item) => item.href === target.dataset.footerLinkHref
      );
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = Math.min(currentIndex + 1, allItems.length - 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = allItems.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        triggerHapticFeedback();
        const nextItem = allItems[nextIndex];
        const nextLink = linkRefs.current.get(nextItem.href);
        if (nextLink) {
          nextLink.focus();
          setFocusedIndex(nextIndex);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [allItems]);

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  return (
    <>
      {columns.map((column, colIndex) => {
        const globalOffset = columns
          .slice(0, colIndex)
          .reduce((acc, col) => acc + col.items.length, 0);

        return (
          <div key={column.title}>
            <p
              className={`${FOOTER_NAV_STYLES.COLUMN_TITLE} ${GRAY_CLASSES.TEXT_900}`}
            >
              {column.title}
            </p>
            <ul
              className={`${FOOTER_NAV_STYLES.COLUMN_ITEMS} ${SPACE_Y_PATTERNS.MD}`}
            >
              {column.items.map((item, itemIndex) => {
                const active = isActive(item.href);
                const globalIndex = globalOffset + itemIndex;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      ref={(el) => {
                        if (el) linkRefs.current.set(item.href, el);
                      }}
                      data-footer-link
                      data-footer-link-href={item.href}
                      onFocus={() => handleFocus(globalIndex)}
                      onBlur={handleBlur}
                      className={`
                        ${FOOTER_NAV_STYLES.LINK_TEXT} ${DURATION_TAILWIND[200]}
                        ${PRIMARY_FOCUS_RING} rounded-md
                        ${FOOTER_NAV_STYLES.LINK_CONTAINER}
                        ${active ? 'text-primary-600 font-semibold' : `${GRAY_CLASSES.TEXT_600} hover:text-primary-600 hover:translate-x-1 motion-reduce:hover:transform-none`}
                        ${focusedIndex === globalIndex ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                      `}
                      aria-label={item.ariaLabel}
                      aria-current={active ? 'page' : undefined}
                    >
                      {active && (
                        <span
                          className={`${ACTIVE_DOT} shrink-0`}
                          aria-hidden="true"
                        />
                      )}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </>
  );
}

export default memo(FooterNavComponent);
