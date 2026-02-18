import { Metadata } from 'next';
import { RESULTS_PAGE_CONFIG } from '@/lib/config';

export const metadata: Metadata = {
  title: RESULTS_PAGE_CONFIG.METADATA.title,
  description: RESULTS_PAGE_CONFIG.METADATA.description,
  keywords: [...RESULTS_PAGE_CONFIG.METADATA.keywords],
  openGraph: RESULTS_PAGE_CONFIG.METADATA.openGraph,
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
