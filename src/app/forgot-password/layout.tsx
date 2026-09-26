import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { COMPREHENSIVE_UI_STRINGS } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Forgot Password - IdeaFlow',
  description: 'Reset your IdeaFlow password',
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
          title={COMPREHENSIVE_UI_STRINGS.ERRORS.SERVER_ERROR}
          message={`${COMPREHENSIVE_UI_STRINGS.ERRORS.UNKNOWN_ERROR}. ${COMPREHENSIVE_UI_STRINGS.ERRORS.TRY_AGAIN}`}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
