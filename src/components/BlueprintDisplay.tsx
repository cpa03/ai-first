'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import Skeleton from '@/components/Skeleton';
import LoadingAnnouncer from '@/components/LoadingAnnouncer';
import SuccessCelebration from '@/components/SuccessCelebration';
import Tooltip from '@/components/Tooltip';
import { useBlueprintGeneration } from '@/hooks/useBlueprintGeneration';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useConfetti } from '@/hooks/useConfetti';
import { useFocusManagement } from '@/hooks/useAnnouncement';
import {
  MESSAGES,
  COMPONENT_DEFAULTS,
  COMPONENT_CONFIG,
  SVG_SIZES,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  UI_CONFIG,
  CARD_PATTERNS,
  BLUEPRINT_DISPLAY_LABELS,
  TRANSITION_CLASSES,
  TEXT_COLOR_CLASSES,
  BORDER_COLOR_CLASSES,
  BG_COLOR_CLASSES,
  BADGE_STYLES,
  COMPONENT_STATE_COLORS,
  ICON_SIZES,
  MR_CLASSES,
  CONFETTI_DOT,
  SKELETON_SIZE_PATTERNS,
  SPACE_Y_PATTERNS,
  SPACE_X_PATTERNS,
  BLUEPRINT_DISPLAY_STYLES,
} from '@/lib/config';
import { FOCUS_RING_OFFSET_PATTERNS } from '@/lib/config/focus-ring-offsets';
import {
  BLUEPRINT_ELEMENT_IDS,
  ARIA_HEADING_IDS,
} from '@/lib/config/element-ids';
import { triggerHapticFeedback } from '@/lib/utils';
import { createLogger } from '@/lib/logger';
import { CSS_POSITIONING } from '@/lib/config/css-positioning';

interface BlueprintDisplayProps {
  idea: string;
  answers: Record<string, string>;
}

