import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { FORGOT_PASSWORD_LAYOUT_LABELS } from '@/lib/config/component-labels';

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
          title={FORGOT_PASSWORD_LAYOUT_LABELS.ERROR_TITLE}
          message={FORGOT_PASSWORD_LAYOUT_LABELS.ERROR_MESSAGE}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
