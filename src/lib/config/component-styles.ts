/**
 * Component-Specific Tailwind Class Configuration
 *
 * Centralizes hardcoded Tailwind class strings used in components.
 * Follows the "Flexy" principle: eliminate hardcoded values and make
 * modular systems that are easy to maintain and update.
 *
 * Usage:
 * ```typescript
 * import { COMPONENT_STYLES } from '@/lib/config';
 *
 * // Instead of hardcoded className:
 * <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse">
 *
 * // Use modular config:
 * <div className={COMPONENT_STYLES.PULSE_DOT}>
 * ```
 */

import { BG_COLORS, TEXT_COLORS, BORDER_COLORS } from './theme';

/**
 * Pulse dot indicator styles
 * Used in: MobileNav, ClarificationFlow, AutoSaveIndicator, TaskManagement
 */
export const PULSE_DOT = `w-2 h-2 rounded-full ${BG_COLORS.BRAND_LIGHT} animate-pulse`;

/**
 * Keyboard hint kbd styles
 * Used in: MobileNav (keyboard shortcuts hints)
 */
export const KBD_STYLE = `px-1.5 py-0.5 text-xs font-mono ${TEXT_COLORS.MUTED} ${BG_COLORS.DEFAULT} ${BORDER_COLORS.LIGHT} rounded shadow-sm`;

/**
 * Toast clear all button styles
 * Used in: ToastContainer
 */
export const TOAST_CLEAR_ALL_BUTTON = `self-end mb-1 px-3 py-1.5 text-xs font-medium ${TEXT_COLORS.MUTED} ${BG_COLORS.DEFAULT} ${BORDER_COLORS.LIGHT} rounded-md shadow-sm hover:${BG_COLORS.LIGHT} hover:${TEXT_COLORS.PRIMARY} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 transition-all duration-200 animate-fade-in`;

/**
 * Progress bar track styles
 * Used in: ProgressStepper, TaskManagementSkeleton
 */
export const PROGRESS_BAR_TRACK = `h-1.5 ${BG_COLORS.PROGRESS_NEUTRAL} rounded-full overflow-hidden`;

/**
 * Progress bar skeleton styles
 * Used in: TaskManagementSkeleton
 */
export const SKELETON_PROGRESS = `h-2 ${BG_COLORS.PROGRESS_NEUTRAL} rounded-full overflow-hidden mb-4`;

/**
 * Primary pulse container styles
 * Used in: TaskManagement (loading indicator)
 */
export const PRIMARY_PULSE_CONTAINER = `absolute inset-0 ${BG_COLORS.BRAND_LIGHT} rounded-full animate-pulse`;

/**
 * Primary pulse inner circle styles
 * Used in: TaskManagement (loading indicator)
 */
export const PRIMARY_PULSE_INNER = `absolute inset-2 ${BG_COLORS.LIGHTER} rounded-full`;

/**
 * Referral icon container styles
 * Used in: ReferralLink
 */
export const REFERRAL_ICON_CONTAINER = `w-12 h-12 rounded-full ${BG_COLORS.LIGHTER} flex items-center justify-center`;

/**
 * Loading spinner ripple styles
 * Used in: LoadingSpinner
 */
export const LOADING_SPINNER_RIPPLE = `absolute rounded-full ${BG_COLORS.LIGHTER}/50 animate-ping-slow`;

/**
 * Keyboard shortcuts help category icon styles
 * Used in: KeyboardShortcutsHelp
 */
export const KEYBOARD_SHORTCUT_CATEGORY_ICON = `p-2 ${BG_COLORS.LIGHTER} rounded-lg`;

/**
 * Keyboard shortcuts help footer styles
 * Used in: KeyboardShortcutsHelp
 */
export const KEYBOARD_SHORTCUT_FOOTER = `px-6 py-4 border-t ${BORDER_COLORS.LIGHT} ${BG_COLORS.LIGHT}`;

/**
 * Button ripple effect styles
 * Used in: Button
 */
export const BUTTON_RIPPLE = `absolute rounded-full bg-white/30 pointer-events-none animate-ripple`;

