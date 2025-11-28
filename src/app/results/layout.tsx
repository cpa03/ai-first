import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Results & Blueprints - Your Action Plans | IdeaFlow',
  description:
    'View and download your AI-generated project blueprints, timelines, and task lists. Export to GitHub, Notion, and other project management tools.',
  keywords: [
    'project blueprints',
    'action plans',
    'task management',
    'project results',
    'AI-generated plans',
  ],
  openGraph: {
    title: 'Project Results & Blueprints - Your Action Plans | IdeaFlow',
    description:
      'View and download your AI-generated project blueprints, timelines, and task lists.',
    url: 'https://ideaflow.ai/results',
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
