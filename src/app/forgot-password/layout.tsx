import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { FORGOT_PASSWORD_PAGE_CONFIG } from '@/lib/config';

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
          title={FORGOT_PASSWORD_PAGE_CONFIG.LAYOUT_ERROR.TITLE}
          message={FORGOT_PASSWORD_PAGE_CONFIG.LAYOUT_ERROR.MESSAGE}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