/**
 * Scroll progress bar styles
 * Used in: ScrollProgress
 */
export const SCROLL_PROGRESS_BAR = `fixed top-0 left-0 right-0 h-1 bg-gray-100/80 backdrop-blur-sm`;

/**
 * Layout error fallback container styles
 * Used in: LayoutErrorFallback
 */
export const ERROR_FALLBACK_CONTAINER = `min-h-screen ${BG_COLORS.LIGHT} flex items-center justify-center p-4`;

/**
 * Toast progress bar styles
 * Used in: ToastContainer
 */
export const TOAST_PROGRESS_BAR = `absolute left-0 top-0 bottom-0 w-1 bg-current opacity-50 rounded-l-lg`;

/**
 * Toast dismiss button styles
 * Used in: ToastContainer
 */
export const TOAST_DISMISS_BUTTON = `absolute bottom-1.5 right-2 text-xs font-medium opacity-60 tabular-nums`;

/**
 * Clarification flow skeleton input styles
 * Used in: ClarificationFlow
 */
export const SKELETON_INPUT = `h-10 w-full`;

/**
 * Clarification flow skeleton textarea styles
 * Used in: ClarificationFlow
 */
export const SKELETON_TEXTAREA = `h-24 w-full`;

/**
 * Clarification flow skeleton button styles
 * Used in: ClarificationFlow
 */
export const SKELETON_BUTTON = (width: string) => `h-10 w-${width}`;

/**
 * Clarification flow navigation container styles
 * Used in: ClarificationFlow
 */
export const CLARIFICATION_NAV_CONTAINER = `flex justify-between items-center pt-4`;

/**
 * Password requirement icon styles
 * Used in: PasswordRequirementsChecklist
 */
export const PASSWORD_REQUIREMENT_ICON = `w-3 h-3 ${TEXT_COLORS.MUTED}`;

/**
 * Password requirement text styles
 * Used in: PasswordRequirementsChecklist
 */
export const PASSWORD_REQUIREMENT_TEXT = `text-xs font-medium ${TEXT_COLORS.MUTED}`;

/**
 * Step celebration checkmark container styles
 * Used in: StepCelebration
 */
export const STEP_CELEBRATION_CHECKMARK_CONTAINER = `w-10 h-10 rounded-full ${BG_COLORS.SUCCESS} flex items-center justify-center shadow-lg shadow-green-500/30`;

/**
 * Step celebration checkmark icon styles
 * Used in: StepCelebration
 */
export const STEP_CELEBRATION_CHECKMARK_ICON = `w-6 h-6 text-white`;

/**
 * Step celebration ripple 1 styles
 * Used in: StepCelebration
 */
export const STEP_CELEBRATION_RIPPLE_1 = `absolute inset-0 rounded-full border-4 border-primary-400/30`;

/**
 * Step celebration ripple 2 styles
 * Used in: StepCelebration
 */
export const STEP_CELEBRATION_RIPPLE_2 = `absolute inset-0 rounded-full border-4 border-primary-400/20`;

/**
 * Step celebration progress bar track styles
 * Used in: StepCelebration
 */
export const STEP_CELEBRATION_PROGRESS_TRACK = `mt-3 w-32 h-1.5 ${BG_COLORS.PROGRESS_NEUTRAL} rounded-full overflow-hidden`;

/**
 * Step celebration particle styles
 * Used in: StepCelebration
 */
export const STEP_CELEBRATION_PARTICLE = `absolute w-2 h-2 rounded-full ${BG_COLORS.BRAND_LIGHT}`;

/**
 * Step celebration text container styles
 * Used in: StepCelebration
 */
export const STEP_CELEBRATION_TEXT_CONTAINER = `mt-4 text-center`;

/**
 * Step celebration step complete text styles
 * Used in: StepCelebration
 */
export const STEP_CELEBRATION_STEP_COMPLETE = `text-lg font-bold ${TEXT_COLORS.PRIMARY}`;

/**
 * Step celebration progress complete text styles
 * Used in: StepCelebration
 */
