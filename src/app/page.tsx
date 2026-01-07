'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import IdeaInput from '@/components/IdeaInput';

const FeatureGrid = dynamic(() => import('@/components/FeatureGrid'), {
  loading: () => (
    <div className="mt-16 grid md:grid-cols-3 gap-8 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-100 h-32 rounded-lg"></div>
      ))}
    </div>
  ),
});

const WhyChooseSection = dynamic(
  () => import('@/components/WhyChooseSection'),
  {
    loading: () => (
      <div className="mt-16 bg-gray-50 rounded-lg p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6"></div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 h-20 rounded"></div>
          ))}
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const router = useRouter();
  const [idea, setIdea] = useState('');
  const [ideaId, setIdeaId] = useState('');

  const handleIdeaSubmit = (submittedIdea: string, submittedIdeaId: string) => {
    setIdea(submittedIdea);
    setIdeaId(submittedIdeaId);

    router.push(
      `/clarify?idea=${encodeURIComponent(submittedIdea)}&ideaId=${submittedIdeaId}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section aria-labelledby="hero-heading" className="text-center mb-12">
        <h2 id="hero-heading" className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Project Planning & Task Management
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform raw ideas into actionable project plans with AI. Get
          automated task breakdown, realistic timelines, and comprehensive
          roadmaps in minutes.
        </p>
      </section>

      <section
        aria-labelledby="idea-input-heading"
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <h3 id="idea-input-heading" className="sr-only">
          Enter Your Idea
        </h3>
        <IdeaInput onSubmit={handleIdeaSubmit} />
      </section>

      {idea && (
        <section
          aria-live="polite"
          aria-labelledby="idea-confirmation-heading"
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3
            id="idea-confirmation-heading"
            className="text-lg font-semibold text-blue-900 mb-2"
          >
            Your Idea:
          </h3>
          <p className="text-blue-800">{idea}</p>
          <p className="text-sm text-blue-600 mt-4">
            Saved with ID: {ideaId}. Redirecting to clarification...
          </p>
        </section>
      )}

      <section aria-labelledby="how-it-works-heading">
        <h3 id="how-it-works-heading" className="sr-only">
          How It Works
        </h3>
        <FeatureGrid />
      </section>

      <section aria-labelledby="why-choose-heading">
        <h3 id="why-choose-heading" className="sr-only">
          Why Choose IdeaFlow
        </h3>
        <WhyChooseSection />
      </section>
    </div>
  );
}
