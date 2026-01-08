import { ExportConnector, ExportResult } from './base';
import { TIMEOUT_CONFIG } from '../config/constants';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class NotionExporter extends ExportConnector {
  readonly type = 'notion';
  readonly name = 'Notion';
  private client: any = null;

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: 'Notion API key is required',
      };
    }

    try {
      const { Client } = await import('@notionhq/client');

      if (!this.client) {
        this.client = new Client({
          auth: apiKey,
          timeoutMs: TIMEOUT_CONFIG.NOTION.CLIENT_TIMEOUT,
        });
      }

      if (!data || !data.idea) {
        throw new Error('Invalid export data: idea object is required');
      }

      const { idea, deliverables = [], tasks = [] } = data;

      const pageData = {
        parent: {
          type: 'page_id',
          page_id: options?.parentPageId || process.env.NOTION_PARENT_PAGE_ID,
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: `Project: ${idea.title}`,
                },
              },
            ],
          },
          Status: {
            select: {
              name: idea.status || 'draft',
            },
          },
          Created: {
            date: {
              start: idea.created_at || new Date().toISOString(),
            },
          },
        },
        children: this.buildNotionBlocks(idea, deliverables, tasks),
      };

      if (!pageData.parent.page_id && !process.env.NOTION_PARENT_PAGE_ID) {
        delete (pageData as any).parent;
      }

      const response = (await this.executeWithTimeout(() =>
        this.client.pages.create(pageData)
      )) as any;

      return {
        success: true,
        url: response.url,
        id: response.id,
      };
    } catch (_error) {
      console.error('Unknown export error:', _error);
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const apiKey = process.env.NOTION_API_KEY;
      if (!apiKey) return false;

      const { Client } = await import('@notionhq/client');
      const client = new Client({ auth: apiKey });

      await client.users.me({});
      return true;
    } catch (_error) {
      return false;
    }
  }

  private buildNotionBlocks(
    idea: any,
    deliverables: any[],
    tasks: any[]
  ): any[] {
    const blocks: any[] = [];

    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: idea.raw_text || idea.title || 'No description',
            },
          },
        ],
      },
    });

    if (deliverables && deliverables.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Deliverables',
              },
            },
          ],
        },
      });

      deliverables.forEach((deliverable) => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `${deliverable.title} - ${deliverable.description || ''} (${deliverable.estimate_hours}h)`,
                },
              },
            ],
          },
        });
      });
    }

    if (tasks && tasks.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Tasks',
              },
            },
          ],
        },
      });

      tasks.forEach((task) => {
        const statusIcon = task.status === 'completed' ? '✅' : '⬜';
        blocks.push({
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `${statusIcon} ${task.title} (${task.estimate}h)`,
                },
              },
            ],
            checked: task.status === 'completed',
          },
        });
      });
    }

    return blocks;
  }

  async getAuthUrl(): Promise<string> {
    const clientId = process.env.NOTION_CLIENT_ID;
    const redirectUri =
      process.env.NOTION_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/notion/callback`;

    const params = new URLSearchParams({
      client_id: clientId || '',
      response_type: 'code',
      owner: 'user',
      redirect_uri: redirectUri,
      scope: 'read,write',
    });

    return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
  }

  async handleAuthCallback(_code: string): Promise<void> {
    throw new Error(
      'OAuth callback handling requires server-side implementation'
    );
  }
}
