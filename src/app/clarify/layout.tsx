import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Idea Clarification - Refine Your Concepts | IdeaFlow',
  description:
    'Let our AI ask the right questions to clarify and refine your project ideas. Get detailed requirements and scope definition for better planning.',
  keywords: [
    'AI idea clarification',
    'project requirements',
    'scope definition',
    'concept refinement',
    'project planning',
  ],
  openGraph: {
    title: 'AI Idea Clarification - Refine Your Concepts | IdeaFlow',
    description:
      'Let our AI ask the right questions to clarify and refine your project ideas.',
    url: 'https://ideaflow.ai/clarify',
  },
};

export default function ClarifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
