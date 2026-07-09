'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import Alert from './Alert';
import Button from './Button';
import { createLogger } from '@/lib/logger';
import {
  UI_CONFIG,
  MESSAGES,
  BUTTON_LABELS,
  COMPONENT_DEFAULTS,
} from '@/lib/config/ui';
import {
  Z_INDEX_LAYERS,
  CARD_PATTERNS,
  TEXT_COLORS,
  BORDER_COLORS,
} from '@/lib/config/theme';
import { TEXT_SIZE_CLASSES } from '@/lib/config/ui-text-sizes';
import { CONTAINER_WIDTHS } from '@/lib/config/page-layout';
import { ROUTES } from '@/lib/config/routes';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isCopied: boolean;
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
      isCopied: false,
      isMac: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidMount() {
    this.setState({ isMac: navigator.platform.includes('Mac') });
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
      isCopied: false,
    });
  };

  handleKeyDown = (e: KeyboardEvent) => {
    if (!this.state.hasError) return;

    const target = e.target as HTMLElement;
    const isInputFocused =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable;

    if (isInputFocused) return;

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
            className={`sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[${Z_INDEX_LAYERS.TOAST}] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md`}
          >
            Skip to error content
          </a>
          <div
            id="error-content"
            ref={this.errorRef}
            tabIndex={-1}
            className={`min-h-screen bg-gray-50 flex items-center justify-center p-4`}
            role="main"
            aria-labelledby="error-title"
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
                        className={`inline-flex items-center px-1.5 py-0.5 bg-gray-100 border ${BORDER_COLORS.DEFAULT} rounded ${TEXT_SIZE_CLASSES.XS} font-sans font-medium ${TEXT_COLORS.SECONDARY}`}
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
                        className={`inline-flex items-center px-1.5 py-0.5 bg-gray-100 border ${BORDER_COLORS.DEFAULT} rounded ${TEXT_SIZE_CLASSES.XS} font-sans font-medium ${TEXT_COLORS.SECONDARY}`}
                      >
                        Esc
                      </kbd>
                      <span>to go home</span>
                    </span>
                  </div>
                </div>
              </Alert>

              {this.state.error && (
                <details className={`mt-6 p-4 bg-gray-50 rounded-md`}>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const errorText = `Error: ${this.state.error?.toString()}\n\nStack:\n${this.state.errorInfo?.componentStack || MESSAGES.ERROR_BOUNDARY.NO_STACK_TRACE}`;
                        navigator.clipboard.writeText(errorText);
                        this.setState({ isCopied: true });
                        setTimeout(() => {
                          this.setState({ isCopied: false });
                        }, UI_CONFIG.FEEDBACK.COPY_FEEDBACK_DURATION_MS);
                      }}
                      aria-label={COMPONENT_DEFAULTS.ARIA_LABELS.CLOSE_ERROR}
                    >
                      {this.state.isCopied
                        ? MESSAGES.BLUEPRINT.COPIED_BUTTON
                        : MESSAGES.ERROR_BOUNDARY.COPY_BUTTON}
                    </Button>
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
