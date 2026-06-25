'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { ANIMATION_DELAYS, FEATURE_CONFIG } from '@/lib/config';

function FeatureGridComponent() {
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
        threshold: FEATURE_CONFIG.OBSERVER_THRESHOLD,
        rootMargin: FEATURE_CONFIG.OBSERVER_ROOT_MARGIN,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animationClasses = [
    FEATURE_CONFIG.ANIMATION_DELAYS.STEP_1,
    FEATURE_CONFIG.ANIMATION_DELAYS.STEP_2,
    FEATURE_CONFIG.ANIMATION_DELAYS.STEP_3,
  ];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="mt-16 grid md:grid-cols-3 gap-8"
    >
      <h2 id="how-it-works-heading" className="sr-only">
        How It Works
      </h2>
      {FEATURE_CONFIG.FEATURES.map((feature, index) => (
        <article
          key={feature.step}
          className={`
            group relative text-center p-6 rounded-xl
            gradient-border-hover card-lift feature-card-focus
            bg-white
            motion-reduce:transition-none
            ${isVisible ? animationClasses[index] : 'opacity-0'}
          `}
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

          {index < FEATURE_CONFIG.FEATURES.length - 1 && (
            <>
              {/* Desktop: Horizontal connector arrow */}
              <div
                className={`
                  hidden md:block absolute top-1/2 -right-4 
                  w-8 h-0.5 bg-gradient-to-r from-primary-300 to-primary-100
                  transform -translate-y-1/2
                  opacity-0 group-hover:opacity-100 
                  transition-opacity duration-500 ${ANIMATION_DELAYS.TAILWIND[100]}
                  motion-reduce:opacity-0
                `}
                aria-hidden="true"
              />
              {/* Mobile: Vertical connector line for step flow clarity */}
              <div
                className={`
                  md:hidden absolute left-1/2 -bottom-4
                  w-0.5 h-8 bg-gradient-to-b from-primary-300 to-primary-100
                  transform -translate-x-1/2
                  ${isVisible ? 'fade-in' : 'opacity-0'}
                `}
                aria-hidden="true"
              />
            </>
          )}
        </article>
      ))}
    </section>
  );
}

export default memo(FeatureGridComponent);
