'use client';

import { memo } from 'react';
import { DASHBOARD_LABELS, DASHBOARD_PAGE_CONTENT } from '@/lib/config';
import {
  ICON_SIZES,
  SVG_VIEWBOX,
  SVG_STROKE_WIDTHS,
  BUTTON_STYLES,
  FLEX_PATTERNS,
  SPACE_X_PATTERNS,
  ROUNDED_CLASSES,
  TRANSITION_CLASSES,
  SHADOW_CLASSES,
  TEXT_COLOR_CLASSES,
  BG_COLOR_CLASSES,
  BORDER_COLOR_CLASSES,
  TYPOGRAPHY_CLASSES,
  COMMON_SPACING_PATTERNS,
  RING_COLORS,
} from '@/lib/config';
import { SR_ONLY } from '@/lib/config/remaining-hardcoded-patterns';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter((page) => {
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <nav
      className={`${FLEX_PATTERNS.CENTER} ${SPACE_X_PATTERNS.SM} ${COMMON_SPACING_PATTERNS.MT_LG}`}
      aria-label={DASHBOARD_LABELS.PAGINATION_LABEL}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${BUTTON_STYLES.PAGINATION} ${FLEX_PATTERNS.CENTER} ${COMMON_SPACING_PATTERNS.PX_MD} ${COMMON_SPACING_PATTERNS.PY_SM} ${ROUNDED_CLASSES.MD} ${TRANSITION_CLASSES.FAST} ${SHADOW_CLASSES.SM} ${currentPage === 1 ? `${TEXT_COLOR_CLASSES.MUTED} ${BG_COLOR_CLASSES.SUBTLE} cursor-not-allowed` : `${TEXT_COLOR_CLASSES.BODY} ${BG_COLOR_CLASSES.CARD} ${BORDER_COLOR_CLASSES.LIGHT} hover:${BG_COLOR_CLASSES.SUBTLE} focus:${RING_COLORS.PRIMARY}`}`}
        aria-label="Previous page"
        aria-disabled={currentPage === 1}
      >
        <svg
          className={ICON_SIZES.SM}
          fill="none"
          viewBox={SVG_VIEWBOX.STANDARD}
          stroke="currentColor"
          strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className={SR_ONLY}>Previous</span>
      </button>

      {/* Page Numbers */}
      <div
        className={`${FLEX_PATTERNS.CENTER} ${SPACE_X_PATTERNS.XS}`}
        role="navigation"
        aria-label="Pagination"
      >
        {visiblePages.map((page, index) => {
          const prevPage = visiblePages[index - 1];
          const showEllipsis = prevPage && page - prevPage > 1;

          return (
            <span key={page} className={FLEX_PATTERNS.CENTER}>
              {showEllipsis && (
                <span
                  className={`${COMMON_SPACING_PATTERNS.PX_SM} ${TYPOGRAPHY_CLASSES.CAPTION} ${TEXT_COLOR_CLASSES.MUTED}`}
                  aria-hidden="true"
                >
                  …
                </span>
              )}
              <button
                type="button"
                onClick={() => handlePageClick(page)}
                className={`${BUTTON_STYLES.PAGINATION} ${FLEX_PATTERNS.CENTER} ${COMMON_SPACING_PATTERNS.PX_MD} ${COMMON_SPACING_PATTERNS.PY_SM} ${ROUNDED_CLASSES.MD} ${TRANSITION_CLASSES.FAST} ${SHADOW_CLASSES.SM} ${
                  page === currentPage
                    ? `${TEXT_COLOR_CLASSES.INVERSE} ${BG_COLOR_CLASSES.BRAND} ${BORDER_COLOR_CLASSES.PRIMARY}`
                    : `${TEXT_COLOR_CLASSES.BODY} ${BG_COLOR_CLASSES.CARD} ${BORDER_COLOR_CLASSES.LIGHT} hover:${BG_COLOR_CLASSES.SUBTLE} focus:${RING_COLORS.PRIMARY}`
                }`}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            </span>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${BUTTON_STYLES.PAGINATION} ${FLEX_PATTERNS.CENTER} ${COMMON_SPACING_PATTERNS.PX_MD} ${COMMON_SPACING_PATTERNS.PY_SM} ${ROUNDED_CLASSES.MD} ${TRANSITION_CLASSES.FAST} ${SHADOW_CLASSES.SM} ${currentPage === totalPages ? `${TEXT_COLOR_CLASSES.MUTED} ${BG_COLOR_CLASSES.SUBTLE} cursor-not-allowed` : `${TEXT_COLOR_CLASSES.BODY} ${BG_COLOR_CLASSES.CARD} ${BORDER_COLOR_CLASSES.LIGHT} hover:${BG_COLOR_CLASSES.SUBTLE} focus:${RING_COLORS.PRIMARY}`}`}
        aria-label="Next page"
        aria-disabled={currentPage === totalPages}
      >
        <svg
          className={ICON_SIZES.SM}
          fill="none"
          viewBox={SVG_VIEWBOX.STANDARD}
          stroke="currentColor"
          strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className={SR_ONLY}>Next</span>
      </button>

      {/* Page Info */}
      <div
        className={`${COMMON_SPACING_PATTERNS.PL_MD} ${TYPOGRAPHY_CLASSES.CAPTION} ${TEXT_COLOR_CLASSES.MUTED}`}
        aria-live="polite"
      >
        {DASHBOARD_PAGE_CONTENT.IDEA_COUNT.TOTAL} {currentPage}{' '}
        {DASHBOARD_PAGE_CONTENT.IDEA_COUNT.PLURAL}{' '}
        {DASHBOARD_PAGE_CONTENT.IDEA_COUNT.TOTAL} {totalPages}
      </div>
    </nav>
  );
}

export default memo(PaginationComponent);