export const STEP_CELEBRATION_PROGRESS_COMPLETE = `text-sm font-medium ${TEXT_COLORS.BRAND} mt-1`;

/**
 * Idea input form styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_FORM = `space-y-6 fade-in`;

/**
 * Idea input container styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_CONTAINER = `relative`;

/**
 * Idea input loading indicator styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_LOADING_INDICATOR = `w-3 h-3`;

/**
 * Idea input confetti dot styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_CONFETTI_DOT = `absolute rounded-full pointer-events-none animate-copy-confetti`;

/**
 * Idea input feedback text styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_FEEDBACK_TEXT = `text-sm ${TEXT_COLORS.BRAND} animate-fade-in`;

/**
 * Idea input error container styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_ERROR_CONTAINER = `slide-up`;

/**
 * Idea input error text styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_ERROR_TEXT = `text-sm`;

/**
 * Idea input status container styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_STATUS_CONTAINER = `flex justify-between items-center`;

/**
 * Idea input status items styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_STATUS_ITEMS = `flex items-center gap-4`;

/**
 * Idea input status item styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_STATUS_ITEM = `flex items-center gap-3`;

/**
 * Idea input send icon styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_SEND_ICON = `w-4 h-4 mr-1`;

/**
 * Idea input submit button text styles
 * Used in: IdeaInput
 */
export const IDEA_INPUT_SUBMIT_BUTTON_TEXT = `ml-2`;

/**
 * Clarification flow question heading styles
 * Used in: ClarificationFlow
 */
export const CLARIFICATION_FLOW_QUESTION_HEADING = `text-xl sm:text-2xl font-semibold ${TEXT_COLORS.PRIMARY} mb-6`;

/**
 * Clarification flow question description styles
 * Used in: ClarificationFlow
 */
export const CLARIFICATION_FLOW_QUESTION_DESCRIPTION = `sr-only`;

/**
 * Clarification flow answer container styles
 * Used in: ClarificationFlow
 */
export const CLARIFICATION_FLOW_ANSWER_CONTAINER = `space-y-4`;

/**
 * Clarification flow info text styles
 * Used in: ClarificationFlow
 */
export const CLARIFICATION_FLOW_INFO_TEXT = `text-sm mt-4`;

/**
 * Clarification flow keyboard hint text styles
 * Used in: ClarificationFlow
 */
export const CLARIFICATION_FLOW_KEYBOARD_HINT = `hidden sm:flex items-center gap-3 text-xs ${TEXT_COLORS.SECONDARY} mr-4`;

/**
 * Clarification flow step indicator container styles
 * Used in: ClarificationFlow
 */
export const CLARIFICATION_FLOW_STEP_INDICATOR = `mt-4 flex items-center justify-center gap-2 sm:gap-4 text-xs ${TEXT_COLORS.MUTED_DARK} animate-fade-in`;

/**
 * Clarification flow step indicator text styles
 * Used in: ClarificationFlow
 */
export const CLARIFICATION_FLOW_STEP_TEXT = `${TEXT_COLORS.MUTED} font-medium`;

/**
 * Clarification flow step separator styles
 * Used in: ClarificationFlow
 */
export const CLARIFICATION_FLOW_STEP_SEPARATOR = `${TEXT_COLORS.MUTED_LIGHT} mx-0.5`;

/**
 * Clarification flow input label styles
 * Used in: ClarificationFlow
 */
export const CLARIFICATION_FLOW_INPUT_LABEL = `block text-sm font-medium ${TEXT_COLORS.PRIMARY} cursor-pointer`;

/**
 * Mobile nav desktop link container styles
 * Used in: MobileNav
 */
export const MOBILE_NAV_DESKTOP_LINK = `flex space-x-2 sm:space-x-4`;

/**
 * Mobile nav desktop link item styles
 * Used in: MobileNav
 */
export const MOBILE_NAV_DESKTOP_LINK_ITEM = (isActive: boolean) => `
  px-4 py-3 text-sm sm:text-base font-medium
  border-b-2 ${isActive ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-800 hover:text-primary-600 hover:border-primary-300'}
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-t-md
  inline-flex items-center
  ${isActive ? 'bg-primary-50/30' : 'hover:bg-gray-50'}
`;

