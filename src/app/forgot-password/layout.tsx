import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';
import { FORGOT_PASSWORD_PAGE_STRINGS } from '@/lib/config/remaining-hardcoded-patterns';

export const metadata: Metadata = {
  title: FORGOT_PASSWORD_PAGE_STRINGS.METADATA.TITLE,
  description: FORGOT_PASSWORD_PAGE_STRINGS.METADATA.DESCRIPTION,
  robots: FORGOT_PASSWORD_PAGE_STRINGS.METADATA.ROBOTS,
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
          title={FORGOT_PASSWORD_PAGE_STRINGS.ERROR_BOUNDARY.TITLE}
          message={FORGOT_PASSWORD_PAGE_STRINGS.ERROR_BOUNDARY.MESSAGE}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
