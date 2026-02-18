'use client';

import { useEffect, useRef, useState } from 'react';

interface Feature {
  step: number;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    step: 1,
    title: 'Input Your Idea',
    description:
      'Share your concept in natural language - no technical knowledge required',
  },
  {
    step: 2,
    title: 'AI Analysis',
    description:
      'Our AI clarifies requirements and breaks down complex projects into manageable tasks',
  },
  {
    step: 3,
    title: 'Action Plan',
    description:
      'Receive detailed blueprints, timelines, and prioritized task lists ready for execution',
  },
];

export default function FeatureGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="mt-16 grid md:grid-cols-3 gap-8"
    >
      <h2 id="how-it-works-heading" className="sr-only">
        How It Works
      </h2>
      {features.map((feature, index) => (
        <article
          key={feature.step}
          className={`
            group relative text-center p-6 rounded-xl
            gradient-border-hover card-lift feature-card-focus
            bg-white cursor-pointer
            motion-reduce:transition-none
            ${isVisible ? `animate-stagger-${index + 1}` : 'opacity-0'}
          `}
          tabIndex={0}
          aria-label={`Step ${feature.step}: ${feature.title}. ${feature.description}`}
        >
          <div
            className="
              bg-primary-100 rounded-full w-16 h-16 
              flex items-center justify-center mx-auto mb-4
              transition-all duration-300 group-hover:scale-110
              group-hover:bg-primary-200
              motion-reduce:transition-none motion-reduce:group-hover:scale-100
            "
            aria-hidden="true"
          >
            <span className="badge-animate text-primary-600 text-2xl font-bold">
              {feature.step}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
            {feature.description}
          </p>

          {index < features.length - 1 && (
            <div
              className="
                hidden md:block absolute top-1/2 -right-4 
                w-8 h-0.5 bg-gradient-to-r from-primary-300 to-primary-100
                transform -translate-y-1/2
                opacity-0 group-hover:opacity-100 
                transition-opacity duration-500 delay-100
                motion-reduce:opacity-0
              "
              aria-hidden="true"
            />
          )}
        </article>
      ))}
    </section>
  );
}
