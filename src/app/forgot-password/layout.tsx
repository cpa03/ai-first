import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { LAYOUT_ERROR_LABELS } from '@/lib/config';

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
          title={LAYOUT_ERROR_LABELS.DEFAULT_TITLE}
          message={LAYOUT_ERROR_LABELS.DEFAULT_MESSAGE}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
