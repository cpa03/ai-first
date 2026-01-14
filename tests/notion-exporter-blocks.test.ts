/**
 * Comprehensive tests for NotionExporter buildNotionBlocks method
 *
 * This test suite covers critical business logic for transforming internal data structures
 * into Notion-specific block format.
 */

import { NotionExporter } from '@/lib/export-connectors/notion-exporter';

describe('NotionExporter.buildNotionBlocks', () => {
  let exporter: NotionExporter;

  beforeEach(() => {
    exporter = new NotionExporter();
  });

  describe('Basic Idea Export', () => {
    it('should create paragraph block for idea description', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'This is a test description',
      };

      const blocks = (exporter as any).buildNotionBlocks(idea, [], []);

      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({
        object: 'block',
        type: 'paragraph',
      });
      expect(blocks[0].paragraph.rich_text[0].text.content).toBe(
        'This is a test description'
      );
    });

    it('should use idea title when raw_text is missing', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
      };

      const blocks = (exporter as any).buildNotionBlocks(idea, [], []);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].paragraph.rich_text[0].text.content).toBe(
        'Test Project'
      );
    });

    it('should use fallback text when both raw_text and title are missing', () => {
      const idea = {
        id: 'test-idea',
      };

      const blocks = (exporter as any).buildNotionBlocks(idea, [], []);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].paragraph.rich_text[0].text.content).toBe(
        'No description'
      );
    });
  });

  describe('Deliverables Export', () => {
    it('should add heading_2 and bulleted_list for deliverables', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'Description',
      };

      const deliverables = [
        {
          id: 'd1',
          title: 'Deliverable 1',
          description: 'First deliverable',
          estimate_hours: 8,
        },
        {
          id: 'd2',
          title: 'Deliverable 2',
          description: 'Second deliverable',
          estimate_hours: 12,
        },
      ];

      const blocks = (exporter as any).buildNotionBlocks(
        idea,
        deliverables,
        []
      );

      expect(blocks).toHaveLength(4);
      expect(blocks[1]).toMatchObject({
        object: 'block',
        type: 'heading_2',
      });
      expect(blocks[1].heading_2.rich_text[0].text.content).toBe(
        'Deliverables'
      );

      expect(blocks[2]).toMatchObject({
        object: 'block',
        type: 'bulleted_list_item',
      });
      expect(blocks[2].bulleted_list_item.rich_text[0].text.content).toBe(
        'Deliverable 1 - First deliverable (8h)'
      );

      expect(blocks[3]).toMatchObject({
        object: 'block',
        type: 'bulleted_list_item',
      });
      expect(blocks[3].bulleted_list_item.rich_text[0].text.content).toBe(
        'Deliverable 2 - Second deliverable (12h)'
      );
    });

    it('should handle deliverables without description', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'Description',
      };

      const deliverables = [
        {
          id: 'd1',
          title: 'Deliverable 1',
          estimate_hours: 8,
        },
      ];

      const blocks = (exporter as any).buildNotionBlocks(
        idea,
        deliverables,
        []
      );

      expect(blocks).toHaveLength(3);
      expect(blocks[2].bulleted_list_item.rich_text[0].text.content).toBe(
        'Deliverable 1 -  (8h)'
      );
    });

    it('should not add deliverables section when array is empty', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'Description',
      };

      const blocks = (exporter as any).buildNotionBlocks(idea, [], []);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks.every((b: any) => b.type !== 'heading_2')).toBe(true);
    });
  });

  describe('Tasks Export', () => {
    it('should add heading_2 and to_do blocks for tasks', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'Description',
      };

      const tasks = [
        {
          id: 't1',
          title: 'Task 1',
          estimate: 4,
          status: 'pending',
        },
        {
          id: 't2',
          title: 'Task 2',
          estimate: 6,
          status: 'completed',
        },
      ];

      const blocks = (exporter as any).buildNotionBlocks(idea, [], tasks);

      expect(blocks).toHaveLength(4);
      expect(blocks[1]).toMatchObject({
        object: 'block',
        type: 'heading_2',
      });
      expect(blocks[1].heading_2.rich_text[0].text.content).toBe('Tasks');

      expect(blocks[2]).toMatchObject({
        object: 'block',
        type: 'to_do',
      });
      expect(blocks[2].to_do.checked).toBe(false);
      expect(blocks[2].to_do.rich_text[0].text.content).toBe('⬜ Task 1 (4h)');

      expect(blocks[3]).toMatchObject({
        object: 'block',
        type: 'to_do',
      });
      expect(blocks[3].to_do.checked).toBe(true);
      expect(blocks[3].to_do.rich_text[0].text.content).toBe('✅ Task 2 (6h)');
    });

    it('should handle tasks with unknown status', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'Description',
      };

      const tasks = [
        {
          id: 't1',
          title: 'Task 1',
          estimate: 4,
          status: 'in-progress',
        },
      ];

      const blocks = (exporter as any).buildNotionBlocks(idea, [], tasks);

      expect(blocks).toHaveLength(3);
      expect(blocks[2].to_do.checked).toBe(false);
      expect(blocks[2].to_do.rich_text[0].text.content).toBe('⬜ Task 1 (4h)');
    });

    it('should not add tasks section when array is empty', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'Description',
      };

      const blocks = (exporter as any).buildNotionBlocks(idea, [], []);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
    });
  });

  describe('Combined Export', () => {
    it('should create complete structure with idea, deliverables, and tasks', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'Project description',
      };

      const deliverables = [
        {
          id: 'd1',
          title: 'Deliverable 1',
          description: 'First',
          estimate_hours: 8,
        },
      ];

      const tasks = [
        {
          id: 't1',
          title: 'Task 1',
          estimate: 4,
          status: 'pending',
        },
      ];

      const blocks = (exporter as any).buildNotionBlocks(
        idea,
        deliverables,
        tasks
      );

      expect(blocks).toHaveLength(5);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[1].type).toBe('heading_2');
      expect(blocks[2].type).toBe('bulleted_list_item');
      expect(blocks[3].type).toBe('heading_2');
      expect(blocks[4].type).toBe('to_do');
    });

    it('should handle empty deliverables array gracefully', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'Description',
      };

      const tasks = [
        {
          id: 't1',
          title: 'Task 1',
          estimate: 4,
          status: 'pending',
        },
      ];

      const blocks = (exporter as any).buildNotionBlocks(idea, [], tasks);

      expect(blocks).toHaveLength(3);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[1].type).toBe('heading_2');
      expect(blocks[1].heading_2.rich_text[0].text.content).toBe('Tasks');
    });

    it('should handle empty tasks array gracefully', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'Description',
      };

      const deliverables = [
        {
          id: 'd1',
          title: 'Deliverable 1',
          description: 'First',
          estimate_hours: 8,
        },
      ];

      const blocks = (exporter as any).buildNotionBlocks(
        idea,
        deliverables,
        []
      );

      expect(blocks).toHaveLength(3);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[1].type).toBe('heading_2');
      expect(blocks[1].heading_2.rich_text[0].text.content).toBe(
        'Deliverables'
      );
    });
  });

  describe('Block Structure Validation', () => {
    it('should maintain proper block object structure', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test',
        raw_text: 'Description',
      };

      const deliverables = [
        {
          id: 'd1',
          title: 'Deliverable',
          description: 'Desc',
          estimate_hours: 8,
        },
      ];

      const tasks = [
        {
          id: 't1',
          title: 'Task',
          estimate: 4,
          status: 'completed',
        },
      ];

      const blocks = (exporter as any).buildNotionBlocks(
        idea,
        deliverables,
        tasks
      );

      blocks.forEach((block: any) => {
        expect(block).toHaveProperty('object', 'block');
        expect(block).toHaveProperty('type');
        expect(block.type).toMatch(
          /^(paragraph|heading_2|bulleted_list_item|to_do)$/
        );
      });
    });

    it('should format rich_text correctly in all block types', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test',
        raw_text: 'Description',
      };

      const deliverables = [
        {
          id: 'd1',
          title: 'Deliverable',
          description: 'Desc',
          estimate_hours: 8,
        },
      ];

      const tasks = [
        {
          id: 't1',
          title: 'Task',
          estimate: 4,
          status: 'pending',
        },
      ];

      const blocks = (exporter as any).buildNotionBlocks(
        idea,
        deliverables,
        tasks
      );

      expect(blocks[0].paragraph).toHaveProperty('rich_text');
      expect(blocks[0].paragraph.rich_text).toBeInstanceOf(Array);
      expect(blocks[0].paragraph.rich_text[0]).toHaveProperty('type', 'text');
      expect(blocks[0].paragraph.rich_text[0]).toHaveProperty('text');
      expect(blocks[0].paragraph.rich_text[0].text).toHaveProperty('content');
    });

    it('should handle large number of items efficiently', () => {
      const idea = {
        id: 'test-idea',
        title: 'Test Project',
        raw_text: 'Description',
      };

      const deliverables = Array.from({ length: 20 }, (_, i) => ({
        id: `d${i}`,
        title: `Deliverable ${i}`,
        description: `Description ${i}`,
        estimate_hours: i + 1,
      }));

      const tasks = Array.from({ length: 20 }, (_, i) => ({
        id: `t${i}`,
        title: `Task ${i}`,
        estimate: i + 1,
        status: i % 2 === 0 ? 'completed' : 'pending',
      }));

      const startTime = Date.now();
      const blocks = (exporter as any).buildNotionBlocks(
        idea,
        deliverables,
        tasks
      );
      const endTime = Date.now();

      expect(blocks).toHaveLength(1 + 1 + 20 + 1 + 20);
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
