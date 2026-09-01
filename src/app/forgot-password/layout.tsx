import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import {
  LAYOUT_ERROR_FALLBACKS,
  FORGOT_PASSWORD_PAGE_CONFIG,
} from '@/lib/config';

export const metadata: Metadata = {
  title: FORGOT_PASSWORD_PAGE_CONFIG.METADATA.title,
  description: FORGOT_PASSWORD_PAGE_CONFIG.METADATA.description,
  robots: 'index, follow',
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <LayoutErrorFallback
          title={LAYOUT_ERROR_FALLBACKS.FORGOT_PASSWORD.TITLE}
          message={LAYOUT_ERROR_FALLBACKS.FORGOT_PASSWORD.MESSAGE}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
