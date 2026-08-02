import Skeleton from '@/components/Skeleton';
import { CARD_PATTERNS, PAGE_LAYOUT_CLASSES } from '@/lib/config';

/**
 * Route-level loading state for /clarify.
 *
 * Provides instant skeleton feedback during route transitions — before the
 * page component mounts and its Suspense boundary activates. Mirrors the
 * centered card layout of the actual clarify page for visual continuity.
 */
export default function ClarifyLoading() {
  return (
    <div className="py-12">
      <div className={`${PAGE_LAYOUT_CLASSES.CONTAINER_SM} mx-auto px-4 mb-8`}>
        <div className="text-center space-y-4">
          <Skeleton
            className="h-9 w-64 mx-auto"
            variant="text"
            showDelay={300}
          />
          <Skeleton
            className="h-5 w-80 mx-auto"
            variant="text"
            showDelay={300}
          />
        </div>
      </div>

      <div className={`${PAGE_LAYOUT_CLASSES.CONTAINER_SM} mx-auto px-4`}>
        <div className={`${CARD_PATTERNS.ANIMATED} space-y-6`}>
          {/* Question skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-3/4" variant="text" showDelay={300} />
            <Skeleton className="h-4 w-full" variant="text" showDelay={300} />
          </div>

          {/* Input field skeleton */}
          <Skeleton
            className="h-12 w-full rounded-lg"
            variant="rect"
            showDelay={300}
          />

          {/* Button skeletons */}
          <div className="flex gap-3">
            <Skeleton
              className="h-10 w-28 rounded-lg"
              variant="rect"
              showDelay={300}
            />
            <Skeleton
              className="h-10 w-24 rounded-lg"
              variant="rect"
              showDelay={300}
            />
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-2">
            <Skeleton
              className="h-2.5 w-2.5 rounded-full"
              variant="circle"
              showDelay={300}
            />
            <Skeleton
              className="h-2.5 w-2.5 rounded-full"
              variant="circle"
              showDelay={300}
            />
            <Skeleton
              className="h-2.5 w-2.5 rounded-full"
              variant="circle"
              showDelay={300}
            />
            <Skeleton
              className="h-2.5 w-2.5 rounded-full"
              variant="circle"
              showDelay={300}
            />
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Loading clarification questions…
      </div>
    </div>
  );
}
