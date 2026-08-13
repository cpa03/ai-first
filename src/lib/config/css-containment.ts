/**
 * CSS Containment Configuration
 *
 * Centralizes all CSS containment values used throughout the application.
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { CSS_CONTAINMENT } from '@/lib/config/css-containment';
 *
 * // Instead of hardcoded style:
 * <div style={{ contain: 'layout' }}>
 *
 * // Use modular config:
 * <div style={CSS_CONTAINMENT.LAYOUT}>
 * ```
 */

/**
 * CSS Containment Values
 * Used for performance optimization by limiting browser layout/paint scope
 */
export const CSS_CONTAINMENT = {
  /**
   * Layout containment - isolates layout changes to this element
   * Used in: HomePageClient, FeatureGrid, WhyChooseSection
   */
  LAYOUT: { contain: 'layout' } as React.CSSProperties,

  /**
   * Paint containment - isolates painting to this element's bounding box
   * Used for: complex visual components
   */
  PAINT: { contain: 'paint' } as React.CSSProperties,

  /**
   * Style containment - isolates counter/scoped styles
   * Used for: nested style contexts
   */
  STYLE: { contain: 'style' } as React.CSSProperties,

  /**
   * Size containment - isolates size calculations
   * Used for: performance-critical sizing
   */
  SIZE: { contain: 'size' } as React.CSSProperties,

  /**
   * Layout + Paint containment - combines both optimizations
   * Used for: complex components that need both
   */
  LAYOUT_PAINT: { contain: 'layout paint' } as React.CSSProperties,

  /**
   * Strict containment - maximum isolation (layout + size + paint)
   * Used for: critical performance sections
   */
  STRICT: { contain: 'strict' } as React.CSSProperties,

  /**
   * Content containment - isolates content for independent rendering
   * Used for: independently renderable content blocks
   */
  CONTENT: { contain: 'content' } as React.CSSProperties,
} as const;

/**
 * CSS Containment Types
 */
export type CSSContainment = typeof CSS_CONTAINMENT;
export type CSSContainmentValue =
  (typeof CSS_CONTAINMENT)[keyof typeof CSS_CONTAINMENT];

/**
 * CSS Containment Class Names
 * For Tailwind CSS containment utilities (if needed)
 */
export const CSS_CONTAINMENT_CLASSES = {
  LAYOUT: 'contain-layout',
  PAINT: 'contain-paint',
  SIZE: 'contain-size',
  STYLE: 'contain-style',
  STRICT: 'contain-strict',
  CONTENT: 'contain-content',
} as const;

/**
 * Helper function to get containment style
 * @param type - Type of containment
 * @returns CSSProperties object
 */
export const getContainmentStyle = (
  type: keyof typeof CSS_CONTAINMENT
): CSSContainmentValue => {
  return CSS_CONTAINMENT[type];
};