const BlueprintDisplayComponent = function BlueprintDisplay({
  idea,
  answers,
}: BlueprintDisplayProps) {
  const {
    isGenerating,
    blueprint,
    copied,
    showCelebration,
    handleDownload,
    handleCopy,
    dismissCelebration,
  } = useBlueprintGeneration(idea, answers);

  const prefersReducedMotion = usePrefersReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [wasGenerating, setWasGenerating] = useState(isGenerating);

  const { storeFocus } = useFocusManagement(!isGenerating && wasGenerating, {
    delay: 0,
    restoreFocus: true,
  });

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [isGenerating]);

  const handlePrint = useCallback(() => {
    triggerHapticFeedback();
    window.print();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isGenerating && blueprint && (e.metaKey || e.ctrlKey)) {
        if (e.key === 'c') {
          const selection = window.getSelection();
          if (selection && selection.toString().length > 0) {
            return;
          }

          e.preventDefault();
          triggerHapticFeedback();
          handleCopy();
        } else if (e.key === 'p') {
          e.preventDefault();
          triggerHapticFeedback();
          handlePrint();
        } else if (e.key === 'd') {
          e.preventDefault();
          triggerHapticFeedback();
          handleDownload();
        }
      }
    },
    [isGenerating, blueprint, handleCopy, handlePrint, handleDownload]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setWasGenerating(isGenerating);
  }, [isGenerating]);

  const handleCopyWithFocus = () => {
    storeFocus();
    handleCopy();
  };

  const handleDownloadWithFocus = () => {
    storeFocus();
    handleDownload();
  };

  const comingSoonBadgeClass = prefersReducedMotion
    ? ''
    : 'animate-coming-soon-badge';

  if (isGenerating) {
    return (
      <div className={UI_CONFIG.LAYOUT.CONTAINER}>
        <LoadingAnnouncer message={MESSAGES.LOADING.BLUEPRINT} />
        <div className={BLUEPRINT_DISPLAY_STYLES.LOADING_CENTER}>
          <LoadingSpinner
            size="lg"
            className={BLUEPRINT_DISPLAY_STYLES.LOADING_SPINNER}
            ariaLabel={MESSAGES.BLUEPRINT.ARIA_LABEL_GENERATING}
          />
          <h2
            className={`${BLUEPRINT_DISPLAY_STYLES.LOADING_TITLE} ${TEXT_COLOR_CLASSES.HEADING}`}
          >
            {MESSAGES.BLUEPRINT.GENERATING_TITLE}
          </h2>
          <p
            className={`${BLUEPRINT_DISPLAY_STYLES.LOADING_DESCRIPTION} ${TEXT_COLOR_CLASSES.BODY}`}
          >
            {MESSAGES.BLUEPRINT.GENERATING_DESCRIPTION}
          </p>
        </div>

        <section
          aria-labelledby={ARIA_HEADING_IDS.SKELETON}
          className={CARD_PATTERNS.BASE}
        >
          <header
            className={`border-b ${BORDER_COLOR_CLASSES.LIGHT} ${UI_CONFIG.LAYOUT.CARD_HEADER}`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Skeleton
                className={SKELETON_SIZE_PATTERNS.HEADING_SM}
                variant="text"
              />
              <Skeleton
                className={SKELETON_SIZE_PATTERNS.INPUT_RESPONSIVE_SM}
              />
            </div>
          </header>

          <div className={UI_CONFIG.LAYOUT.CARD_BODY}>
            <Skeleton
              className={SKELETON_SIZE_PATTERNS.SUBTITLE_SM}
              variant="text"
            />
            <Skeleton
              className={SKELETON_SIZE_PATTERNS.CAPTION_SM}
              variant="text"
            />
            <Skeleton
              className={SKELETON_SIZE_PATTERNS.CAPTION_SM}
              variant="text"
            />
            <Skeleton
              className={SKELETON_SIZE_PATTERNS.CAPTION_SM_FIVE_SIXTHS}
              variant="text"
            />

            <div className={`mt-6 sm:mt-8 ${SPACE_Y_PATTERNS.SM}`}>
              <Skeleton
                className={SKELETON_SIZE_PATTERNS.SUBTITLE_RESPONSIVE_SM}
                variant="text"
              />
              <Skeleton
                className={SKELETON_SIZE_PATTERNS.CAPTION_SM}
                variant="text"
              />
              <Skeleton
                className={SKELETON_SIZE_PATTERNS.CAPTION_SM}
                variant="text"
              />
            </div>

            <div className={`mt-4 sm:mt-6 ${SPACE_Y_PATTERNS.SM}`}>
              <Skeleton
                className={SKELETON_SIZE_PATTERNS.SUBTITLE_RESPONSIVE_SM}
                variant="text"
              />
              <Skeleton
                className={SKELETON_SIZE_PATTERNS.CAPTION_SM_ELEVEN_TWELFTHS}
                variant="text"
              />
              <Skeleton
                className={SKELETON_SIZE_PATTERNS.CAPTION_SM_TEN_TWELFTHS}
                variant="text"
              />
            </div>
          </div>

          <footer
            className={`border-t ${BORDER_COLOR_CLASSES.LIGHT} ${UI_CONFIG.LAYOUT.CARD_FOOTER}`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Skeleton
                className={SKELETON_SIZE_PATTERNS.CAPTION_SM_HALF}
                variant="text"
              />
              <div
                className={`flex sm:${SPACE_X_PATTERNS.LG} ${SPACE_Y_PATTERNS.SM} sm:space-y-0 w-full sm:w-auto flex-col sm:flex-row`}
              >
                <Skeleton
                  className={SKELETON_SIZE_PATTERNS.BUTTON_RESPONSIVE_SM}
                />
                <Skeleton
                  className={SKELETON_SIZE_PATTERNS.BUTTON_RESPONSIVE_MD}
                />
              </div>
            </div>
          </footer>
        </section>
      </div>
    );
  }

  return (
    <div className={UI_CONFIG.LAYOUT.CONTAINER}>
      <div className="print-only hidden">
        <h1 className={BLUEPRINT_DISPLAY_STYLES.PRINT_TITLE}>
          {MESSAGES.BLUEPRINT.PAGE_TITLE}
        </h1>
        <p
          className={`${BLUEPRINT_DISPLAY_STYLES.PRINT_IDEA} ${TEXT_COLOR_CLASSES.BODY}`}
        >
          {idea}
        </p>
        <hr className={BLUEPRINT_DISPLAY_STYLES.PRINT_DIVIDER} />
      </div>
      <section
        aria-labelledby={ARIA_HEADING_IDS.BLUEPRINT}
        className={`${CARD_PATTERNS.BASE} no-print`}
      >
        <header
          className={`border-b ${BORDER_COLOR_CLASSES.LIGHT} ${UI_CONFIG.LAYOUT.CARD_HEADER}`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2
              id={BLUEPRINT_ELEMENT_IDS.BLUEPRINT_HEADING}
              ref={headingRef}
              className={`text-xl sm:text-2xl font-semibold ${TEXT_COLOR_CLASSES.HEADING}`}
              tabIndex={-1}
              aria-live="polite"
            >
              {MESSAGES.BLUEPRINT.PAGE_TITLE}
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Tooltip
                content={
                  copied
                    ? MESSAGES.BLUEPRINT.COPIED_BUTTON
                    : MESSAGES.BLUEPRINT.COPY_BUTTON
                }
                shortcut={['⌘', 'C']}
              >
                <Button
                  onClick={handleCopyWithFocus}
                  variant="outline"
                  fullWidth={false}
                  aria-label={
                    copied
                      ? MESSAGES.BLUEPRINT.COPIED_BUTTON
                      : COMPONENT_DEFAULTS.ARIA_LABELS.COPY_BLUEPRINT
                  }
                >
                  {copied
                    ? MESSAGES.BLUEPRINT.COPIED_BUTTON
                    : MESSAGES.BLUEPRINT.COPY_BUTTON}
                </Button>
              </Tooltip>
              <Tooltip
                content={MESSAGES.BLUEPRINT.PRINT_BUTTON}
                shortcut={['⌘', 'P']}
              >
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  fullWidth={false}
                  aria-label={MESSAGES.BLUEPRINT.PRINT_ARIA_LABEL}
                >
                  <svg
                    className={`${ICON_SIZES.MD} ${MR_CLASSES.MD_SM}`}
                    fill="none"
                    viewBox={SVG_VIEWBOX.STANDARD}
                    stroke="currentColor"
                    strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  {MESSAGES.BLUEPRINT.PRINT_BUTTON}
                </Button>
              </Tooltip>
              <Tooltip
                content={MESSAGES.BLUEPRINT.DOWNLOAD_BUTTON}
                shortcut={['⌘', 'D']}
              >
                <Button
                  onClick={handleDownloadWithFocus}
                  variant="primary"
                  fullWidth={false}
                  aria-label={COMPONENT_DEFAULTS.ARIA_LABELS.DOWNLOAD_BLUEPRINT}
                >
                  {MESSAGES.BLUEPRINT.DOWNLOAD_BUTTON}
                </Button>
              </Tooltip>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          <div className="prose prose-sm sm:prose-lg max-w-none">
            <div className="relative group">
              <pre
                className={`whitespace-pre-wrap font-mono text-xs sm:text-sm ${TEXT_COLOR_CLASSES.INPUT} ${BG_COLOR_CLASSES.PAGE} p-4 sm:p-6 rounded-lg overflow-x-auto`}
                aria-label={MESSAGES.BLUEPRINT.ARIA_LABEL_CONTENT}
              >
                {blueprint}
              </pre>
              <div className="no-print">
                <CopyCodeButton text={blueprint || ''} />
              </div>
            </div>
          </div>
        </div>

        <footer
          className={`border-t ${BORDER_COLOR_CLASSES.LIGHT} ${UI_CONFIG.LAYOUT.CARD_FOOTER} no-print`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className={`text-xs sm:text-sm ${TEXT_COLOR_CLASSES.BODY}`}>
              {MESSAGES.BLUEPRINT.FOOTER_TEXT}
            </p>
            <div
              className={`flex sm:${SPACE_X_PATTERNS.LG} ${SPACE_Y_PATTERNS.SM} sm:space-y-0 w-full sm:w-auto flex-col sm:flex-row`}
            >
              <Button
                variant="secondary"
                fullWidth={false}
                aria-label={MESSAGES.BLUEPRINT.ARIA_LABEL_START_OVER}
                disabled
                disabledTooltip={MESSAGES.BLUEPRINT.TOOLTIP_START_OVER}
              >
                {MESSAGES.BLUEPRINT.START_OVER_BUTTON}
                <span
                  className={`${BADGE_STYLES.COMING_SOON} ${comingSoonBadgeClass}`}
                >
                  {MESSAGES.BLUEPRINT.COMING_SOON_BADGE}
                </span>
              </Button>
              <Button
                variant="primary"
                fullWidth={false}
                aria-label={MESSAGES.BLUEPRINT.ARIA_LABEL_EXPORT}
                disabled
                disabledTooltip={MESSAGES.BLUEPRINT.TOOLTIP_EXPORT}
              >
                {MESSAGES.BLUEPRINT.EXPORT_BUTTON}
                <span
                  className={`${BADGE_STYLES.COMING_SOON} ${comingSoonBadgeClass}`}
                >
                  {MESSAGES.BLUEPRINT.COMING_SOON_BADGE}
                </span>
              </Button>
            </div>
          </div>
        </footer>
      </section>

      <SuccessCelebration
        show={showCelebration}
        onComplete={dismissCelebration}
      />
    </div>
  );
};

function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logger = useMemo(() => createLogger('CopyCodeButton'), []);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { particles, fire } = useConfetti();

  // Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      triggerHapticFeedback();
      setCopied(true);
      fire();

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, COMPONENT_CONFIG.COPY_FEEDBACK.DURATION_MS);
    } catch (err) {
      logger.error('Failed to copy blueprint', err as Error);
    }
  }, [text, logger, fire]);

  return (
    <>
      <Tooltip
        content={
          copied
            ? BLUEPRINT_DISPLAY_LABELS.COPY_ARIA_SUCCESS
            : BLUEPRINT_DISPLAY_LABELS.COPY_ARIA_DEFAULT
        }
        shortcut={copied ? undefined : [isMac ? '⌘' : 'Ctrl', 'C']}
        position="top"
      >
        <button
          onClick={handleCopy}
          className={`
            absolute top-3 right-3 
            flex items-center gap-1.5 px-2.5 py-1.5 
            text-xs font-medium rounded-md
            ${TRANSITION_CLASSES.DEFAULT_EASE_OUT}
            ${FOCUS_RING_OFFSET_PATTERNS.DEFAULT}
            ${prefersReducedMotion ? '' : 'motion-reduce:transition-none'}
            ${
              copied
                ? COMPONENT_STATE_COLORS.BLUEPRINT.COPIED
                : `${COMPONENT_STATE_COLORS.BLUEPRINT.DEFAULT} shadow-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 touch-device-visible`
            }
          `}
          aria-label={
            copied
              ? BLUEPRINT_DISPLAY_LABELS.COPY_ARIA_SUCCESS
              : BLUEPRINT_DISPLAY_LABELS.COPY_ARIA_DEFAULT
          }
          aria-live="polite"
          type="button"
        >
          {copied ? (
            <svg
              className={`${SVG_SIZES.SMD} ${prefersReducedMotion ? '' : `animate-in fade-in zoom-in ${TRANSITION_CLASSES.DEFAULT}`}`}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.EXTRA_THICK}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className={SVG_SIZES.SMD}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
          <span className="hidden sm:inline">
            {copied
              ? BLUEPRINT_DISPLAY_LABELS.COPY_BUTTON_SUCCESS
              : BLUEPRINT_DISPLAY_LABELS.COPY_BUTTON_DEFAULT}
          </span>
        </button>
      </Tooltip>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={CONFETTI_DOT}
          style={
            {
              ...CSS_POSITIONING.CENTER_ANIMATED,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              '--confetti-x': `${particle.x}px`,
              '--confetti-y': `${particle.y}px`,
              animationDelay: `${particle.delay}ms`,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export default React.memo(BlueprintDisplayComponent);
