import Skeleton from '@/components/Skeleton';
import {
  CARD_PATTERNS,
  PAGE_LAYOUT_CLASSES,
  COMPONENT_CONFIG,
  COMPONENT_STYLES,
} from '@/lib/config';
import { COMPONENT_DEFAULTS } from '@/lib/config/ui';

const SKELETON_SHOW_DELAY = COMPONENT_CONFIG.SKELETON.DEFAULT_SHOW_DELAY_MS;
const { SKELETON_SIZES, PAGE_STYLES } = COMPONENT_STYLES.LOADING;

export default function ResultsLoading() {
  return (
    <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
      <div className={PAGE_STYLES.HEADER_CONTAINER}>
        <Skeleton
          className={SKELETON_SIZES.TEXT_H9_W48}
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className={SKELETON_SIZES.TEXT_H10_W24}
          variant="rect"
          showDelay={SKELETON_SHOW_DELAY}
        />
      </div>

      <div
        className={`${CARD_PATTERNS.CENTERED} ${PAGE_STYLES.BLUEPRINT_CONTENT}`}
      >
        <Skeleton
          className={SKELETON_SIZES.TEXT_H4_W23}
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className={SKELETON_SIZES.TEXT_H4_WFULL}
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className={SKELETON_SIZES.TEXT_H4_W56}
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className={SKELETON_SIZES.TEXT_H4_W46}
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className={SKELETON_SIZES.TEXT_HPX_WFULL}
          variant="rect"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className={SKELETON_SIZES.TEXT_H4_W34}
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <Skeleton
          className={SKELETON_SIZES.TEXT_H4_W23}
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
      </div>

      <div className={PAGE_STYLES.SECTION_WITH_MARGIN}>
        <Skeleton
          className={SKELETON_SIZES.TEXT_H6_W40}
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <div
          className={`${CARD_PATTERNS.WITH_MARGIN} ${PAGE_STYLES.TASK_CONTENT}`}
        >
          <Skeleton
            className={SKELETON_SIZES.TEXT_H4_WFULL}
            variant="text"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className={SKELETON_SIZES.TEXT_H4_W56}
            variant="text"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className={SKELETON_SIZES.TEXT_H4_W46}
            variant="text"
            showDelay={SKELETON_SHOW_DELAY}
          />
        </div>
      </div>

      <div className={PAGE_STYLES.EXPORT_SECTION}>
        <Skeleton
          className={SKELETON_SIZES.TEXT_H7_W40}
          variant="text"
          showDelay={SKELETON_SHOW_DELAY}
        />
        <div className={PAGE_STYLES.EXPORT_GRID}>
          <Skeleton
            className={SKELETON_SIZES.TEXT_H11_ROUNDED}
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className={SKELETON_SIZES.TEXT_H11_ROUNDED}
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className={SKELETON_SIZES.TEXT_H11_ROUNDED}
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className={SKELETON_SIZES.TEXT_H11_ROUNDED}
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className={SKELETON_SIZES.TEXT_H11_ROUNDED}
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className={SKELETON_SIZES.TEXT_H11_ROUNDED}
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />
        </div>
      </div>

      <div
        className={PAGE_STYLES.SR_ONLY}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {COMPONENT_DEFAULTS.LOADING_TEXT.PROJECT_BLUEPRINT}
      </div>
    </div>
  );
}
