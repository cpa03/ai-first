'use client';

import { memo, useEffect, useRef, useState, useCallback } from 'react';
import {
  WHY_CHOOSE_CONFIG,
  FEATURE_CONFIG,
  UI_STRINGS,
  SVG_VIEWBOX,
  WHY_CHOOSE_SECTION_LABELS,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';

function WhyChooseSectionComponent() {
  const { TITLE, SECTION_STYLES, ARTICLES, ARTICLE_STYLES } = WHY_CHOOSE_CONFIG;
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isArticleFocused = target.closest('[data-why-choose-article]');

      if (!isArticleFocused) return;

      const currentIndex = ARTICLES.findIndex(
        (article) => article.id === target.dataset.articleId
      );
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = Math.min(currentIndex + 1, ARTICLES.length - 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = ARTICLES.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        const nextArticle = document.querySelector(
          `[data-article-id="${ARTICLES[nextIndex].id}"]`
        ) as HTMLElement;
        if (nextArticle) {
          nextArticle.focus();
          setFocusedIndex(nextIndex);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [ARTICLES]);

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  const handleClick = useCallback((_articleTitle: string) => {
    triggerHapticFeedback();
  }, []);

  const animationClasses = UI_STRINGS.ANIMATION.WHY_CHOOSE;

  return (
    <section
      ref={sectionRef}
      className={SECTION_STYLES.CONTAINER}
      aria-labelledby="why-choose-heading"
    >
      <h2 id="why-choose-heading" className={SECTION_STYLES.HEADING}>
        {TITLE}
      </h2>
      <div
        className={SECTION_STYLES.GRID}
        role="list"
        aria-label={WHY_CHOOSE_SECTION_LABELS.BENEFITS_LIST_ARIA_LABEL}
      >
        {ARTICLES.map((article, index) => (
          <div
            key={article.id}
            data-why-choose-article
            data-article-id={article.id}
            role="listitem"
            tabIndex={0}
            aria-label={article.TITLE}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            onClick={() => handleClick(article.TITLE)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(article.TITLE);
              }
            }}
            className={`group ${ARTICLE_STYLES.CONTAINER} ${article.HOVER_BORDER} ${article.HOVER_BG} ${
              isVisible ? animationClasses[index] : 'opacity-0'
            } ${focusedIndex === index ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
          >
            <div
              className={`${ARTICLE_STYLES.ICON_CONTAINER} ${article.ICON_BG} ${article.ICON_HOVER_BG}`}
              aria-hidden="true"
            >
              <svg
                className={`${ARTICLE_STYLES.ICON_SVG} ${article.ICON_COLOR}`}
                fill="currentColor"
                viewBox={SVG_VIEWBOX.SMALL}
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
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(WhyChooseSectionComponent);
