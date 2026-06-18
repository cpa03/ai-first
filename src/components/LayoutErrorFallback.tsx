'use client';

import { memo } from 'react';
import Alert from './Alert';
import Button from './Button';
import Link from 'next/link';

interface LayoutErrorFallbackProps {
  title: string;
  message: string;
  homeLabel?: string;
}

function LayoutErrorFallbackComponent({
  title,
  message,
  homeLabel = 'Back to Home',
}: LayoutErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <Alert type="error" title={title}>
          {message}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Link href="/" passHref>
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
