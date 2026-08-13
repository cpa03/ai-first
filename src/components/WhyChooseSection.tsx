'use client';

import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { WHY_CHOOSE_CONFIG, FEATURE_CONFIG } from '@/lib/config/landing-page';
import { UI_STRINGS, UI_CONFIG } from '@/lib/config/ui';
import { SVG_VIEWBOX, TEXT_COLOR_CLASSES } from '@/lib/config/theme';
import { WHY_CHOOSE_SECTION_LABELS } from '@/lib/config/component-labels';
import { CSS_CONTAINMENT } from '@/lib/config';
import {
  HOME_PAGE_ELEMENT_IDS,
  ARIA_HEADING_IDS,
} from '@/lib/config/element-ids';
import { triggerHapticFeedback } from '@/lib/utils';

function WhyChooseSectionComponent() {
  const { TITLE, SECTION_STYLES, ARTICLES, ARTICLE_STYLES } = WHY_CHOOSE_CONFIG;
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');

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

  const handleFocus = useCallback(
    (index: number) => {
      setFocusedIndex(index);
      setAnnouncement(
        WHY_CHOOSE_SECTION_LABELS.ITEM_NAVIGATION_ANNOUNCEMENT(
          ARTICLES[index].TITLE,
          index + 1,
          ARTICLES.length
        )
      );
    },
    [ARTICLES]
  );

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
      aria-labelledby={ARIA_HEADING_IDS.WHY_CHOOSE}
      style={CSS_CONTAINMENT.LAYOUT}
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      <h2
        id={HOME_PAGE_ELEMENT_IDS.WHY_CHOOSE_HEADING}
        className={SECTION_STYLES.HEADING}
      >
        {TITLE}
      </h2>
      <ul
        className={SECTION_STYLES.GRID}
        role="list"
        aria-label={WHY_CHOOSE_SECTION_LABELS.BENEFITS_LIST_ARIA_LABEL}
      >
        {ARTICLES.map((article, index) => (
          <li
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
          </li>
        ))}
      </ul>
      <div
        className={`hidden sm:flex items-center justify-center gap-2 mt-6 text-xs ${TEXT_COLOR_CLASSES.MUTED}`}
        aria-label={WHY_CHOOSE_SECTION_LABELS.KEYBOARD_NAV_ARIA_LABEL}
      >
        <span className="flex items-center gap-1.5">
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            ←
          </kbd>
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            →
          </kbd>
          <span>{WHY_CHOOSE_SECTION_LABELS.KEYBOARD_NAV_HINT}</span>
        </span>
        <span className={`${TEXT_COLOR_CLASSES.MUTED}`} aria-hidden="true">
          ·
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            Home
          </kbd>
          <kbd className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}>
            End
          </kbd>
          <span>jump to first/last</span>
        </span>
      </div>
    </section>
  );
}

export default memo(WhyChooseSectionComponent);
