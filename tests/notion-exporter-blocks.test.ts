/**
 * Comprehensive tests for NotionExporter buildNotionBlocks method
 *
 * This test suite covers critical business logic for transforming internal data structures
 * into Notion-specific block format.
 */

import { NotionExporter } from '@/lib/export-connectors/notion-exporter';
import type { ExportData } from '@/lib/export-connectors/base';

interface NotionExporterWithInternalMethods {
  buildNotionBlocks(
    idea: ExportData['idea'],
    deliverables?: ExportData['deliverables'],
    tasks?: ExportData['tasks']
  ): Record<string, unknown>[];
}

const createIdea = (overrides: Record<string, unknown> = {}) => ({
  id: 'test-idea',
  title: 'Test Project',
  raw_text: 'Description',
  status: 'draft' as const,
  deleted_at: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

describe('NotionExporter.buildNotionBlocks', () => {
  let exporter: NotionExporterWithInternalMethods;

  beforeEach(() => {
    exporter =
      new NotionExporter() as unknown as NotionExporterWithInternalMethods;
  });

  describe('Basic Idea Export', () => {
    it('should create paragraph block for idea description', () => {
      const idea = createIdea({ raw_text: 'This is a test description' });

      const blocks = exporter.buildNotionBlocks(idea, [], []);

      expect(blocks).toHaveLength(1);
      expect(blocks[0]).toMatchObject({
        object: 'block',
        type: 'paragraph',
      });
      expect((blocks[0] as Record<string, unknown>).paragraph).toBeDefined();
      const paragraph = blocks[0] as {
        paragraph: { rich_text: Array<{ text: { content: string } }> };
      };
      expect(paragraph.paragraph.rich_text[0].text.content).toBe(
        'This is a test description'
      );
    });

    it('should use idea title when raw_text is missing', () => {
      const idea = createIdea({ raw_text: '' });

      const blocks = exporter.buildNotionBlocks(idea, [], []);

      expect(blocks).toHaveLength(1);
      const paragraph = blocks[0] as {
        paragraph: { rich_text: Array<{ text: { content: string } }> };
      };
      expect(paragraph.paragraph.rich_text[0].text.content).toBe(
        'Test Project'
      );
    });

    it('should use fallback text when both raw_text and title are missing', () => {
      const idea = createIdea({ title: '', raw_text: '' });

      const blocks = exporter.buildNotionBlocks(idea, [], []);

      expect(blocks).toHaveLength(1);
      const paragraph = blocks[0] as {
        paragraph: { rich_text: Array<{ text: { content: string } }> };
      };
      expect(paragraph.paragraph.rich_text[0].text.content).toBe(
        'No description'
      );
    });
  });

  describe('Deliverables Export', () => {
    it('should add heading_2 and bulleted_list for deliverables', () => {
      const idea = createIdea();

      const deliverables = [
        {
          id: 'd1',
          idea_id: 'test-idea',
          title: 'Deliverable 1',
          description: 'First deliverable',
          estimate_hours: 8,
          priority: 1,
          milestone_id: null,
          completion_percentage: 0,
          business_value: 5,
          risk_factors: null,
          acceptance_criteria: null,
          deliverable_type: 'feature' as const,
          created_at: new Date().toISOString(),
        },
        {
          id: 'd2',
          idea_id: 'test-idea',
          title: 'Deliverable 2',
          description: 'Second deliverable',
          estimate_hours: 12,
          priority: 2,
          milestone_id: null,
          completion_percentage: 0,
          business_value: 5,
          risk_factors: null,
          acceptance_criteria: null,
          deliverable_type: 'feature' as const,
          created_at: new Date().toISOString(),
        },
      ];

      const blocks = exporter.buildNotionBlocks(idea, deliverables, []);

      expect(blocks).toHaveLength(4);
      expect(blocks[1]).toMatchObject({
        object: 'block',
        type: 'heading_2',
      });
      const heading = blocks[1] as {
        heading_2: { rich_text: Array<{ text: { content: string } }> };
      };
      expect(heading.heading_2.rich_text[0].text.content).toBe('Deliverables');

      expect(blocks[2]).toMatchObject({
        object: 'block',
        type: 'bulleted_list_item',
      });
      const bullet = blocks[2] as {
        bulleted_list_item: { rich_text: Array<{ text: { content: string } }> };
      };
      expect(bullet.bulleted_list_item.rich_text[0].text.content).toBe(
        'Deliverable 1 - First deliverable (8h)'
      );

      expect(blocks[3]).toMatchObject({
        object: 'block',
        type: 'bulleted_list_item',
      });
      const bullet2 = blocks[3] as {
        bulleted_list_item: { rich_text: Array<{ text: { content: string } }> };
      };
      expect(bullet2.bulleted_list_item.rich_text[0].text.content).toBe(
        'Deliverable 2 - Second deliverable (12h)'
      );
    });

    it('should handle deliverables without description', () => {
      const idea = createIdea();

      const deliverables = [
        {
          id: 'd1',
          idea_id: 'test-idea',
          title: 'Deliverable 1',
          estimate_hours: 8,
          priority: 1,
          milestone_id: null,
          completion_percentage: 0,
          business_value: 5,
          risk_factors: null,
          acceptance_criteria: null,
          deliverable_type: 'feature' as const,
          created_at: new Date().toISOString(),
        },
      ];

      const blocks = exporter.buildNotionBlocks(idea, deliverables, []);

      expect(blocks).toHaveLength(3);
      const bullet = blocks[2] as {
        bulleted_list_item: { rich_text: Array<{ text: { content: string } }> };
      };
      expect(bullet.bulleted_list_item.rich_text[0].text.content).toBe(
        'Deliverable 1 -  (8h)'
      );
    });

    it('should not add deliverables section when array is empty', () => {
      const idea = createIdea();

      const blocks = exporter.buildNotionBlocks(idea, [], []);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
      expect(
        blocks.every((b: Record<string, unknown>) => b.type !== 'heading_2')
      ).toBe(true);
    });
  });

  describe('Tasks Export', () => {
    it('should add heading_2 and to_do blocks for tasks', () => {
      const idea = createIdea();

      const tasks = [
        {
          id: 't1',
          title: 'Task 1',
          estimate: 4,
          status: 'pending' as const,
        },
        {
          id: 't2',
          title: 'Task 2',
          estimate: 6,
          status: 'completed' as const,
        },
      ];

      const blocks = exporter.buildNotionBlocks(
        idea,
        [],
        tasks as unknown as ExportData['tasks']
      );

      expect(blocks).toHaveLength(4);
      expect(blocks[1]).toMatchObject({
        object: 'block',
        type: 'heading_2',
      });
      const heading = blocks[1] as Record<string, unknown>;
      const heading2 = heading.heading_2 as Record<string, unknown>;
      const richText = heading2.rich_text as Array<Record<string, unknown>>;
      const textObj = richText[0].text as Record<string, unknown>;
      expect(textObj.content).toBe('Tasks');

      expect(blocks[2]).toMatchObject({
        object: 'block',
        type: 'to_do',
      });
      const block2 = blocks[2] as Record<string, unknown>;
      const todo2 = block2.to_do as Record<string, unknown>;
      expect(todo2.checked).toBe(false);
      const richText2 = todo2.rich_text as Array<Record<string, unknown>>;
      const textObj2 = richText2[0].text as Record<string, unknown>;
      expect(textObj2.content).toBe('⬜ Task 1 (4h)');

      expect(blocks[3]).toMatchObject({
        object: 'block',
        type: 'to_do',
      });
      const block3 = blocks[3] as Record<string, unknown>;
      const todo3 = block3.to_do as Record<string, unknown>;
      expect(todo3.checked).toBe(true);
      const richText3 = todo3.rich_text as Array<Record<string, unknown>>;
      const textObj3 = richText3[0].text as Record<string, unknown>;
      expect(textObj3.content).toBe('✅ Task 2 (6h)');
    });

    it('should handle tasks with unknown status', () => {
      const idea = createIdea();

      const tasks = [
        {
          id: 't1',
          title: 'Task 1',
          estimate: 4,
          status: 'in-progress',
        },
      ];

      const blocks = exporter.buildNotionBlocks(
        idea,
        [],
        tasks as unknown as import('@/lib/db').Task[]
      );

      expect(blocks).toHaveLength(3);
      const block = blocks[2] as Record<string, unknown>;
      const todo = block.to_do as Record<string, unknown>;
      expect(todo.checked).toBe(false);
      const richText = todo.rich_text as Array<Record<string, unknown>>;
      const textObj = richText[0].text as Record<string, unknown>;
      expect(textObj.content).toBe('⬜ Task 1 (4h)');
    });

    it('should not add tasks section when array is empty', () => {
      const idea = createIdea();

      const blocks = exporter.buildNotionBlocks(idea, [], []);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
    });
  });

  describe('Combined Export', () => {
    it('should create complete structure with idea, deliverables, and tasks', () => {
      const idea = createIdea({ raw_text: 'Project description' });

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
          status: 'pending' as const,
        },
      ];

      const blocks = exporter.buildNotionBlocks(
        idea,
        deliverables as unknown as ExportData['deliverables'],
        tasks as unknown as ExportData['tasks']
      );

      expect(blocks).toHaveLength(5);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[1].type).toBe('heading_2');
      expect(blocks[2].type).toBe('bulleted_list_item');
      expect(blocks[3].type).toBe('heading_2');
      expect(blocks[4].type).toBe('to_do');
    });

    it('should handle empty deliverables array gracefully', () => {
      const idea = createIdea();

      const tasks = [
        {
          id: 't1',
          title: 'Task 1',
          estimate: 4,
          status: 'pending' as const,
        },
      ];

      const blocks = exporter.buildNotionBlocks(
        idea,
        [],
        tasks as unknown as ExportData['tasks']
      );

      expect(blocks).toHaveLength(3);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[1].type).toBe('heading_2');
      const heading = blocks[1] as Record<string, unknown>;
      const heading2 = heading.heading_2 as Record<string, unknown>;
      const richText = heading2.rich_text as Array<Record<string, unknown>>;
      const textObj = richText[0].text as Record<string, unknown>;
      expect(textObj.content).toBe('Tasks');
    });

    it('should handle empty tasks array gracefully', () => {
      const idea = createIdea();

      const deliverables = [
        {
          id: 'd1',
          title: 'Deliverable 1',
          description: 'First',
          estimate_hours: 8,
        },
      ];

      const blocks = exporter.buildNotionBlocks(
        idea,
        deliverables as unknown as ExportData['deliverables'],
        []
      );

      expect(blocks).toHaveLength(3);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[1].type).toBe('heading_2');
      const heading = blocks[1] as Record<string, unknown>;
      const heading2 = heading.heading_2 as Record<string, unknown>;
      const richText = heading2.rich_text as Array<Record<string, unknown>>;
      const textObj = richText[0].text as Record<string, unknown>;
      expect(textObj.content).toBe('Deliverables');
    });
  });

  describe('Block Structure Validation', () => {
    it('should maintain proper block object structure', () => {
      const idea = createIdea();

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
          status: 'completed' as const,
        },
      ];

      const blocks = exporter.buildNotionBlocks(
        idea,
        deliverables as unknown as ExportData['deliverables'],
        tasks as unknown as ExportData['tasks']
      );

      blocks.forEach((block: unknown) => {
        const b = block as Record<string, unknown>;
        expect(b).toHaveProperty('object', 'block');
        expect(b).toHaveProperty('type');
        expect(b.type).toMatch(
          /^(paragraph|heading_2|bulleted_list_item|to_do)$/
        );
      });
    });

    it('should format rich_text correctly in all block types', () => {
      const idea = createIdea();

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
          status: 'pending' as const,
        },
      ];

      const blocks = exporter.buildNotionBlocks(
        idea,
        deliverables as unknown as ExportData['deliverables'],
        tasks as unknown as ExportData['tasks']
      );

      const firstBlock = blocks[0] as Record<string, unknown>;
      expect(firstBlock.paragraph).toHaveProperty('rich_text');
      const paragraph = firstBlock.paragraph as Record<string, unknown>;
      expect(paragraph.rich_text).toBeInstanceOf(Array);
      const richTextArray = paragraph.rich_text as Array<
        Record<string, unknown>
      >;
      expect(richTextArray[0]).toHaveProperty('type', 'text');
      expect(richTextArray[0]).toHaveProperty('text');
      const textObj = richTextArray[0].text as Record<string, unknown>;
      expect(textObj).toHaveProperty('content');
    });

    it('should handle large number of items efficiently', () => {
      const idea = createIdea();

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
        status: (i % 2 === 0 ? 'completed' : 'pending') as
          | 'completed'
          | 'pending',
      }));

      const startTime = Date.now();
      const blocks = exporter.buildNotionBlocks(
        idea,
        deliverables as unknown as ExportData['deliverables'],
        tasks as unknown as ExportData['tasks']
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(blocks.length).toBeGreaterThan(0);
    });
  });
});
