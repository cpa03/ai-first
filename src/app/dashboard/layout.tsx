import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Your Ideas',
  description:
    'View and manage all your project ideas in one place. Track progress from draft to completion.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Dashboard - Your Ideas',
    description: 'View and manage all your project ideas in one place.',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
