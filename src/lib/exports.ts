// Export connectors for IdeaFlow integrations
// Supports Notion, Trello, Google Tasks, GitHub Projects

export interface ExportFormat {
  type:
    | 'markdown'
    | 'json'
    | 'notion'
    | 'trello'
    | 'google-tasks'
    | 'github-projects';
  data: any;
  metadata?: Record<string, any>;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  id?: string;
  error?: string;
}

// Base export connector interface
export abstract class ExportConnector {
  abstract readonly type: string;
  abstract readonly name: string;

  abstract export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult>;
  abstract validateConfig(): Promise<boolean>;
  abstract getAuthUrl?(): Promise<string>;
  abstract handleAuthCallback?(code: string): Promise<void>;
}

// Markdown export connector (built-in)
export class MarkdownExporter extends ExportConnector {
  readonly type = 'markdown';
  readonly name = 'Markdown';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const markdown = this.generateMarkdown(data, options);

      // In a real implementation, this would generate a downloadable file
      // For now, return the markdown content as if it were exported
      return {
        success: true,
        url: `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    // Markdown export doesn't require external configuration
    return true;
  }

  async getAuthUrl(): Promise<string> {
    throw new Error('Markdown export does not require authentication');
  }

  async handleAuthCallback(code: string): Promise<void> {
    throw new Error('Markdown export does not require authentication');
  }

  private generateMarkdown(data: any, options?: Record<string, any>): string {
    const { idea, deliverables, tasks } = data;

    let markdown = `# Project Blueprint — ${idea.title}\n\n`;

    // Summary section
    markdown += `## Summary\n${idea.raw_text}\n\n`;

    // Goals section
    if (options?.goals) {
      markdown += `## Goals\n`;
      options.goals.forEach((goal: string) => {
        markdown += `- ${goal}\n`;
      });
      markdown += `\n`;
    }

    // Target audience
    if (options?.targetAudience) {
      markdown += `## Target Audience\n${options.targetAudience}\n\n`;
    }

    // Deliverables
    if (deliverables && deliverables.length > 0) {
      markdown += `## Deliverables\n`;
      deliverables.forEach((deliverable: any, index: number) => {
        markdown += `${index + 1}. **${deliverable.title}** — ${deliverable.description || 'No description'} — ${deliverable.estimate_hours}h estimated\n`;
      });
      markdown += `\n`;
    }

    // Tasks
    if (tasks && tasks.length > 0) {
      markdown += `## Tasks\n`;
      tasks.forEach((task: any) => {
        const status = task.status === 'completed' ? 'x' : ' ';
        markdown += `- [${status}] ${task.title} — ${task.assignee || 'Unassigned'} — ${task.estimate}h\n`;
      });
      markdown += `\n`;
    }

    // Roadmap
    if (options?.roadmap) {
      markdown += `## Roadmap\n`;
      markdown += `| Phase | Start | End | Key deliverables |\n`;
      markdown += `|-------|-------|-----|------------------|\n`;
      options.roadmap.forEach((phase: any) => {
        markdown += `| ${phase.phase} | ${phase.start} | ${phase.end} | ${phase.deliverables.join(', ')} |\n`;
      });
    }

    return markdown;
  }
}

// Notion export connector
export class NotionExporter extends ExportConnector {
  readonly type = 'notion';
  readonly name = 'Notion';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const apiKey = process.env.NOTION_API_KEY;
      if (!apiKey) {
        throw new Error('NOTION_API_KEY environment variable is required');
      }

      const { idea, deliverables, tasks, metadata } = data;

