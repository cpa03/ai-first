/**
 * Theme Module Index
 * Re-exports all theme sub-modules for backward compatibility
 */

// Colors
export {
  SECTION_INDICATOR_COLORS,
  SUCCESS_STATE_COLORS,
  LANDING_PAGE_COLORS,
  BORDER_COLORS,
  DIVIDE_COLORS,
  RING_COLORS,
  TEXT_COLORS,
  BG_COLORS,
  CELEBRATION_COLORS,
  BRAND_COLORS,
  CONFETTI_COLORS,
  OAUTH_PROVIDER_COLORS,
  ACTION_COLORS,
  CHAR_COUNT_COLORS,
  COMPONENT_STATE_COLORS,
} from './colors';

export type {
  BorderColors,
  RingColors,
  TextColors,
  BgColors,
  CelebrationColors,
  CharCountColors,
} from './colors';

// Shadows
export { STATE_SHADOWS, FOCUS_SHADOWS, SHADOW_CLASSES } from './shadows';
export type { FocusShadows, ShadowClasses } from './shadows';

// Animations
export {
  ANIMATION_DURATIONS,
  ANIMATION_DELAYS,
  DURATION_TAILWIND,
  RIPPLE_CONFIG,
  ANIMATION_PHYSICS,
  SVG_ANIMATION,
  TRANSITION_CLASSES,
} from './animations';

export type {
  DurationTailwind,
  AnimationDelays,
  AnimationPhysics,
  TransitionClasses,
} from './animations';

// Styles
export {
  INPUT_STYLES,
  BUTTON_STYLES,
  ALERT_STYLES,
  ALERT_BASE_STYLES,
  DELIVERABLE_STYLES,
  TABLE_PATTERNS,
  MODAL_PATTERNS,
  SPINNER_PATTERNS,
  CARD_PATTERNS,
  LOADING_PATTERNS,
  SKELETON_PATTERNS,
  SKELETON_SIZE_PATTERNS,
  GRADIENT_PATTERNS,
  GRADIENT_CONFIG,
} from './styles';

export type {
  InputStyles,
  ButtonStyles,
  AlertStyles,
  SkeletonPatterns,
  GradientPatterns,
  GradientConfig,
} from './styles';

// Sizes
export {
  SPACING_PX,
  SIZES,
  SVG_SIZES,
  SVG_CIRCLE,
  GAP_SIZES,
  Z_INDEX_LAYERS,
  PROGRESS_BAR_A11Y,
  TOOLTIP_CONFIG,
} from './sizes';

// SVG
export { SVG_VIEWBOX, SVG_NAMESPACE, SVG_STROKE_WIDTHS } from './svg';

// Classes
export {
  KBD_CLASSES,
  TEXT_COLOR_CLASSES,
  BG_COLOR_CLASSES,
  BORDER_COLOR_CLASSES,
  FOCUS_RING_CLASSES,
  SPACING_CLASSES,
  TYPOGRAPHY_CLASSES,
  LAYOUT_CLASSES,
  ROUNDED_CLASSES,
  PRIMARY_FOCUS_RING,
  PRIMARY_LINK,
  PRIMARY_LINK_FOCUS,
  PRIMARY_ACTIVE_LINK,
  PRIMARY_INACTIVE_LINK,
  TAILWIND_UTILS,
} from './classes';

export type {
  TextColorClasses as TextColorClassesClass,
  BgColorClasses as BgColorClassesClass,
  BorderColorClasses as BorderColorClassesClass,
  FocusRingClasses as FocusRingClassesClass,
  SpacingClasses as SpacingClassesClass,
  TypographyClasses as TypographyClassesClass,
  LayoutClasses as LayoutClassesClass,
  RoundedClasses as RoundedClassesClass,
  TailwindUtils as TailwindUtilsClass,
} from './classes';
