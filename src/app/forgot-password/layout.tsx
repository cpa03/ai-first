import { Metadata } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutErrorFallback from '@/components/LayoutErrorFallback';

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
          title="Something went wrong"
          message="We encountered an error loading this page. Please try again."
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}
