import type { Metadata } from 'next';
import { SEO_CONFIG } from '@/lib/config';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: SEO_CONFIG.METADATA.title.default,
  description: SEO_CONFIG.METADATA.description,
};

export default function HomePage() {
  return <HomePageClient />;
}