      // Create a new page in Notion
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
                  content: `Project Blueprint — ${idea.title}`,
                },
              },
            ],
          },
          Status: {
            select: {
              name: 'Active',
            },
          },
          Created: {
            date: {
              start: new Date().toISOString(),
            },
          },
        },
        children: this.buildNotionBlocks(data),
      };

      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Notion API error: ${errorData.message || response.statusText}`
        );
      }

      const page = await response.json();

      return {
        success: true,
        url: page.url,
        id: page.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const apiKey = process.env.NOTION_API_KEY;
      if (!apiKey) return false;

      // Test API connection
      const response = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async getAuthUrl(): Promise<string> {
    const clientId = process.env.NOTION_CLIENT_ID;
    if (!clientId) {
      throw new Error('NOTION_CLIENT_ID environment variable is required');
    }

    const redirectUri = encodeURIComponent(
      process.env.NOTION_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/notion/callback`
    );
    return `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}`;
  }

  async handleAuthCallback(code: string): Promise<void> {
    try {
      const clientId = process.env.NOTION_CLIENT_ID;
      const clientSecret = process.env.NOTION_CLIENT_SECRET;
      const redirectUri =
        process.env.NOTION_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/notion/callback`;

      if (!clientId || !clientSecret) {
        throw new Error('Notion OAuth credentials not configured');
      }

      const response = await fetch('https://api.notion.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await response.json();
      // In a real implementation, store this token securely
      process.env.NOTION_API_KEY = tokenData.access_token;
    } catch (error) {
      throw new Error(
        `Notion auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private buildNotionBlocks(data: any): any[] {
    const { idea, deliverables, tasks, metadata } = data;
    const blocks: any[] = [];

    // Summary section
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Summary' } }],
      },
    });

    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: idea.raw_text } }],
      },
    });

    // Goals section
    if (metadata?.goals) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Goals' } }],
        },
      });

      if (Array.isArray(metadata.goals)) {
        metadata.goals.forEach((goal: string) => {
          blocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [{ type: 'text', text: { content: goal } }],
            },
          });
        });
      } else if (typeof metadata.goals === 'string') {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: metadata.goals } }],
          },
        });
      }
    }

    // Target audience
    if (metadata?.target_audience) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Target Audience' } }],
        },
      });

      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: metadata.target_audience } },
          ],
        },
      });
    }

    // Deliverables
    if (deliverables && deliverables.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Deliverables' } }],
        },
      });

      deliverables.forEach((deliverable: any, index: number) => {
        blocks.push({
          object: 'block',
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `**${deliverable.title}** — ${deliverable.description || 'No description'} — ${deliverable.estimate_hours || 0}h estimated`,
                },
              },
            ],
          },
        });
      });
    }

    // Tasks
    if (tasks && tasks.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Tasks' } }],
        },
      });

      tasks.forEach((task: any) => {
        const isCompleted = task.status === 'completed';
        blocks.push({
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `${task.title} — ${task.assignee || 'Unassigned'} — ${task.estimate || 0}h`,
                },
              },
            ],
            checked: isCompleted,
          },
        });
      });
    }

    // Roadmap
    if (metadata?.roadmap) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: 'Roadmap' } }],
        },
      });

      blocks.push({
        object: 'block',
        type: 'table',
        table: {
          table_width: 4,
          has_column_header: true,
          has_row_header: false,
          rows: [
            {
              cells: [
                [{ type: 'text', text: { content: 'Phase' } }],
                [{ type: 'text', text: { content: 'Start' } }],
                [{ type: 'text', text: { content: 'End' } }],
                [{ type: 'text', text: { content: 'Key deliverables' } }],
              ],
            },
            ...metadata.roadmap.map((phase: any) => ({
              cells: [
                [{ type: 'text', text: { content: phase.phase } }],
                [{ type: 'text', text: { content: phase.start } }],
                [{ type: 'text', text: { content: phase.end } }],
                [
                  {
                    type: 'text',
                    text: { content: phase.deliverables.join(', ') },
                  },
                ],
              ],
            })),
          ],
        },
      });
    }

    return blocks;
  }
}

// Trello export connector
export class TrelloExporter extends ExportConnector {
  readonly type = 'trello';
  readonly name = 'Trello';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const token = process.env.TRELLO_TOKEN;

      if (!apiKey || !token) {
        throw new Error(
          'TRELLO_API_KEY and TRELLO_TOKEN environment variables are required'
        );
      }

      const { idea, deliverables, tasks } = data;

