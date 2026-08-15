/**
 * CSS Positioning Configuration
 *
 * Centralizes all CSS positioning values used throughout the application.
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { CSS_POSITIONING } from '@/lib/config/css-positioning';
 *
 * // Instead of hardcoded style:
 * <div style={{ left: '50%', top: '50%' }}>
 *
 * // Use modular config:
 * <div style={CSS_POSITIONING.CENTER}>
 * ```
 */

/**
 * CSS Positioning Values
 * Commonly used CSS position values for centering and alignment
 */
export const CSS_POSITIONING = {
  /**
   * Center positioning - centers element both horizontally and vertically
   * Used in: Static centering where CSS transform is needed
   * For animated elements (confetti, etc.), use CENTER_ANIMATED instead
   */
  CENTER: {
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  } as React.CSSProperties,

  /**
   * Center horizontally only
   * Used in: LoadingSpinner, CopyButton, TaskManagementHeader
   */
  CENTER_HORIZONTAL: {
    left: '50%',
    transform: 'translateX(-50%)',
  } as React.CSSProperties,

  /**
   * Center vertically only
   * Used in: Vertical alignment scenarios
   */
  CENTER_VERTICAL: {
    top: '50%',
    transform: 'translateY(-50%)',
  } as React.CSSProperties,

  /**
   * Top-left corner
   * Used in: Absolute positioning from top-left
   */
  TOP_LEFT: {
    top: '0',
    left: '0',
  } as React.CSSProperties,

  /**
   * Top-right corner
   * Used in: Absolute positioning from top-right
   */
  TOP_RIGHT: {
    top: '0',
    right: '0',
  } as React.CSSProperties,

  /**
   * Bottom-left corner
   * Used in: Absolute positioning from bottom-left
   */
  BOTTOM_LEFT: {
    bottom: '0',
    left: '0',
  } as React.CSSProperties,

  /**
   * Bottom-right corner
   * Used in: Absolute positioning from bottom-right
   */
  BOTTOM_RIGHT: {
    bottom: '0',
    right: '0',
  } as React.CSSProperties,

  /**
   * Full coverage - covers entire parent
   * Used in: Overlay elements, full-size containers
   */
  FULL_COVERAGE: {
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
  } as React.CSSProperties,

  /**
   * Center top - horizontally centered, aligned to top
   */
  CENTER_TOP: {
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  } as React.CSSProperties,

  /**
   * Center bottom - horizontally centered, aligned to bottom
   */
  CENTER_BOTTOM: {
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',
  } as React.CSSProperties,

  /**
   * Middle left - vertically centered, aligned to left
   */
  MIDDLE_LEFT: {
    top: '50%',
    left: '0',
    transform: 'translateY(-50%)',
  } as React.CSSProperties,

  /**
   * Middle right - vertically centered, aligned to right
   */
  MIDDLE_RIGHT: {
    top: '50%',
    right: '0',
    transform: 'translateY(-50%)',
  } as React.CSSProperties,

  /**
   * Center for animations - centers element without transform
   * Used in: Confetti particles, animated elements that use CSS transforms via custom properties
   * This is different from CENTER because it doesn't include transform,
   * allowing CSS animations to handle positioning via --confetti-x, --confetti-y, etc.
   */
  CENTER_ANIMATED: {
    left: '50%',
    top: '50%',
  } as React.CSSProperties,

  /**
   * Center top for animations - horizontally centered,30% from top
   * Used in: TaskManagementHeader confetti particles
   */
  CENTER_TOP_ANIMATED: {
    left: '50%',
    top: '30%',
  } as React.CSSProperties,
} as const;

/**
 * CSS Positioning Types
 */
export type CSSPositioning = typeof CSS_POSITIONING;
export type CSSPositioningValue =
  (typeof CSS_POSITIONING)[keyof typeof CSS_POSITIONING];

/**
 * Helper function to get positioning style
 * @param type - Type of positioning
 * @returns CSSProperties object
 */
export const getPositioningStyle = (
  type: keyof typeof CSS_POSITIONING
): CSSPositioningValue => {
  return CSS_POSITIONING[type];
};

/**
 * CSS Positioning Class Names
 * For Tailwind CSS positioning utilities
 */
export const CSS_POSITIONING_CLASSES = {
  CENTER: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  CENTER_HORIZONTAL: 'absolute left-1/2 -translate-x-1/2',
  CENTER_VERTICAL: 'absolute top-1/2 -translate-y-1/2',
  TOP_LEFT: 'absolute top-0 left-0',
  TOP_RIGHT: 'absolute top-0 right-0',
  BOTTOM_LEFT: 'absolute bottom-0 left-0',
  BOTTOM_RIGHT: 'absolute bottom-0 right-0',
  FULL_COVERAGE: 'absolute inset-0',
  CENTER_TOP: 'absolute top-0 left-1/2 -translate-x-1/2',
  CENTER_BOTTOM: 'absolute bottom-0 left-1/2 -translate-x-1/2',
  MIDDLE_LEFT: 'absolute top-1/2 left-0 -translate-y-1/2',
  MIDDLE_RIGHT: 'absolute top-1/2 right-0 -translate-y-1/2',
  CENTER_ANIMATED: 'absolute left-1/2 top-1/2',
  CENTER_TOP_ANIMATED: 'absolute left-1/2 top-[30%]',
} as const;
