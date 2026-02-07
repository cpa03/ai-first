'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Alert from './Alert';
import Button from './Button';
import { createLogger } from '@/lib/logger';
import { UI_CONFIG } from '@/lib/config/constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  private logger = createLogger('ErrorBoundary');

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
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

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <Alert type="error" title="Something went wrong">
              <p className="text-gray-700 mb-4">
                We apologize, but an unexpected error occurred. Please try
                again.
              </p>
              <div className="mt-6 space-y-4">
                <Button
                  variant="primary"
                  onClick={this.handleReset}
                  className="w-full sm:w-auto"
                >
                  Try Again
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => (window.location.href = '/')}
                  className="w-full sm:w-auto ml-0 sm:ml-2"
                >
                  Go to Home
                </Button>
              </div>
            </Alert>

            {this.state.error && (
              <details className="mt-6 p-4 bg-gray-50 rounded-md">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error Details
                </summary>
                <div className="mt-3 text-xs text-gray-600 font-mono whitespace-pre-wrap overflow-auto max-h-48">
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
                      const errorText = `Error: ${this.state.error?.toString()}\n\nStack:\n${this.state.errorInfo?.componentStack || 'No stack trace available'}`;
                      navigator.clipboard.writeText(errorText);
                      const btn = document.activeElement as HTMLButtonElement;
                      const originalText = btn?.textContent || '';
                      if (btn) btn.textContent = 'Copied!';
                      setTimeout(() => {
                        if (btn) btn.textContent = originalText;
                      }, UI_CONFIG.COPY_FEEDBACK_DURATION);
                    }}
                    aria-label="Copy error details to clipboard for bug reporting"
                  >
                    Copy Error Details
                  </Button>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