      // Create a new board
      const boardResponse = await this.createBoard(idea.title, apiKey, token);
      if (!boardResponse.success) {
        return boardResponse;
      }

      const boardId = boardResponse.id!;

      // Create default lists
      const lists = await this.createDefaultLists(boardId, apiKey, token);

      // Create cards for deliverables and tasks
      await this.createCardsForDeliverables(
        boardId,
        lists,
        deliverables,
        apiKey,
        token
      );
      await this.createCardsForTasks(boardId, lists, tasks, apiKey, token);

      return {
        success: true,
        url: `https://trello.com/b/${boardId}`,
        id: boardId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const apiKey = process.env.TRELLO_API_KEY;
      const token = process.env.TRELLO_TOKEN;

      if (!apiKey || !token) return false;

      // Test API connection
      const response = await fetch(
        `https://api.trello.com/1/members/me?key=${apiKey}&token=${token}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAuthUrl(): Promise<string> {
    const apiKey = process.env.TRELLO_API_KEY;
    const appName = encodeURIComponent('IdeaFlow Project Export');
    const returnUrl = encodeURIComponent(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/trello/callback`
    );

    if (!apiKey) {
      throw new Error('TRELLO_API_KEY environment variable is required');
    }

    return `https://trello.com/1/authorize?expiration=1day&name=${appName}&scope=read,write&response_type=token&key=${apiKey}&return_url=${returnUrl}`;
  }

  async handleAuthCallback(code: string): Promise<void> {
    // Trello uses token-based auth, the token comes directly in the callback
    process.env.TRELLO_TOKEN = code;
  }

  private async createBoard(
    title: string,
    apiKey: string,
    token: string
  ): Promise<ExportResult> {
    try {
      const response = await fetch(
        `https://api.trello.com/1/boards/?name=${encodeURIComponent(`Project: ${title}`)}&defaultLists=false&key=${apiKey}&token=${token}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create board: ${response.statusText}`);
      }

      const board = await response.json();
      return {
        success: true,
        id: board.id,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create board',
      };
    }
  }

  private async createDefaultLists(
    boardId: string,
    apiKey: string,
    token: string
  ): Promise<Record<string, string>> {
    const defaultListNames = [
      'Backlog',
      'To Do',
      'In Progress',
      'Review',
      'Done',
    ];
    const lists: Record<string, string> = {};

    for (const listName of defaultListNames) {
      try {
        const response = await fetch(
          `https://api.trello.com/1/lists?name=${encodeURIComponent(listName)}&idBoard=${boardId}&key=${apiKey}&token=${token}`,
          {
            method: 'POST',
          }
        );

        if (response.ok) {
          const list = await response.json();
          lists[listName.toLowerCase().replace(' ', '_')] = list.id;
        }
      } catch (error) {
        console.error(`Failed to create list ${listName}:`, error);
      }
    }

    return lists;
  }

  private async createCardsForDeliverables(
    boardId: string,
    lists: Record<string, string>,
    deliverables: any[],
    apiKey: string,
    token: string
  ): Promise<void> {
    if (!deliverables || !lists.backlog) return;

    for (const deliverable of deliverables) {
      try {
        const description =
          deliverable.description || 'No description provided';
        const dueDate = deliverable.due_date || '';

        let url = `https://api.trello.com/1/cards?name=${encodeURIComponent(`📦 ${deliverable.title}`)}&desc=${encodeURIComponent(description)}&idList=${lists.backlog}&key=${apiKey}&token=${token}`;

        if (dueDate) {
          url += `&due=${encodeURIComponent(dueDate)}`;
        }

        await fetch(url, { method: 'POST' });
      } catch (error) {
        console.error(
          `Failed to create card for deliverable ${deliverable.title}:`,
          error
        );
      }
    }
  }

  private async createCardsForTasks(
    boardId: string,
    lists: Record<string, string>,
    tasks: any[],
    apiKey: string,
    token: string
  ): Promise<void> {
    if (!tasks || !lists.to_do) return;

    for (const task of tasks) {
      try {
        const description = task.description || '';
        const assignee = task.assignee || '';
        const estimate = task.estimate || '';

        let cardDescription = description;
        if (assignee) cardDescription += `\n\n**Assignee:** ${assignee}`;
        if (estimate) cardDescription += `\n\n**Estimate:** ${estimate}h`;

        // Determine list based on status
        let targetList = lists.to_do;
        if (task.status === 'in_progress' && lists.in_progress) {
          targetList = lists.in_progress;
        } else if (task.status === 'completed' && lists.done) {
          targetList = lists.done;
        }

        const response = await fetch(
          `https://api.trello.com/1/cards?name=${encodeURIComponent(`🔧 ${task.title}`)}&desc=${encodeURIComponent(cardDescription)}&idList=${targetList}&key=${apiKey}&token=${token}`,
          {
            method: 'POST',
          }
        );

        if (response.ok) {
          const card = await response.json();

          // Add labels for priority if available
          if (task.priority) {
            await this.addLabelToCard(card.id, task.priority, apiKey, token);
          }
        }
      } catch (error) {
        console.error(`Failed to create card for task ${task.title}:`, error);
      }
    }
  }

  private async addLabelToCard(
    cardId: string,
    priority: number,
    apiKey: string,
    token: string
  ): Promise<void> {
    try {
      let labelColor = 'green';
      if (priority >= 8) labelColor = 'red';
      else if (priority >= 5) labelColor = 'orange';
      else if (priority >= 3) labelColor = 'yellow';

      await fetch(
        `https://api.trello.com/1/cards/${cardId}/labels?color=${labelColor}&key=${apiKey}&token=${token}`,
        {
          method: 'POST',
        }
      );
    } catch (error) {
      console.error(`Failed to add label to card ${cardId}:`, error);
    }
  }
}

