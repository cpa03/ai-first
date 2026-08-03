import Skeleton from '@/components/Skeleton';
import {
  CARD_PATTERNS,
  PAGE_LAYOUT_CLASSES,
  COMPONENT_CONFIG,
} from '@/lib/config';
import { COMPONENT_DEFAULTS } from '@/lib/config/ui';

/**
 * Route-level loading state for /results.
 *
 * Provides instant skeleton feedback during route transitions — before the
 * page component mounts and its Suspense boundary activates. Mirrors the
 * centered container layout of the actual results page for visual continuity.
 */
const SKELETON_SHOW_DELAY = COMPONENT_CONFIG.SKELETON.DEFAULT_SHOW_DELAY_MS;

export default function ResultsLoading() {
  return (
    <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-8">
        <Skeleton
          className="h-9 w-48"
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className="h-10 w-24 rounded-lg"
          variant="rect"
          showDelay={SKELETON_SHOW_DELAY}
        />
      </div>

      {/* Blueprint section skeleton */}
      <div className={`${CARD_PATTERNS.CENTERED} space-y-4`}>
        <Skeleton
          className="h-6 w-1/3"
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className="h-4 w-full"
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className="h-4 w-5/6"
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className="h-4 w-4/6"
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className="h-px w-full"
          variant="rect"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className="h-4 w-3/4"
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className="h-4 w-2/3"
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
      </div>

      {/* Task management skeleton */}
      <div className="mt-8 space-y-4">
        <Skeleton
          className="h-6 w-40"
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <div className={`${CARD_PATTERNS.WITH_MARGIN} space-y-3`}>
          <Skeleton
            className="h-4 w-full"
            variant="text"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className="h-4 w-5/6"
            variant="text"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className="h-4 w-4/6"
            variant="text"
            showDelay={SKELETON_SHOW_DELAY}
          />
        </div>
      </div>

      {/* Export buttons skeleton */}
      <div className="mt-8">
        <Skeleton
          className="h-7 w-40 mb-6"
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton
            className="h-11 rounded-lg"
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className="h-11 rounded-lg"
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className="h-11 rounded-lg"
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className="h-11 rounded-lg"
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className="h-11 rounded-lg"
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className="h-11 rounded-lg"
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
        </div>
      </div>

      {/* Screen reader announcement */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {COMPONENT_DEFAULTS.LOADING_TEXT.PROJECT_BLUEPRINT}
      </div>
    </div>
  );
}
