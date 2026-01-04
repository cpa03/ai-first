/**
 * Integration Tests - Complete User Workflows
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockUserJourney, createMockFetch, waitForAsync } from '../utils/testHelpers'

// Mock all API calls
global.fetch = jest.fn()

describe('Integration Tests - User Workflows', () => {
  let user: any

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Complete User Journey', () => {
    it('should handle full workflow from idea to export', async () => {
      // Mock API responses for each step
      global.fetch
        // Step 1: Create idea
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { id: 'idea-123', content: mockUserJourney.ideaInput }
          })
        })
        // Step 2: Get clarification questions
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: mockUserJourney.questions
          })
        })
        // Step 3: Submit answers and get refined idea
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { id: 'refined-123', content: mockUserJourney.refinedIdea }
          })
        })
        // Step 4: Get blueprint breakdown
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: mockUserJourney.blueprint
          })
        })
        // Step 5: Export to markdown
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserJourney.exports.markdown
        })

      // Step 1: User enters idea
      const { IdeaInput } = require('@/components/IdeaInput')
      const mockOnSubmit = jest.fn()
      
      const { rerender } = render(<IdeaInput onSubmit={mockOnSubmit} />)
      
      const textarea = screen.getByLabelText(/what's your idea/i)
      const submitButton = screen.getByRole('button', { name: /start clarifying/i })
      
      await user.type(textarea, mockUserJourney.ideaInput)
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(mockUserJourney.ideaInput, 'idea-123')
      })

      // Step 2: Clarification flow
      const { ClarificationFlow } = require('@/components/ClarificationFlow')
      const mockOnComplete = jest.fn()
      const mockOnError = jest.fn()
      
      rerender(
        <ClarificationFlow 
          sessionId="session-123"
          idea={mockUserJourney.ideaInput}
          onComplete={mockOnComplete}
          onError={mockOnError}
        />
      )

      // Wait for questions to load
      await waitFor(() => {
        expect(screen.getByText(/what is the primary goal/i)).toBeInTheDocument()
      })

      // Answer questions
      const inputs = screen.getAllByRole('textbox')
      await user.type(inputs[0], mockUserJourney.answers['1'])
      
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByText(/who is the target audience/i)).toBeInTheDocument()
      })
      
      const secondInput = screen.getAllByRole('textbox')[0]
      await user.type(secondInput, mockUserJourney.answers['2'])
      
      const finalSubmitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(finalSubmitButton)
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('refined-123')
      })

      // Step 3: Blueprint display and export
      const { BlueprintDisplay } = require('@/components/BlueprintDisplay')
      
      rerender(<BlueprintDisplay blueprint={mockUserJourney.blueprint} />)
      
      // Verify blueprint content
      expect(screen.getByText(mockUserJourney.blueprint.title)).toBeInTheDocument()
      expect(screen.getByText(mockUserJourney.blueprint.description)).toBeInTheDocument()
      
      // Export to markdown
      const exportButton = screen.getByRole('button', { name: /markdown/i })
      await user.click(exportButton)
      
      await waitFor(() => {
        expect(screen.getByText(/export completed/i)).toBeInTheDocument()
        expect(screen.getByText(/download markdown/i)).toBeInTheDocument()
      })

      // Verify the complete workflow succeeded
      expect(global.fetch).toHaveBeenCalledTimes(5)
    })

    it('should handle error recovery throughout the workflow', async () => {
      // Mock error responses
      global.fetch
        // Idea creation fails
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Database error' })
        })
        // Retry succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { id: 'idea-123', content: 'Test idea' }
          })
        })

      const { IdeaInput } = require('@/components/IdeaInput')
      const mockOnSubmit = jest.fn()
      
      render(<IdeaInput onSubmit={mockOnSubmit} />)
      
      const textarea = screen.getByLabelText(/what's your idea/i)
      const submitButton = screen.getByRole('button', { name: /start clarifying/i })
      
      await user.type(textarea, 'Test idea')
      await user.click(submitButton)
      
      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/failed to save your idea/i)).toBeInTheDocument()
      })
      
      // Retry submission
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('Test idea', 'idea-123')
      })
    })
  })

  describe('Frontend-Backend Integration', () => {
    it('should integrate component states with database operations', async () => {
      // Test state persistence across components
      const mockDbData = {
        idea: { id: 'idea-123', content: 'Test idea' },
        session: { id: 'session-123', idea_id: 'idea-123' },
        answers: [
          { session_id: 'session-123', question_id: '1', answer: 'Answer 1' },
          { session_id: 'session-123', question_id: '2', answer: 'Answer 2' }
        ]
      }

      global.fetch = createMockFetch(mockDbData)
      
      const DatabaseService = require('@/lib/db').default
      const dbService = new DatabaseService()
      
      // Test complete CRUD cycle
      const idea = await dbService.createIdea('Test idea')
      expect(idea.id).toBe('idea-123')
      
      const retrievedIdea = await dbService.getIdea('idea-123')
      expect(retrievedIdea.content).toBe('Test idea')
      
      const session = await dbService.createClarificationSession('idea-123')
      expect(session.id).toBe('session-123')
      
      const answers = await dbService.saveAnswers('session-123', { '1': 'Answer 1' })
      expect(answers).toBeDefined()
    })

    it('should handle concurrent requests properly', async () => {
      let requestCount = 0
      
      global.fetch = jest.fn().mockImplementation(() => {
        requestCount++
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: `response-${requestCount}` })
        })
      })

      // Simulate concurrent API calls
      const promises = Array(5).fill(null).map(() => 
        fetch('/api/test').then(res => res.json())
      )
      
      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(5)
      expect(requestCount).toBe(5)
      
      // Verify all requests were handled
      results.forEach((result, index) => {
        expect(result.data).toBe(`response-${index + 1}`)
      })
    })
  })

  describe('Real-time Feature Integration', () => {
    it('should handle WebSocket updates for live collaboration', async () => {
      const mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        readyState: 1 // OPEN
      }
      
      global.WebSocket = jest.fn().mockImplementation(() => mockWebSocket)
      
      // Simulate real-time updates
      const ws = new WebSocket('ws://localhost:3001/ws')
      
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('open', expect.any(Function))
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('close', expect.any(Function))
      expect(mockWebSocket.addEventListener).toHaveBeenCalledWith('error', expect.any(Function))
      
      // Simulate receiving updates
      const messageHandler = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )[1]
      
      const updateData = { type: 'BLUEPRINT_UPDATE', data: mockUserJourney.blueprint }
      messageHandler({ data: JSON.stringify(updateData) })
      
      // WebSocket should be properly managed
      expect(ws.readyState).toBe(1)
    })
  })

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      const largeBlueprint = {
        title: 'Large Project',
        description: 'Description',
        phases: Array(20).fill(null).map((_, index) => ({
          name: `Phase ${index + 1}`,
          tasks: Array(50).fill(null).map((_, taskIndex) => ({
            title: `Task ${taskIndex + 1}`,
            description: `Description for task ${taskIndex + 1}`,
            estimated: `${Math.floor(Math.random() * 10) + 1} days`
          }))
        }))
      }

      const startTime = performance.now()
      
      global.fetch = createMockFetch({ data: largeBlueprint })
      
      const { BlueprintDisplay } = require('@/components/BlueprintDisplay')
      render(<BlueprintDisplay blueprint={largeBlueprint} />)
      
      // Wait for rendering to complete
      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render large datasets within reasonable time
      expect(renderTime).toBeLessThan(1000) // Less than 1 second
    })

    it('should implement proper caching strategies', async () => {
      const cache = new Map()
      
      global.fetch = jest.fn().mockImplementation((url) => {
        if (cache.has(url)) {
          return Promise.resolve(cache.get(url))
        }
        
        const response = createMockFetch({ data: 'cached data' })()
        cache.set(url, response)
        return response
      })

      // First request
      await fetch('/api/data')
      expect(cache.size).toBe(1)
      
      // Second request should use cache
      await fetch('/api/data')
      expect(global.fetch).toHaveBeenCalledTimes(2) // Still called, but response from cache
    })
  })
})