// Google Tasks export connector
export class GoogleTasksExporter extends ExportConnector {
  readonly type = 'google-tasks';
  readonly name = 'Google Tasks';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error(
          'Google access token is required. Complete OAuth flow first.'
        );
      }

      const { idea, deliverables, tasks } = data;

      // Create a new task list for the project
      const taskListResult = await this.createTaskList(idea.title, accessToken);
      if (!taskListResult.success) {
        return taskListResult;
      }

      const taskListId = taskListResult.id!;

      // Create tasks for deliverables and tasks
      await this.createTasksForDeliverables(
        deliverables,
        taskListId,
        accessToken
      );
      await this.createTasksForTasks(tasks, taskListId, accessToken);

      return {
        success: true,
        url: `https://tasks.google.com/tasklist/${taskListId}`,
        id: taskListId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
      if (!accessToken) return false;

      // Test API connection
      const response = await fetch(
        'https://www.googleapis.com/tasks/v1/users/@me/lists',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }

  async getAuthUrl(): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    );
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/tasks');

    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID environment variable is required');
    }

    return `https://accounts.google.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code&access_type=offline&prompt=consent`;
  }

  async handleAuthCallback(code: string): Promise<void> {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri =
        process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await response.json();
      process.env.GOOGLE_ACCESS_TOKEN = tokenData.access_token;

      // Store refresh token if available
      if (tokenData.refresh_token) {
        process.env.GOOGLE_REFRESH_TOKEN = tokenData.refresh_token;
      }
    } catch (error) {
      throw new Error(
        `Google auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async createTaskList(
    title: string,
    accessToken: string
  ): Promise<ExportResult> {
    try {
      const response = await fetch(
        'https://www.googleapis.com/tasks/v1/users/@me/lists',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `Project: ${title}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Google Tasks API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const taskList = await response.json();
      return {
        success: true,
        id: taskList.id,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create task list',
      };
    }
  }

  private async createTasksForDeliverables(
    deliverables: any[],
    taskListId: string,
    accessToken: string
  ): Promise<void> {
    if (!deliverables) return;

    for (const deliverable of deliverables) {
      try {
        let notes = deliverable.description || 'No description provided';
        if (deliverable.estimate_hours) {
          notes += `\n\nEstimated time: ${deliverable.estimate_hours}h`;
        }

        const taskData: any = {
          title: `📦 ${deliverable.title}`,
          notes,
        };

        // Set due date if available
        if (deliverable.due_date) {
          taskData.due = new Date(deliverable.due_date).toISOString();
        }

        await this.createTask(taskListId, taskData, accessToken);
      } catch (error) {
        console.error(
          `Failed to create task for deliverable ${deliverable.title}:`,
          error
        );
      }
    }
  }

  private async createTasksForTasks(
    tasks: any[],
    taskListId: string,
    accessToken: string
  ): Promise<void> {
    if (!tasks) return;

    for (const task of tasks) {
      try {
        let notes = task.description || '';

        if (task.assignee) {
          notes += `\n\nAssignee: ${task.assignee}`;
        }

        if (task.estimate) {
          notes += `\n\nEstimated time: ${task.estimate}h`;
        }

        const taskData: any = {
          title: `🔧 ${task.title}`,
          notes,
        };

        // Set due date if available
        if (task.due_date) {
          taskData.due = new Date(task.due_date).toISOString();
        }

        // Set status
        if (task.status === 'completed') {
          taskData.status = 'completed';
        }

        const createdTask = await this.createTask(
          taskListId,
          taskData,
          accessToken
        );

        // Create subtasks if available
        if (task.subtasks && Array.isArray(task.subtasks)) {
          await this.createSubtasks(
            task.subtasks,
            createdTask.id!,
            accessToken
          );
        }
      } catch (error) {
        console.error(`Failed to create task for ${task.title}:`, error);
      }
    }
  }

  private async createTask(
    taskListId: string,
    taskData: any,
    accessToken: string
  ): Promise<any> {
    const response = await fetch(
      `https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return await response.json();
  }

  private async createSubtasks(
    subtasks: any[],
    parentTaskId: string,
    accessToken: string
  ): Promise<void> {
    for (const subtask of subtasks) {
      try {
        const subtaskData: any = {
          title: subtask.title,
          notes: subtask.description || '',
          parent: parentTaskId,
        };

        if (subtask.status === 'completed') {
          subtaskData.status = 'completed';
        }

        await fetch(
          `https://www.googleapis.com/tasks/v1/lists/@default/tasks`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subtaskData),
          }
        );
      } catch (error) {
        console.error(`Failed to create subtask ${subtask.title}:`, error);
      }
    }
  }
}

