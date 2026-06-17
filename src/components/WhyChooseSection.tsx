import { memo } from 'react';
import { WHY_CHOOSE_CONFIG } from '@/lib/config';

// PERFORMANCE: Component is wrapped with memo to prevent unnecessary re-renders
// since it's a pure static component with no props, state, or dynamic content.
function WhyChooseSectionComponent() {
  const { TITLE, SECTION_STYLES, ARTICLES, ARTICLE_STYLES } = WHY_CHOOSE_CONFIG;

  return (
    <section
      className={SECTION_STYLES.CONTAINER}
      aria-labelledby="why-choose-heading"
    >
      <h2 id="why-choose-heading" className={SECTION_STYLES.HEADING}>
        {TITLE}
      </h2>
      <div className={SECTION_STYLES.GRID}>
        {ARTICLES.map((article) => (
          <article
            key={article.id}
            className={`${ARTICLE_STYLES.CONTAINER} ${article.HOVER_BORDER} ${article.HOVER_BG}`}
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
