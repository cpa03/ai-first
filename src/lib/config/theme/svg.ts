/**
 * Theme SVG Module
 * Centralizes all SVG-related theme constants
 */

import { EnvLoader } from '../environment';

/**
 * SVG ViewBox Configuration
 */
export const SVG_VIEWBOX = {
  STANDARD: '0 0 24 24',
  SMALL: '0 0 20 20',
  LARGE: '0 0 48 48',
} as const;

/**
 * SVG namespace URLs
 */
export const SVG_NAMESPACE = {
  SVG: 'http://www.w3.org/2000/svg',
  XLINK: 'http://www.w3.org/1999/xlink',
} as const;

/**
 * SVG Stroke Width Configuration
 */
export const SVG_STROKE_WIDTHS = {
  STANDARD: EnvLoader.number('SVG_STROKE_WIDTH_STANDARD', 2, 1, 4),
  LIGHT: EnvLoader.number('SVG_STROKE_WIDTH_LIGHT', 1.5, 0.5, 3),
  THICK: EnvLoader.number('SVG_STROKE_WIDTH_THICK', 3, 2, 6),
  EXTRA_THICK: EnvLoader.number('SVG_STROKE_WIDTH_EXTRA_THICK', 2.5, 1, 5),
  SPINNER: EnvLoader.number('SVG_STROKE_WIDTH_SPINNER', 4, 2, 6),
} as const;
