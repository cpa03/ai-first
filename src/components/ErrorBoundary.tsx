'use client';

import React, { Component, ErrorInfo, ReactNode, useCallback } from 'react';
import Link from 'next/link';
import Alert from './Alert';
import Button from './Button';
import { createLogger } from '@/lib/logger';
import { MESSAGES, BUTTON_LABELS, COMPONENT_DEFAULTS } from '@/lib/config/ui';
import {
  Z_INDEX_LAYERS,
  CARD_PATTERNS,
  TEXT_COLORS,
  BORDER_COLORS,
  BG_COLORS,
  COMPONENT_STATE_COLORS,
} from '@/lib/config/theme';
import { ERROR_ELEMENT_IDS, ARIA_HEADING_IDS } from '@/lib/config/element-ids';
import { isFocusedOnInput, PLATFORM } from '@/lib/dom-utils';
import { TEXT_SIZE_CLASSES } from '@/lib/config/ui-text-sizes';
import { CONTAINER_WIDTHS } from '@/lib/config/page-layout';
import { ROUTES } from '@/lib/config/routes';
import { useClipboard } from '@/hooks/useClipboard';
import { useConfetti } from '@/hooks/useConfetti';
import StatusAnnouncer from './StatusAnnouncer';

/**
 * Micro-UX: ErrorCopyButton - Functional component that uses useClipboard hook
 * Provides consistent copy UX with haptic feedback, status announcements,
 * and confetti animation, matching the patterns used in CopyButton and EmailButton.
 *
 * This replaces the raw navigator.clipboard.writeText() in ErrorBoundary
 * to ensure all copy operations in the app have consistent UX patterns.
 */
