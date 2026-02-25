/**
 * Tests for Lazy Export Connectors
 * Target: Increase coverage to 80%+
 * Tests the lazy-loaded export functions
 */

import {
  lazyExportToMarkdown,
  lazyExportToJSON,
  lazyExportToNotion,
  lazyExportToTrello,
  lazyExportToGoogleTasks,
  lazyExportToGitHubProjects,
} from '@/lib/export-connectors/lazy';
import type { ExportData } from '@/lib/export-connectors/base';

// Mock the connectors module
jest.mock('@/lib/export-connectors/connectors', () => ({
  MarkdownExporter: jest.fn().mockImplementation(() => ({
    type: 'markdown',
    name: 'Markdown Exporter',
    export: jest.fn().mockResolvedValue({
      success: true,
      content: '# Test Export',
      url: 'https://example.com/export.md',
    }),
    validateConfig: jest.fn().mockResolvedValue(true),
  })),
  JSONExporter: jest.fn().mockImplementation(() => ({
    type: 'json',
    name: 'JSON Exporter',
    export: jest.fn().mockResolvedValue({
      success: true,
      content: '{"test": true}',
      url: 'https://example.com/export.json',
    }),
    validateConfig: jest.fn().mockResolvedValue(true),
  })),
  NotionExporter: jest.fn().mockImplementation(() => ({
    type: 'notion',
    name: 'Notion Exporter',
    export: jest.fn().mockResolvedValue({
      success: true,
      notionPageId: 'notion-page-123',
      url: 'https://notion.so/page-123',
    }),
    validateConfig: jest.fn().mockResolvedValue(true),
  })),
  TrelloExporter: jest.fn().mockImplementation(() => ({
    type: 'trello',
    name: 'Trello Exporter',
    export: jest.fn().mockResolvedValue({
      success: true,
      boardId: 'board-123',
      url: 'https://trello.com/b/board-123',
    }),
    validateConfig: jest.fn().mockResolvedValue(true),
  })),
  GoogleTasksExporter: jest.fn().mockImplementation(() => ({
    type: 'google-tasks',
    name: 'Google Tasks Exporter',
    export: jest.fn().mockResolvedValue({
      success: true,
      url: 'https://tasksboard.com/list',
    }),
    validateConfig: jest.fn().mockResolvedValue(true),
  })),
  GitHubProjectsExporter: jest.fn().mockImplementation(() => ({
    type: 'github-projects',
    name: 'GitHub Projects Exporter',
    export: jest.fn().mockResolvedValue({
      success: true,
      url: 'https://github.com/users/test/projects/1',
    }),
    validateConfig: jest.fn().mockResolvedValue(true),
  })),
}));

describe('Lazy Export Connectors', () => {
  const mockExportData: ExportData = {
    idea: {
      id: 'idea-123',
      title: 'Test Idea',
      raw_text: 'This is a test idea',
      status: 'draft',
      created_at: '2024-01-01T00:00:00Z',
    },
    deliverables: [
      {
        id: 'deliv-1',
        idea_id: 'idea-123',
        title: 'Deliverable 1',
        priority: 1,
        estimate_hours: 8,
        milestone_id: null,
        completion_percentage: 0,
        business_value: 10,
        risk_factors: null,
        acceptance_criteria: null,
        deliverable_type: 'feature',
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
    tasks: [
      {
        id: 'task-1',
        deliverable_id: 'deliv-1',
        title: 'Task 1',
        status: 'todo',
        estimate: 4,
        start_date: null,
        end_date: null,
        actual_hours: null,
        completion_percentage: 0,
        priority_score: 1,
        complexity_score: 1,
        risk_level: 'low',
        tags: null,
        custom_fields: null,
        milestone_id: null,
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
    goals: ['Goal 1', 'Goal 2'],
    target_audience: 'Developers',
    metadata: {
      exported_at: '2024-01-01T00:00:00Z',
      version: '1.0.0',
    },
  };

  describe('lazyExportToMarkdown', () => {
    it('should successfully export to markdown', async () => {
      const result = await lazyExportToMarkdown(mockExportData);

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://example.com/export.md');
    });
  });

  describe('lazyExportToJSON', () => {
    it('should successfully export to JSON', async () => {
      const result = await lazyExportToJSON(mockExportData);

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://example.com/export.json');
    });
  });

  describe('lazyExportToNotion', () => {
    it('should successfully export to Notion', async () => {
      const result = await lazyExportToNotion(mockExportData);

      expect(result.success).toBe(true);
      expect(result.content).toBe('notion-page-123');
    });
  });

  describe('lazyExportToTrello', () => {
    it('should successfully export to Trello', async () => {
      const result = await lazyExportToTrello(mockExportData);

      expect(result.success).toBe(true);
      expect(result.content).toBe('board-123');
    });
  });

  describe('lazyExportToGoogleTasks', () => {
    it('should successfully export to Google Tasks', async () => {
      const result = await lazyExportToGoogleTasks(mockExportData);

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://tasksboard.com/list');
    });
  });

  describe('lazyExportToGitHubProjects', () => {
    it('should successfully export to GitHub Projects', async () => {
      const result = await lazyExportToGitHubProjects(mockExportData);

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://github.com/users/test/projects/1');
    });
  });
});
