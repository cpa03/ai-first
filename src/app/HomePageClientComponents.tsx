'use client';

import dynamic from 'next/dynamic';

const UserOnboarding = dynamic(() => import('@/components/UserOnboarding'), {
  ssr: false,
});

const KeyboardShortcutHint = dynamic(
  () => import('@/components/KeyboardShortcutHint'),
  { ssr: false }
);

export default function HomePageClientComponents() {
  return (
    <>
      <UserOnboarding />
      <KeyboardShortcutHint />
    </>
  );
}