/**
 * Theme Configuration - Re-export Layer
 * This file re-exports all theme constants from sub-modules for backward compatibility.
 *
 * For new code, import directly from the specific sub-module:
 * - '@/lib/config/theme/colors' for color constants
 * - '@/lib/config/theme/shadows' for shadow utilities
 * - '@/lib/config/theme/animations' for animation configs
 * - '@/lib/config/theme/styles' for component styles
 * - '@/lib/config/theme/sizes' for size/spacing constants
 * - '@/lib/config/theme/svg' for SVG constants
 * - '@/lib/config/theme/classes' for Tailwind utility classes
 */

// Re-export everything from sub-modules
export * from './theme/colors';
export * from './theme/shadows';
export * from './theme/animations';
export * from './theme/styles';
export * from './theme/sizes';
export * from './theme/svg';
export * from './theme/classes';