/**
 * Mobile nav active indicator styles
 * Used in: MobileNav
 */
export const MOBILE_NAV_ACTIVE_INDICATOR = `w-2 h-2 rounded-full ${BG_COLORS.BRAND_LIGHT} animate-pulse`;

/**
 * Mobile nav close button hint container styles
 * Used in: MobileNav
 */
export const MOBILE_NAV_CLOSE_HINT = `py-4 border-t ${BORDER_COLORS.LIGHT} ${BG_COLORS.DEFAULT}`;

/**
 * Mobile nav close button hint text styles
 * Used in: MobileNav
 */
export const MOBILE_NAV_CLOSE_HINT_TEXT = `text-xs ${TEXT_COLORS.MUTED} text-center flex items-center justify-center gap-2`;

/**
 * Mobile nav close button hint kbd styles
 * Used in: MobileNav
 */
export const MOBILE_NAV_CLOSE_HINT_KBD = `px-1.5 py-0.5 text-xs font-mono ${TEXT_COLORS.SECONDARY} ${BG_COLORS.DEFAULT} ${BORDER_COLORS.LIGHT} rounded shadow-sm`;

/**
 * Mobile nav menu item styles
 * Used in: MobileNav
 */
export const MOBILE_NAV_MENU_ITEM = (isActive: boolean) => `
  w-full text-left px-6 py-4 text-lg font-semibold
  rounded-md
  ${isActive ? 'border-primary-600 bg-primary-50/50 text-primary-600' : 'border-transparent text-gray-800 hover:text-primary-600 hover:bg-gray-50'}
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
  flex items-center justify-between
`;

/**
 * Mobile nav menu item indicator container styles
 * Used in: MobileNav
 */
export const MOBILE_NAV_MENU_INDICATOR_CONTAINER = `flex items-center gap-3`;

/**
 * Mobile nav menu item keyboard hint styles
 * Used in: MobileNav
 */
export const MOBILE_NAV_MENU_KEYBOARD_HINT = (visible: boolean) => `
  inline-flex items-center px-1.5 py-0.5
  ${BG_COLORS.PROGRESS_NEUTRAL} ${TEXT_COLORS.MUTED}
  rounded text-xs font-mono transition-opacity duration-300
  ${visible ? 'opacity-60' : 'opacity-0'}
`;

/**
 * All component styles grouped by component
 */
