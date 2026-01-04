/**
 * End-to-End Tests - Complete User Experience
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockUserJourney, createMockFetch } from './utils/testHelpers';

// Mock the entire app for e2e testing
const mockApp = () => {
  // Setup comprehensive mocking
  global.fetch = jest.fn();

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  // Mock resize observer for responsive testing
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock intersection observer for lazy loading
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

describe('End-to-End Tests', () => {
  let user: any;

  beforeEach(() => {
    user = userEvent.setup();
    mockApp();
    jest.clearAllMocks();
  });

  describe('Complete User Journey E2E', () => {
    it('should guide user from homepage to successful export', async () => {
      // Mock entire application flow
      const apiResponses = [
        // Create idea
        { data: { id: 'idea-123', content: mockUserJourney.ideaInput } },
        // Get questions
        { data: mockUserJourney.questions },
        // Submit answers
        { data: { id: 'refined-123', content: mockUserJourney.refinedIdea } },
        // Get blueprint
        { data: mockUserJourney.blueprint },
        // Export to multiple services
        mockUserJourney.exports.markdown,
        mockUserJourney.exports.notion,
        mockUserJourney.exports.trello,
        mockUserJourney.exports.github,
      ];

      global.fetch = jest.fn().mockImplementation((url) => {
        const responseIndex = global.fetch.mock.calls.length - 1;
        return Promise.resolve({
          ok: true,
          json: async () => apiResponses[responseIndex] || { data: null },
        });
      });

      // Step 1: Load homepage
      const { default: HomePage } = require('@/app/page');
      render(<HomePage />);

      expect(screen.getByText(/transform your ideas/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/what's your idea/i)).toBeInTheDocument();

      // Step 2: Enter idea
      const ideaInput = screen.getByLabelText(/what's your idea/i);
      await user.type(ideaInput, mockUserJourney.ideaInput);

      const startButton = screen.getByRole('button', {
        name: /start clarifying/i,
      });
      await user.click(startButton);

      // Step 3: Wait for clarification flow
      await waitFor(() => {
        expect(screen.getByText(/loading questions/i)).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(
            screen.getByText(mockUserJourney.questions[0].question)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Step 4: Answer all questions
      for (let i = 0; i < mockUserJourney.questions.length; i++) {
        const question = mockUserJourney.questions[i];
        const answerKey = (i + 1).toString();
        const answer = mockUserJourney.answers[answerKey];

        if (answer) {
          const input =
            screen.getByDisplayValue('') || screen.getAllByRole('textbox')[0];
          await user.clear(input);
          await user.type(input, answer);
        }

        if (i < mockUserJourney.questions.length - 1) {
          const nextButton = screen.getByRole('button', { name: /next/i });
          await user.click(nextButton);
          await waitFor(() => {
            expect(
              screen.getByText(mockUserJourney.questions[i + 1].question)
            ).toBeInTheDocument();
          });
        }
      }

      // Step 5: Submit answers
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(
            screen.getByText(/processing your answers/i)
          ).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // Step 6: View blueprint
      await waitFor(() => {
        expect(
          screen.getByText(mockUserJourney.blueprint.title)
        ).toBeInTheDocument();
        expect(
          screen.getByText(mockUserJourney.blueprint.description)
        ).toBeInTheDocument();
      });

      // Step 7: Test all export options
      const exportButtons = ['markdown', 'notion', 'trello', 'github'];

      for (const exportType of exportButtons) {
        const button = screen.getByRole('button', {
          name: new RegExp(exportType, 'i'),
        });
        await user.click(button);

        await waitFor(
          () => {
            expect(screen.getByText(/export completed/i)).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        // Close export success message
        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);
      }

      // Verify complete journey
      expect(global.fetch).toHaveBeenCalledTimes(8);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should maintain user session across page refreshes', async () => {
      // Setup session persistence
      sessionStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          sessionId: 'session-123',
          ideaId: 'idea-123',
          step: 'clarification',
        })
      );

      global.fetch = createMockFetch({
        data: mockUserJourney.questions,
      });

      // Simulate page refresh
      const { ClarificationFlow } = require('@/components/ClarificationFlow');
      render(
        <ClarificationFlow
          sessionId="session-123"
          idea={mockUserJourney.ideaInput}
          onComplete={jest.fn()}
          onError={jest.fn()}
        />
      );

      // Should restore user to correct step
      await waitFor(() => {
        expect(
          screen.getByText(mockUserJourney.questions[0].question)
        ).toBeInTheDocument();
      });

      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('userSession');
    });
  });

  describe('Cross-Browser Compatibility E2E', () => {
    it('should work across different browsers', async () => {
      // Mock different browser environments
      const browsers = [
        {
          name: 'Chrome',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        {
          name: 'Firefox',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101',
        },
        {
          name: 'Safari',
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      ];

      for (const browser of browsers) {
        Object.defineProperty(navigator, 'userAgent', {
          value: browser.userAgent,
          configurable: true,
        });

        global.fetch = createMockFetch({ data: { success: true } });

        // Test core functionality in each browser
        const { IdeaInput } = require('@/components/IdeaInput');
        const { unmount } = render(<IdeaInput onSubmit={jest.fn()} />);

        expect(screen.getByLabelText(/what's your idea/i)).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /start clarifying/i })
        ).toBeInTheDocument();

        unmount();
      }
    });
  });

  describe('Performance E2E', () => {
    it('should load within performance budgets', async () => {
      const performanceMarks = {};

      // Mock performance API
      global.performance = {
        ...global.performance,
        mark: jest.fn((name) => {
          performanceMarks[name] = Date.now();
        }),
        measure: jest.fn((name, startMark, endMark) => {
          return {
            name,
            startTime: performanceMarks[startMark] || 0,
            duration:
              (performanceMarks[endMark] || Date.now()) -
              (performanceMarks[startMark] || 0),
          };
        }),
      };

      global.fetch = createMockFetch(
        { data: mockUserJourney.blueprint },
        {},
        { delay: 100 }
      );

      const { BlueprintDisplay } = require('@/components/BlueprintDisplay');

      performance.mark('render-start');
      render(<BlueprintDisplay blueprint={mockUserJourney.blueprint} />);
      performance.mark('render-end');

      const renderMeasurement = global.performance.measure(
        'render-time',
        'render-start',
        'render-end'
      );

      // Should render within performance budget
      expect(renderMeasurement.duration).toBeLessThan(2000); // 2 second budget
    });

    it('should handle memory leaks properly', async () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      // Test component mounting and unmounting
      const {
        BlueprintDisplay,
        unmount,
      } = require('@/components/BlueprintDisplay');

      const { unmount: cleanup } = render(
        <BlueprintDisplay blueprint={mockUserJourney.blueprint} />
      );

      // Event listeners should be added
      expect(addEventListenerSpy).toHaveBeenCalled();

      // Cleanup should be called
      cleanup();

      // Event listeners should be removed
      expect(removeEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Accessibility E2E', () => {
    it('should be fully accessible via keyboard navigation', async () => {
      global.fetch = createMockFetch({ data: mockUserJourney.questions });

      const { ClarificationFlow } = require('@/components/ClarificationFlow');
      render(
        <ClarificationFlow
          sessionId="session-123"
          idea={mockUserJourney.ideaInput}
          onComplete={jest.fn()}
          onError={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(mockUserJourney.questions[0].question)
        ).toBeInTheDocument();
      });

      // Test keyboard navigation
      await user.tab();
      expect(screen.getByRole('textbox')).toHaveFocus();

      // Type answer
      await user.keyboard('Test answer');

      // Navigate to next button
      await user.tab();
      await user.tab();

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
    });

    it('should support screen readers', async () => {
      global.fetch = createMockFetch({ data: mockUserJourney.blueprint });

      const { BlueprintDisplay } = require('@/components/BlueprintDisplay');
      render(<BlueprintDisplay blueprint={mockUserJourney.blueprint} />);

      // Check for ARIA labels and roles
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(
        screen.getByRole('region', { name: /export options/i })
      ).toBeInTheDocument();

      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveTextContent(mockUserJourney.blueprint.title);
    });
  });

  describe('Error Recovery E2E', () => {
    it('should recover from network failures', async () => {
      let requestAttempts = 0;

      global.fetch = jest.fn().mockImplementation(() => {
        requestAttempts++;
        if (requestAttempts < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockUserJourney.questions }),
        });
      });

      const { ClarificationFlow } = require('@/components/ClarificationFlow');
      const mockOnError = jest.fn();

      render(
        <ClarificationFlow
          sessionId="session-123"
          idea={mockUserJourney.ideaInput}
          onComplete={jest.fn()}
          onError={mockOnError}
        />
      );

      // Should retry failed requests
      await waitFor(
        () => {
          expect(
            screen.getByText(mockUserJourney.questions[0].question)
          ).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      expect(requestAttempts).toBe(3);
    });

    it('should handle service degradation gracefully', async () => {
      // Mock partial service failure
      global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('notion')) {
          return Promise.resolve({
            ok: false,
            status: 503,
            json: async () => ({ error: 'Notion service unavailable' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: 'success' }),
        });
      });

      const { BlueprintDisplay } = require('@/components/BlueprintDisplay');
      render(<BlueprintDisplay blueprint={mockUserJourney.blueprint} />);

      // Notion export should fail gracefully
      const notionButton = screen.getByRole('button', { name: /notion/i });
      await user.click(notionButton);

      await waitFor(() => {
        expect(
          screen.getByText(/notion service unavailable/i)
        ).toBeInTheDocument();
      });

      // Other exports should still work
      const markdownButton = screen.getByRole('button', { name: /markdown/i });
      await user.click(markdownButton);

      await waitFor(() => {
        expect(screen.getByText(/export completed/i)).toBeInTheDocument();
      });
    });
  });
});
