'use client';

import { memo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GRAY_CLASSES, DURATION_TAILWIND } from '@/lib/config';

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

function FooterNavComponent({ columns }: FooterNavProps) {
  const pathname = usePathname();

  const isActive = useCallback(
    (href: string): boolean => {
      if (href === '/') return pathname === '/';
      return pathname === href || pathname.startsWith(href);
    },
    [pathname]
  );

  return (
    <>
      {columns.map((column) => (
        <div key={column.title}>
          <p
            className={`text-sm font-semibold ${GRAY_CLASSES.TEXT_900} uppercase tracking-wider`}
          >
            {column.title}
          </p>
          <ul className="mt-4 space-y-3">
            {column.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      text-sm transition-all ${DURATION_TAILWIND[200]} ease-out
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md
                      inline-flex items-center gap-1.5
                      ${active ? 'text-primary-600 font-semibold' : `${GRAY_CLASSES.TEXT_600} hover:text-primary-600 hover:translate-x-1`}
                    `}
                    aria-label={item.ariaLabel}
                    aria-current={active ? 'page' : undefined}
                  >
                    {active && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0"
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
      ))}
    </>
  );
}

export default memo(FooterNavComponent);