function ErrorCopyButton({
  errorText,
  copyLabel,
  copiedLabel,
  ariaLabel,
}: {
  errorText: string;
  copyLabel: string;
  copiedLabel: string;
  ariaLabel: string;
}) {
  const { fire, particles } = useConfetti();

  const handleOnCopy = useCallback(() => {
    fire();
  }, [fire]);

  const { copy, hasCopied } = useClipboard({
    onCopy: handleOnCopy,
  });

  const handleCopy = useCallback(() => {
    copy(errorText);
  }, [copy, errorText]);

  return (
    <>
      <StatusAnnouncer message={copiedLabel} triggered={hasCopied} />
      <span className="relative inline-flex">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          aria-label={ariaLabel}
        >
          {hasCopied ? copiedLabel : copyLabel}
        </Button>
        {/* Micro-UX: Confetti burst on copy success for delightful positive feedback */}
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute rounded-full pointer-events-none animate-copy-confetti"
            style={
              {
                left: '50%',
                top: '50%',
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                '--confetti-x': `${particle.x}px`,
                '--confetti-y': `${particle.y}px`,
                animationDelay: `${particle.delay}ms`,
              } as React.CSSProperties
            }
            aria-hidden="true"
          />
        ))}
      </span>
    </>
  );
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isMac: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  private logger = createLogger('ErrorBoundary');
  private errorRef = React.createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isMac: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidMount() {
    this.setState({ isMac: PLATFORM.isMac() });
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.logger.errorWithContext('ErrorBoundary caught an error', {
      component: 'ErrorBoundary',
      metadata: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      },
    });
    this.setState({ error, errorInfo });
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (this.state.hasError && !prevState.hasError) {
      this.errorRef.current?.focus();
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleKeyDown = (e: KeyboardEvent) => {
    if (!this.state.hasError) return;

    if (isFocusedOnInput(e.target)) return;

    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      this.handleReset();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      window.location.href = ROUTES.HOME;
    }
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <>
          <a
            href="#error-content"
            className={`sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[${Z_INDEX_LAYERS.TOAST}] focus:px-4 focus:py-2 ${COMPONENT_STATE_COLORS.ERROR_BOUNDARY.SKIP_LINK} focus:rounded-md`}
          >
            Skip to error content
          </a>
          <div
            id={ERROR_ELEMENT_IDS.ERROR_CONTENT}
            ref={this.errorRef}
            tabIndex={-1}
            className={`min-h-screen ${BG_COLORS.LIGHT} flex items-center justify-center p-4`}
            role="main"
            aria-labelledby={ARIA_HEADING_IDS.ERROR}
          >
            <div
              className={`${CONTAINER_WIDTHS.SM} w-full ${CARD_PATTERNS.BASE}`}
            >
              <div role="alert" aria-live="assertive" className="sr-only">
                {MESSAGES.ERROR_BOUNDARY.DESCRIPTION}{' '}
                {this.state.error?.message}
              </div>
              <Alert type="error" title={MESSAGES.ERROR_BOUNDARY.TITLE}>
                <p className={`${TEXT_COLORS.SECONDARY} mb-4`}>
                  {MESSAGES.ERROR_BOUNDARY.DESCRIPTION}
                </p>
                <div className="mt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Button
                      variant="primary"
                      onClick={this.handleReset}
                      className="w-full sm:w-auto"
                    >
                      {MESSAGES.ERROR_BOUNDARY.RETRY_BUTTON}
                    </Button>
                    <span
                      className={`hidden sm:flex items-center gap-1 text-xs ${TEXT_COLORS.MUTED}`}
                      aria-hidden="true"
                    >
                      <kbd
                        className={`inline-flex items-center px-1.5 py-0.5 ${BG_COLORS.LIGHTER} border ${BORDER_COLORS.DEFAULT} rounded ${TEXT_SIZE_CLASSES.XS} font-sans font-medium ${TEXT_COLORS.SECONDARY}`}
                      >
                        Enter
                      </kbd>
                      <span>to retry</span>
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Link href={ROUTES.HOME} passHref>
                      <Button
                        variant="secondary"
                        className="w-full sm:w-auto ml-0 sm:ml-2"
                      >
                        {BUTTON_LABELS.CANCEL}
                      </Button>
                    </Link>
                    <span
                      className={`hidden sm:flex items-center gap-1 text-xs ${TEXT_COLORS.MUTED}`}
                      aria-hidden="true"
                    >
                      <kbd
                        className={`inline-flex items-center px-1.5 py-0.5 ${BG_COLORS.LIGHTER} border ${BORDER_COLORS.DEFAULT} rounded ${TEXT_SIZE_CLASSES.XS} font-sans font-medium ${TEXT_COLORS.SECONDARY}`}
                      >
                        Esc
                      </kbd>
                      <span>to go home</span>
                    </span>
                  </div>
                </div>
              </Alert>

              {this.state.error && (
                <details className={`mt-6 p-4 ${BG_COLORS.LIGHT} rounded-md`}>
                  <summary
                    className={`cursor-pointer text-sm font-medium ${TEXT_COLORS.SECONDARY}`}
                  >
                    {MESSAGES.ERROR_BOUNDARY.DETAILS_BUTTON}
                  </summary>
                  <div
                    className={`mt-3 text-xs ${TEXT_COLORS.SECONDARY} font-mono whitespace-pre-wrap overflow-auto max-h-48`}
                  >
                    <strong>Error:</strong> {this.state.error.toString()}
                    {this.state.errorInfo && (
                      <>
                        <br />
                        <strong>Stack:</strong>
                        <br />
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <ErrorCopyButton
                      errorText={`Error: ${this.state.error?.toString()}\n\nStack:\n${this.state.errorInfo?.componentStack || MESSAGES.ERROR_BOUNDARY.NO_STACK_TRACE}`}
                      copyLabel={MESSAGES.ERROR_BOUNDARY.COPY_BUTTON}
                      copiedLabel={MESSAGES.BLUEPRINT.COPIED_BUTTON}
                      ariaLabel={
                        COMPONENT_DEFAULTS.ARIA_LABELS.COPY_ERROR_DETAILS
                      }
                    />
                  </div>
                </details>
              )}
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}