export const COMPONENT_STYLES = {
  // Shared styles
  PULSE_DOT,
  KBD_STYLE,
  PROGRESS_BAR_TRACK,
  SKELETON_PROGRESS,
  BUTTON_RIPPLE,
  SCROLL_PROGRESS_BAR,
  ERROR_FALLBACK_CONTAINER,

  // Toast styles
  TOAST: {
    CLEAR_ALL_BUTTON: TOAST_CLEAR_ALL_BUTTON,
    PROGRESS_BAR: TOAST_PROGRESS_BAR,
    DISMISS_BUTTON: TOAST_DISMISS_BUTTON,
  },

  // Task Management styles
  TASK_MANAGEMENT: {
    PRIMARY_PULSE_CONTAINER,
    PRIMARY_PULSE_INNER,
  },

  // Referral styles
  REFERRAL: {
    ICON_CONTAINER: REFERRAL_ICON_CONTAINER,
  },

  // Loading styles
  LOADING: {
    SPINNER_RIPPLE: LOADING_SPINNER_RIPPLE,
  },

  // Keyboard shortcuts styles
  KEYBOARD_SHORTCUTS: {
    CATEGORY_ICON: KEYBOARD_SHORTCUT_CATEGORY_ICON,
    FOOTER: KEYBOARD_SHORTCUT_FOOTER,
  },

  // Clarification flow styles
  CLARIFICATION_FLOW: {
    SKELETON_INPUT,
    SKELETON_TEXTAREA,
    SKELETON_BUTTON,
    NAV_CONTAINER: CLARIFICATION_NAV_CONTAINER,
    QUESTION_HEADING: CLARIFICATION_FLOW_QUESTION_HEADING,
    QUESTION_DESCRIPTION: CLARIFICATION_FLOW_QUESTION_DESCRIPTION,
    ANSWER_CONTAINER: CLARIFICATION_FLOW_ANSWER_CONTAINER,
    INFO_TEXT: CLARIFICATION_FLOW_INFO_TEXT,
    KEYBOARD_HINT: CLARIFICATION_FLOW_KEYBOARD_HINT,
    STEP_INDICATOR: CLARIFICATION_FLOW_STEP_INDICATOR,
    STEP_TEXT: CLARIFICATION_FLOW_STEP_TEXT,
    STEP_SEPARATOR: CLARIFICATION_FLOW_STEP_SEPARATOR,
    INPUT_LABEL: CLARIFICATION_FLOW_INPUT_LABEL,
  },

  // Password requirement styles
  PASSWORD_REQUIREMENT: {
    ICON: PASSWORD_REQUIREMENT_ICON,
    TEXT: PASSWORD_REQUIREMENT_TEXT,
  },

  // Step celebration styles
  STEP_CELEBRATION: {
    CHECKMARK_CONTAINER: STEP_CELEBRATION_CHECKMARK_CONTAINER,
    CHECKMARK_ICON: STEP_CELEBRATION_CHECKMARK_ICON,
    RIPPLE_1: STEP_CELEBRATION_RIPPLE_1,
    RIPPLE_2: STEP_CELEBRATION_RIPPLE_2,
    PROGRESS_TRACK: STEP_CELEBRATION_PROGRESS_TRACK,
    PARTICLE: STEP_CELEBRATION_PARTICLE,
    TEXT_CONTAINER: STEP_CELEBRATION_TEXT_CONTAINER,
    STEP_COMPLETE: STEP_CELEBRATION_STEP_COMPLETE,
    PROGRESS_COMPLETE: STEP_CELEBRATION_PROGRESS_COMPLETE,
  },

  // Idea input styles
  IDEA_INPUT: {
    FORM: IDEA_INPUT_FORM,
    CONTAINER: IDEA_INPUT_CONTAINER,
    LOADING_INDICATOR: IDEA_INPUT_LOADING_INDICATOR,
    CONFETTI_DOT: IDEA_INPUT_CONFETTI_DOT,
    FEEDBACK_TEXT: IDEA_INPUT_FEEDBACK_TEXT,
    ERROR_CONTAINER: IDEA_INPUT_ERROR_CONTAINER,
    ERROR_TEXT: IDEA_INPUT_ERROR_TEXT,
    STATUS_CONTAINER: IDEA_INPUT_STATUS_CONTAINER,
    STATUS_ITEMS: IDEA_INPUT_STATUS_ITEMS,
    STATUS_ITEM: IDEA_INPUT_STATUS_ITEM,
    SEND_ICON: IDEA_INPUT_SEND_ICON,
    SUBMIT_BUTTON_TEXT: IDEA_INPUT_SUBMIT_BUTTON_TEXT,
  },

  // Mobile nav styles
  MOBILE_NAV: {
    DESKTOP_LINK: MOBILE_NAV_DESKTOP_LINK,
    DESKTOP_LINK_ITEM: MOBILE_NAV_DESKTOP_LINK_ITEM,
    ACTIVE_INDICATOR: MOBILE_NAV_ACTIVE_INDICATOR,
    CLOSE_HINT: MOBILE_NAV_CLOSE_HINT,
    CLOSE_HINT_TEXT: MOBILE_NAV_CLOSE_HINT_TEXT,
    CLOSE_HINT_KBD: MOBILE_NAV_CLOSE_HINT_KBD,
    MENU_ITEM: MOBILE_NAV_MENU_ITEM,
    MENU_INDICATOR_CONTAINER: MOBILE_NAV_MENU_INDICATOR_CONTAINER,
    MENU_KEYBOARD_HINT: MOBILE_NAV_MENU_KEYBOARD_HINT,
  },
} as const;

export type ComponentStyles = typeof COMPONENT_STYLES;
