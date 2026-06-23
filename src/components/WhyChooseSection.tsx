'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { WHY_CHOOSE_CONFIG, FEATURE_CONFIG } from '@/lib/config';

function WhyChooseSectionComponent() {
  const { TITLE, SECTION_STYLES, ARTICLES, ARTICLE_STYLES } = WHY_CHOOSE_CONFIG;
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
    'animate-why-choose-1',
    'animate-why-choose-2',
    'animate-why-choose-3',
    'animate-why-choose-4',
  ];

  return (
    <section
      ref={sectionRef}
      className={SECTION_STYLES.CONTAINER}
      aria-labelledby="why-choose-heading"
    >
      <h2 id="why-choose-heading" className={SECTION_STYLES.HEADING}>
        {TITLE}
      </h2>
      <div className={SECTION_STYLES.GRID}>
        {ARTICLES.map((article, index) => (
          <article
            key={article.id}
            className={`group ${ARTICLE_STYLES.CONTAINER} ${article.HOVER_BORDER} ${article.HOVER_BG} ${
              isVisible ? animationClasses[index] : 'opacity-0'
            }`}
          >
            <div
              className={`${ARTICLE_STYLES.ICON_CONTAINER} ${article.ICON_BG} ${article.ICON_HOVER_BG}`}
              aria-hidden="true"
            >
              <svg
                className={`${ARTICLE_STYLES.ICON_SVG} ${article.ICON_COLOR}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d={article.SVG_PATH}
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className={ARTICLE_STYLES.TITLE}>{article.TITLE}</h3>
              <p className={ARTICLE_STYLES.DESCRIPTION}>
                {article.DESCRIPTION}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default memo(WhyChooseSectionComponent);
