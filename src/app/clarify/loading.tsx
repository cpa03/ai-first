import Skeleton from '@/components/Skeleton';
import {
  CARD_PATTERNS,
  PAGE_LAYOUT_CLASSES,
  COMPONENT_CONFIG,
  COMPONENT_STYLES,
  SPACE_Y_PATTERNS,
} from '@/lib/config';
import { COMPONENT_DEFAULTS } from '@/lib/config/ui';

const SKELETON_SHOW_DELAY = COMPONENT_CONFIG.SKELETON.DEFAULT_SHOW_DELAY_MS;
const { SKELETON_SIZES, PAGE_STYLES } = COMPONENT_STYLES.LOADING;

export default function ClarifyLoading() {
  return (
    <div className={PAGE_STYLES.PY12}>
      <div
        className={`${PAGE_LAYOUT_CLASSES.CONTAINER_SM} ${PAGE_STYLES.MX_AUTO_PX4_MB8}`}
      >
        <div className={PAGE_STYLES.TEXT_CENTER}>
          <Skeleton
            className={`${SKELETON_SIZES.TEXT_H6_W64} mx-auto`}
            variant="text"
            showDelay={SKELETON_SHOW_DELAY}
          />
          <Skeleton
            className={`${SKELETON_SIZES.TEXT_H5_W80} mx-auto`}
            variant="text"
            showDelay={SKELETON_SHOW_DELAY}
          />
        </div>
      </div>

      <div
        className={`${PAGE_LAYOUT_CLASSES.CONTAINER_SM} ${PAGE_STYLES.MX_AUTO_PX4}`}
      >
        <div className={`${CARD_PATTERNS.ANIMATED} ${SPACE_Y_PATTERNS.XL}`}>
          <div className={PAGE_STYLES.QUESTION_CONTAINER}>
            <Skeleton
              className={SKELETON_SIZES.TEXT_H5_W34}
              variant="text"
              showDelay={SKELETON_SHOW_DELAY}
            />
            <Skeleton
              className={SKELETON_SIZES.TEXT_H4_WFULL}
              variant="text"
              showDelay={SKELETON_SHOW_DELAY}
            />
          </div>

          <Skeleton
            className={SKELETON_SIZES.TEXT_H12_WFULL}
            variant="rect"
            showDelay={SKELETON_SHOW_DELAY}
          />

          <div className={PAGE_STYLES.BUTTON_CONTAINER}>
            <Skeleton
              className={SKELETON_SIZES.TEXT_H10_W28}
              variant="rect"
              showDelay={SKELETON_SHOW_DELAY}
            />
            <Skeleton
              className={SKELETON_SIZES.TEXT_H10_W24}
              variant="rect"
              showDelay={SKELETON_SHOW_DELAY}
            />
          </div>

          <div className={PAGE_STYLES.PROGRESS_DOTS}>
            <Skeleton
              className={SKELETON_SIZES.TEXT_H25_ROUNDED}
              variant="circle"
              showDelay={SKELETON_SHOW_DELAY}
            />
            <Skeleton
              className={SKELETON_SIZES.TEXT_H25_ROUNDED}
              variant="circle"
              showDelay={SKELETON_SHOW_DELAY}
            />
            <Skeleton
              className={SKELETON_SIZES.TEXT_H25_ROUNDED}
              variant="circle"
              showDelay={SKELETON_SHOW_DELAY}
            />
            <Skeleton
              className={SKELETON_SIZES.TEXT_H25_ROUNDED}
              variant="circle"
              showDelay={SKELETON_SHOW_DELAY}
            />
          </div>
        </div>
      </div>

      <div
        className={PAGE_STYLES.SR_ONLY}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {COMPONENT_DEFAULTS.LOADING_TEXT.CLARIFICATION_QUESTIONS}
      </div>
    </div>
  );
}