// GitHub Projects export connector
export class GitHubProjectsExporter extends ExportConnector {
  readonly type = 'github-projects';
  readonly name = 'GitHub Projects';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        throw new Error('GITHUB_TOKEN environment variable is required');
      }

      const { idea, deliverables, tasks, metadata } = data;
      const owner = options?.githubOwner || process.env.GITHUB_OWNER;
      const repo = options?.githubRepo || process.env.GITHUB_REPO;

      if (!owner || !repo) {
        throw new Error('GitHub owner and repository must be specified');
      }

      // Create project board
      const projectResult = await this.createProject(
        idea.title,
        owner,
        repo,
        token
      );
      if (!projectResult.success) {
        return projectResult;
      }

      const projectId = projectResult.id!;

      // Create milestones for phases
      const milestones = await this.createMilestones(
        metadata?.roadmap,
        owner,
        repo,
        token
      );

      // Create issues for deliverables and tasks
      await this.createIssuesForDeliverables(
        deliverables,
        owner,
        repo,
        token,
        milestones
      );
      await this.createIssuesForTasks(tasks, owner, repo, token, milestones);

      return {
        success: true,
        url: `https://github.com/${owner}/${repo}/projects/${projectId}`,
        id: projectId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const token = process.env.GITHUB_TOKEN;
      if (!token) return false;

      // Test API connection
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async getAuthUrl(): Promise<string> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      throw new Error('GITHUB_CLIENT_ID environment variable is required');
    }

    const redirectUri = encodeURIComponent(
      process.env.GITHUB_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`
    );
    const scopes = encodeURIComponent('repo project');

    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}`;
  }

  async handleAuthCallback(code: string): Promise<void> {
    try {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      const redirectUri =
        process.env.GITHUB_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;

      if (!clientId || !clientSecret) {
        throw new Error('GitHub OAuth credentials not configured');
      }

      const response = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await response.json();
      process.env.GITHUB_TOKEN = tokenData.access_token;
    } catch (error) {
      throw new Error(
        `GitHub auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async createProject(
    title: string,
    owner: string,
    repo: string,
    token: string
  ): Promise<ExportResult> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/projects`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `Project: ${title}`,
            body: `Project board for: ${title}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `GitHub API error: ${errorData.message || response.statusText}`
        );
      }

      const project = await response.json();

      // Create default columns
      await this.createProjectColumns(project.id, token);

      return {
        success: true,
        id: project.id,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create project',
      };
    }
  }

  private async createProjectColumns(
    projectId: number,
    token: string
  ): Promise<void> {
    const columnNames = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];

    for (const columnName of columnNames) {
      try {
        await fetch(`https://api.github.com/projects/${projectId}/columns`, {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: columnName,
          }),
        });
      } catch (error) {
        console.error(`Failed to create column ${columnName}:`, error);
      }
    }
  }

  private async createMilestones(
    roadmap: any[],
    owner: string,
    repo: string,
    token: string
  ): Promise<Record<string, number>> {
    const milestones: Record<string, number> = {};

    if (!roadmap) return milestones;

    for (const phase of roadmap) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/milestones`,
          {
            method: 'POST',
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: phase.phase,
              description: `Phase: ${phase.phase}\nStart: ${phase.start}\nEnd: ${phase.end}\nDeliverables: ${phase.deliverables.join(', ')}`,
              due_on: phase.end ? new Date(phase.end).toISOString() : undefined,
            }),
          }
        );

        if (response.ok) {
          const milestone = await response.json();
          milestones[phase.phase] = milestone.number;
        }
      } catch (error) {
        console.error(
          `Failed to create milestone for phase ${phase.phase}:`,
          error
        );
      }
    }

    return milestones;
  }

  private async createIssuesForDeliverables(
    deliverables: any[],
    owner: string,
    repo: string,
    token: string,
    milestones: Record<string, number>
  ): Promise<void> {
    if (!deliverables) return;

    for (const deliverable of deliverables) {
      try {
        const issueBody = this.buildIssueBody(
          deliverable.description,
          'deliverable',
          deliverable
        );

        await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `📦 ${deliverable.title}`,
            body: issueBody,
            labels: ['deliverable', 'enhancement'],
          }),
        });
      } catch (error) {
        console.error(
          `Failed to create issue for deliverable ${deliverable.title}:`,
          error
        );
      }
    }
  }

  private async createIssuesForTasks(
    tasks: any[],
    owner: string,
    repo: string,
    token: string,
    milestones: Record<string, number>
  ): Promise<void> {
    if (!tasks) return;

    for (const task of tasks) {
      try {
        const issueBody = this.buildIssueBody(task.description, 'task', task);
        const labels = ['task'];

        if (task.priority >= 8) labels.push('priority/high');
        else if (task.priority >= 5) labels.push('priority/medium');
        else labels.push('priority/low');

        const issueData: any = {
          title: `🔧 ${task.title}`,
          body: issueBody,
          labels,
        };

        if (task.assignee) {
          issueData.assignees = [task.assignee];
        }

        // Add milestone if available
        if (task.milestone && milestones[task.milestone]) {
          issueData.milestone = milestones[task.milestone];
        }

        await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(issueData),
        });
      } catch (error) {
        console.error(`Failed to create issue for task ${task.title}:`, error);
      }
    }
  }

  private buildIssueBody(description: string, type: string, item: any): string {
    let body = description || 'No description provided';

    if (item.estimate_hours || item.estimate) {
      body += `\n\n**Time Estimate:** ${item.estimate_hours || item.estimate}h`;
    }

    if (item.assignee) {
      body += `\n\n**Assignee:** @${item.assignee}`;
    }

    if (item.priority) {
      body += `\n\n**Priority:** ${item.priority}/10`;
    }

    body += `\n\n---\n*Created by IdeaFlow export*`;

    return body;
  }
}

// Export manager class
export class ExportManager {
  private connectors: Map<string, ExportConnector> = new Map();

  constructor() {
    // Register built-in connectors
    this.registerConnector(new MarkdownExporter());
    this.registerConnector(new NotionExporter());
    this.registerConnector(new TrelloExporter());
    this.registerConnector(new GoogleTasksExporter());
    this.registerConnector(new GitHubProjectsExporter());
  }

  registerConnector(connector: ExportConnector): void {
    this.connectors.set(connector.type, connector);
  }

  getConnector(type: string): ExportConnector | undefined {
    return this.connectors.get(type);
  }

  getAvailableConnectors(): ExportConnector[] {
    return Array.from(this.connectors.values());
  }

  async export(format: ExportFormat): Promise<ExportResult> {
    const connector = this.getConnector(format.type);

    if (!connector) {
      return {
        success: false,
        error: `Export connector '${format.type}' not found`,
      };
    }

    // Validate connector configuration
    const isValid = await connector.validateConfig();
    if (!isValid) {
      return {
        success: false,
        error: `Export connector '${format.type}' is not properly configured`,
      };
    }

    return await connector.export(format.data, format.metadata);
  }

  async validateAllConnectors(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [type, connector] of this.connectors) {
      try {
        results[type] = await connector.validateConfig();
      } catch (error) {
        results[type] = false;
      }
    }

    return results;
  }
}

// Export singleton instance
export const exportManager = new ExportManager();

// JSON schema for programmatic integrations
export const IdeaFlowExportSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'IdeaFlow Export Schema',
  description: 'JSON schema for IdeaFlow project exports',
  properties: {
    idea: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        raw_text: { type: 'string' },
        status: {
          type: 'string',
          enum: ['draft', 'clarified', 'breakdown', 'completed'],
        },
        created_at: { type: 'string', format: 'date-time' },
      },
      required: ['id', 'title', 'raw_text', 'status'],
    },
    deliverables: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'integer' },
          estimate_hours: { type: 'integer' },
        },
        required: ['id', 'title'],
      },
    },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          deliverable_id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          assignee: { type: 'string' },
          status: {
            type: 'string',
            enum: ['todo', 'in_progress', 'completed'],
          },
          estimate: { type: 'integer' },
        },
        required: ['id', 'deliverable_id', 'title'],
      },
    },
    metadata: {
      type: 'object',
      properties: {
        exported_at: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        goals: { type: 'array', items: { type: 'string' } },
        target_audience: { type: 'string' },
        roadmap: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phase: { type: 'string' },
              start: { type: 'string' },
              end: { type: 'string' },
              deliverables: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  },
  required: ['idea'],
};

// Export utilities
export const exportUtils = {
  // Convert IdeaFlow data to standard format
  normalizeData(idea: any, deliverables: any[] = [], tasks: any[] = []): any {
    return {
      idea: {
        id: idea.id,
        title: idea.title,
        raw_text: idea.raw_text,
        status: idea.status,
        created_at: idea.created_at,
      },
      deliverables: deliverables.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        priority: d.priority,
        estimate_hours: d.estimate_hours,
      })),
      tasks: tasks.map((t) => ({
        id: t.id,
        deliverable_id: t.deliverable_id,
        title: t.title,
        description: t.description,
        assignee: t.assignee,
        status: t.status,
        estimate: t.estimate,
      })),
      metadata: {
        exported_at: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  },

  // Validate export data against schema
  validateExportData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.idea) {
      errors.push('Missing required field: idea');
    } else {
      if (!data.idea.id) errors.push('Missing required field: idea.id');
      if (!data.idea.title) errors.push('Missing required field: idea.title');
      if (!data.idea.raw_text)
        errors.push('Missing required field: idea.raw_text');
      if (!data.idea.status) errors.push('Missing required field: idea.status');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
