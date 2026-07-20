'use client';

import { memo } from 'react';
import Alert from './Alert';
import Button from './Button';
import Link from 'next/link';
import {
  LAYOUT_ERROR_LABELS,
  CONTAINER_WIDTHS,
  CARD_PATTERNS,
  ROUTES,
  ERROR_FALLBACK_CONTAINER,
} from '@/lib/config';

interface LayoutErrorFallbackProps {
  title: string;
  message: string;
  homeLabel?: string;
}

function LayoutErrorFallbackComponent({
  title,
  message,
  homeLabel = LAYOUT_ERROR_LABELS.HOME_LINK,
}: LayoutErrorFallbackProps) {
  return (
    <div className={ERROR_FALLBACK_CONTAINER}>
      <div
        className={`${CONTAINER_WIDTHS.XS} w-full ${CARD_PATTERNS.COMPACT} text-center`}
      >
        <Alert type="error" title={title}>
          {message}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Button variant="primary" onClick={() => window.location.reload()}>
              {LAYOUT_ERROR_LABELS.RETRY_BUTTON}
            </Button>
            <Link href={ROUTES.HOME} passHref>
              <Button variant="secondary">{homeLabel}</Button>
            </Link>
          </div>
        </Alert>
      </div>
    </div>
  );
}

const LayoutErrorFallback = memo(LayoutErrorFallbackComponent);
export default LayoutErrorFallback;
