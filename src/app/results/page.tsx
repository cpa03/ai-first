'use client';

import BlueprintDisplay from '@/components/BlueprintDisplay';

export default function ResultsPage() {
  // Sample data - in real app, this would come from previous steps
  const idea =
    'I want to build a mobile app that helps people track their daily habits and stay motivated to achieve their goals.';
  const answers = {
    target_audience:
      'People aged 18-35 who want to build better habits and track personal growth',
    timeline: '3 months',
    budget: '$5,000-$20,000',
    technical_skills: 'Basic JavaScript, some React experience',
    main_goal:
      'Help users build consistent habits through gamification and social accountability',
  };

  return <BlueprintDisplay idea={idea} answers={answers} />;
}
