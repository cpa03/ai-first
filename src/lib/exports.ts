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

export interface SyncStatus {
  lastSync?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
}

export interface AuthConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
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

// JSON export connector (built-in)
export class JSONExporter extends ExportConnector {
  readonly type = 'json';
  readonly name = 'JSON';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const jsonData = this.generateJSON(data, options);

      return {
        success: true,
        url: `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    return true;
  }

  async getAuthUrl(): Promise<string> {
    throw new Error('JSON export does not require authentication');
  }

  async handleAuthCallback(code: string): Promise<void> {
    throw new Error('JSON export does not require authentication');
  }

  private generateJSON(data: any, options?: Record<string, any>): string {
    const exportData = {
      ...data,
      metadata: {
        exported_at: new Date().toISOString(),
        version: '1.0.0',
        ...options,
      },
    };

    return JSON.stringify(exportData, null, 2);
  }
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
  private client: any = null;

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const apiKey = process.env.NOTION_API_KEY;
      if (!apiKey) {
        throw new Error('Notion API key is required');
      }

      const { Client } = await import('@notionhq/client');

      if (!this.client) {
        this.client = new Client({
          auth: apiKey,
        });
      }

      if (!data || !data.idea) {
        throw new Error('Invalid export data: idea object is required');
      }

      const { idea, deliverables = [], tasks = [] } = data;

      // Create a new page for the project
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

      // If no parent page specified, create in workspace
      if (!pageData.parent.page_id && !process.env.NOTION_PARENT_PAGE_ID) {
        delete pageData.parent;
      }

      const response = await this.client.pages.create(pageData);

      return {
        success: true,
        url: response.url,
        id: response.id,
      };
    } catch (error) {
      console.error('Notion export error:', error);
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

      const { Client } = await import('@notionhq/client');
      const client = new Client({ auth: apiKey });

      // Test the connection by retrieving user info
      await client.users.me({});
      return true;
    } catch (error) {
      return false;
    }
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

  async handleAuthCallback(code: string): Promise<void> {
    // This would typically exchange the code for an access token
    // For now, we assume the API key is set manually
    throw new Error(
      'OAuth callback handling requires server-side implementation'
    );
  }

  private buildNotionBlocks(
    idea: any,
    deliverables: any[],
    tasks: any[]
  ): any[] {
    const blocks: any[] = [];

    // Project description
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: idea.raw_text || 'No description available',
            },
          },
        ],
      },
    });

    // Deliverables section
    if (deliverables.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '📋 Deliverables',
              },
            },
          ],
        },
      });

      deliverables.forEach((deliverable, index) => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `${deliverable.title} — ${deliverable.description || 'No description'} — ${deliverable.estimate_hours || 0}h`,
                },
              },
            ],
          },
        });
      });
    }

    // Tasks section
    if (tasks.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '✅ Tasks',
              },
            },
          ],
        },
      });

      // Group tasks by deliverable
      const tasksByDeliverable = tasks.reduce(
        (acc: any, task: any) => {
          const deliverableId = task.deliverable_id || 'uncategorized';
          if (!acc[deliverableId]) acc[deliverableId] = [];
          acc[deliverableId].push(task);
          return acc;
        },
        {} as Record<string, any[]>
      );

      Object.entries(tasksByDeliverable).forEach(
        ([deliverableId, deliverableTasks]: [string, any[]]) => {
          const deliverable = deliverables.find((d) => d.id === deliverableId);

          if (deliverable) {
            blocks.push({
              object: 'block',
              type: 'heading_3',
              heading_3: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: deliverable.title,
                    },
                  },
                ],
              },
            });
          }

          deliverableTasks.forEach((task: any) => {
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
      );
    }

    return blocks;
  }
}

// Trello export connector
export class TrelloExporter extends ExportConnector {
  readonly type = 'trello';
  readonly name = 'Trello';
  private readonly API_BASE = 'https://api.trello.com/1';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const { idea, deliverables = [], tasks = [] } = data;
      const apiKey = process.env.TRELLO_API_KEY;
      const token = process.env.TRELLO_TOKEN;

      if (!apiKey || !token) {
        throw new Error('Trello API key and token are required');
      }

      // Create a new board
      const boardData = await this.createBoard(idea.title, apiKey, token);
      const boardId = boardData.id;
      const boardUrl = boardData.url;

      // Create default lists
      const todoList = await this.createList(boardId, 'To Do', apiKey, token);
      const inProgressList = await this.createList(
        boardId,
        'In Progress',
        apiKey,
        token
      );
      const doneList = await this.createList(boardId, 'Done', apiKey, token);

      // Create lists for each deliverable
      const deliverableLists: Record<string, string> = {};
      for (const deliverable of deliverables) {
        const list = await this.createList(
          boardId,
          deliverable.title,
          apiKey,
          token
        );
        deliverableLists[deliverable.id] = list.id;
      }

      // Create cards for tasks
      for (const task of tasks) {
        const listId = this.getTaskListId(
          task,
          deliverableLists,
          todoList.id,
          inProgressList.id,
          doneList.id
        );
        await this.createCard(listId, task, apiKey, token);
      }

      // Add project description to the first card
      if (idea.raw_text && todoList.id) {
        await this.createCard(
          todoList.id,
          {
            title: '📋 Project Overview',
            description: idea.raw_text,
            assignee: null,
            estimate: 0,
          },
          apiKey,
          token
        );
      }

      return {
        success: true,
        url: boardUrl,
        id: boardId,
      };
    } catch (error) {
      console.error('Trello export error:', error);
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

      // Test the connection by getting member info
      const response = await fetch(
        `${this.API_BASE}/members/me?key=${apiKey}&token=${token}`
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getAuthUrl(): Promise<string> {
    const apiKey = process.env.TRELLO_API_KEY;
    const appName = 'IdeaFlow';
    const redirectUri =
      process.env.TRELLO_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/trello/callback`;

    const params = new URLSearchParams({
      key: apiKey || '',
      name: appName,
      expiration: 'never',
      scope: 'read,write',
      response_type: 'token',
      return_url: redirectUri,
    });

    return `https://trello.com/1/authorize?${params.toString()}`;
  }

  async handleAuthCallback(code: string): Promise<void> {
    // Trello uses token-based auth, so this would handle the token from the callback
    throw new Error(
      'Trello token handling requires server-side implementation'
    );
  }

  private async createBoard(
    name: string,
    apiKey: string,
    token: string
  ): Promise<any> {
    const response = await fetch(
      `${this.API_BASE}/boards/?name=${encodeURIComponent(name)}&key=${apiKey}&token=${token}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create Trello board: ${response.statusText}`);
    }

    return response.json();
  }

  private async createList(
    boardId: string,
    name: string,
    apiKey: string,
    token: string
  ): Promise<any> {
    const response = await fetch(
      `${this.API_BASE}/boards/${boardId}/lists?name=${encodeURIComponent(name)}&key=${apiKey}&token=${token}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create Trello list: ${response.statusText}`);
    }

    return response.json();
  }

  private async createCard(
    listId: string,
    task: any,
    apiKey: string,
    token: string
  ): Promise<any> {
    const cardData = {
      name: task.title,
      desc: task.description || '',
      key: apiKey,
      token: token,
    };

    // Add due date if available
    if (task.due_date) {
      (cardData as any).due = task.due_date;
    }

    const params = new URLSearchParams(cardData as any);
    const response = await fetch(
      `${this.API_BASE}/cards?${params.toString()}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create Trello card: ${response.statusText}`);
    }

    const card = await response.json();

    // Add labels for priority and assignee
    if (task.priority) {
      await this.addCardLabel(
        card.id,
        this.getPriorityLabel(task.priority),
        apiKey,
        token
      );
    }

    if (task.assignee) {
      await this.addCardComment(
        card.id,
        `Assigned to: ${task.assignee}`,
        apiKey,
        token
      );
    }

    if (task.estimate) {
      await this.addCardComment(
        card.id,
        `Estimate: ${task.estimate}h`,
        apiKey,
        token
      );
    }

    return card;
  }

  private async addCardLabel(
    cardId: string,
    label: string,
    apiKey: string,
    token: string
  ): Promise<void> {
    const response = await fetch(
      `${this.API_BASE}/cards/${cardId}/labels?color=${label}&key=${apiKey}&token=${token}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      console.warn(`Failed to add label to card: ${response.statusText}`);
    }
  }

  private async addCardComment(
    cardId: string,
    comment: string,
    apiKey: string,
    token: string
  ): Promise<void> {
    const response = await fetch(
      `${this.API_BASE}/cards/${cardId}/actions/comments?text=${encodeURIComponent(comment)}&key=${apiKey}&token=${token}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      console.warn(`Failed to add comment to card: ${response.statusText}`);
    }
  }

  private getTaskListId(
    task: any,
    deliverableLists: Record<string, string>,
    todoListId: string,
    inProgressListId: string,
    doneListId: string
  ): string {
    // First try to use the deliverable list
    if (task.deliverable_id && deliverableLists[task.deliverable_id]) {
      return deliverableLists[task.deliverable_id];
    }

    // Fall back to status-based lists
    switch (task.status) {
      case 'completed':
        return doneListId;
      case 'in_progress':
        return inProgressListId;
      default:
        return todoListId;
    }
  }

  private getPriorityLabel(priority: number): string {
    if (priority >= 4) return 'red'; // High priority
    if (priority >= 2) return 'orange'; // Medium priority
    return 'green'; // Low priority
  }
}

// Google Tasks export connector
export class GoogleTasksExporter extends ExportConnector {
  readonly type = 'google-tasks';
  readonly name = 'Google Tasks';
  private oauth2Client: any = null;
  private tasksClient: any = null;

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('Google client credentials are required');
      }

      const { google } = await import('googleapis');

      if (!this.oauth2Client) {
        await this.setupAuthClient();
      }

      if (!this.tasksClient) {
        this.tasksClient = google.tasks({
          version: 'v1',
          auth: this.oauth2Client,
        });
      }

      if (!data || !data.idea) {
        throw new Error('Invalid export data: idea object is required');
      }

      const { idea, deliverables = [], tasks = [] } = data;

      // Create a new task list for the project
      const taskList = await this.createTaskList(idea.title);
      const taskListId = taskList.id;

      // Group tasks by deliverable
      const tasksByDeliverable = tasks.reduce(
        (acc, task) => {
          const deliverableId = task.deliverable_id || 'uncategorized';
          if (!acc[deliverableId]) acc[deliverableId] = [];
          acc[deliverableId].push(task);
          return acc;
        },
        {} as Record<string, any[]>
      );

      // Create tasks for each deliverable
      const createdTasks: string[] = [];

      for (const [deliverableId, deliverableTasks] of Object.entries(
        tasksByDeliverable
      )) {
        const deliverable = deliverables.find((d) => d.id === deliverableId);

        if (deliverable) {
          // Create a parent task for the deliverable
          const parentTask = await this.createTask(taskListId, {
            title: `📋 ${deliverable.title}`,
            notes: deliverable.description || '',
          });
          createdTasks.push(parentTask.id);

          // Create subtasks for each task in this deliverable
          for (const task of deliverableTasks as any[]) {
            const subtask = await this.createTask(taskListId, {
              title: task.title,
              notes: `${task.description || ''}\n\nAssignee: ${task.assignee || 'Unassigned'}\nEstimate: ${task.estimate || 0}h`,
              due: task.due_date,
              status: task.status === 'completed' ? 'completed' : 'needsAction',
            });
            createdTasks.push(subtask.id);
          }
        } else {
          // Create tasks without deliverable grouping
          for (const task of deliverableTasks as any[]) {
            const createdTask = await this.createTask(taskListId, {
              title: task.title,
              notes: `${task.description || ''}\n\nAssignee: ${task.assignee || 'Unassigned'}\nEstimate: ${task.estimate || 0}h`,
              due: task.due_date,
              status: task.status === 'completed' ? 'completed' : 'needsAction',
            });
            createdTasks.push(createdTask.id);
          }
        }
      }

      // Add project overview as the first task
      if (idea.raw_text) {
        await this.createTask(taskListId, {
          title: '📋 Project Overview',
          notes: idea.raw_text,
        });
      }

      return {
        success: true,
        url: `https://tasks.google.com/tasklist/${taskListId}`,
        id: taskListId,
      };
    } catch (error) {
      console.error('Google Tasks export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

      if (!clientId || !clientSecret) return false;

      // If we have a refresh token, try to use it
      if (refreshToken) {
        await this.setupAuthClient();
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async getAuthUrl(): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

    const { google } = await import('googleapis');

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/tasks.readonly',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async handleAuthCallback(code: string): Promise<void> {
    try {
      const { google } = await import('googleapis');

      const redirectUri =
        process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );

      const { tokens } = await oauth2Client.getToken(code);

      // In a real implementation, you would store these tokens securely
      // For now, we'll just log that the callback was handled
      console.log('Google OAuth tokens received:', tokens);

      throw new Error('Token storage requires server-side implementation');
    } catch (error) {
      throw new Error(`Google OAuth callback failed: ${error}`);
    }
  }

  private async setupAuthClient(): Promise<void> {
    const { google } = await import('googleapis');

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    );

    // Use refresh token if available
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });
    }
  }

  private async createTaskList(title: string): Promise<any> {
    const response = await this.tasksClient.tasklists.insert({
      requestBody: {
        title: title,
      },
    });

    return response.data;
  }

  private async createTask(taskListId: string, taskData: any): Promise<any> {
    const requestBody: any = {
      title: taskData.title,
    };

    if (taskData.notes) {
      requestBody.notes = taskData.notes;
    }

    if (taskData.due) {
      requestBody.due = taskData.due;
    }

    if (taskData.status) {
      requestBody.status = taskData.status;
    }

    const response = await this.tasksClient.tasks.insert({
      tasklist: taskListId,
      requestBody,
    });

    return response.data;
  }
}

// GitHub Projects export connector
export class GitHubProjectsExporter extends ExportConnector {
  readonly type = 'github-projects';
  readonly name = 'GitHub Projects';
  private readonly API_BASE = 'https://api.github.com';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const { idea, deliverables = [], tasks = [] } = data;
      const token = process.env.GITHUB_TOKEN;

      if (!token) {
        throw new Error('GitHub token is required');
      }

      // Get authenticated user
      const user = await this.getAuthenticatedUser(token);

      // Create a new repository or use existing one
      const repoName = this.sanitizeRepoName(idea.title);
      const repository = await this.createOrUpdateRepository(
        user.login,
        repoName,
        idea,
        token
      );

      // Create a GitHub Project
      const project = await this.createProject(
        user.login,
        repository.name,
        idea.title,
        token
      );

      // Create columns for different statuses
      const todoColumn = await this.createProjectColumn(
        project.id,
        'To Do',
        token
      );
      const inProgressColumn = await this.createProjectColumn(
        project.id,
        'In Progress',
        token
      );
      const doneColumn = await this.createProjectColumn(
        project.id,
        'Done',
        token
      );

      // Create columns for deliverables
      const deliverableColumns: Record<string, string> = {};
      for (const deliverable of deliverables) {
        const column = await this.createProjectColumn(
          project.id,
          deliverable.title,
          token
        );
        deliverableColumns[deliverable.id] = column.id;
      }

      // Create issues for tasks
      const createdIssues: any[] = [];
      for (const task of tasks) {
        const issue = await this.createIssue(
          user.login,
          repository.name,
          task,
          token
        );
        createdIssues.push(issue);

        // Add issue to appropriate project column
        const columnId = this.getTaskColumnId(
          task,
          deliverableColumns,
          todoColumn.id,
          inProgressColumn.id,
          doneColumn.id
        );
        await this.addIssueToProjectCard(columnId, issue.id, token);
      }

      // Create a project overview issue
      if (idea.raw_text) {
        await this.createIssue(
          user.login,
          repository.name,
          {
            title: '📋 Project Overview',
            description: idea.raw_text,
            assignee: null,
            estimate: 0,
            status: 'todo',
          },
          token
        );
      }

      // Create README with project structure
      await this.createReadme(
        user.login,
        repository.name,
        idea,
        deliverables,
        tasks,
        token
      );

      return {
        success: true,
        url: repository.html_url,
        id: repository.id.toString(),
      };
    } catch (error) {
      console.error('GitHub Projects export error:', error);
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

      // Test the connection by getting user info
      const response = await fetch(`${this.API_BASE}/user`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getAuthUrl(): Promise<string> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri =
      process.env.GITHUB_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;
    const scopes = 'repo,project,read:org';

    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      scope: scopes,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async handleAuthCallback(code: string): Promise<void> {
    // This would exchange the code for an access token
    throw new Error(
      'GitHub OAuth callback handling requires server-side implementation'
    );
  }

  private async getAuthenticatedUser(token: string): Promise<any> {
    const response = await fetch(`${this.API_BASE}/user`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get authenticated user: ${response.statusText}`
      );
    }

    return response.json();
  }

  private async createOrUpdateRepository(
    owner: string,
    repoName: string,
    idea: any,
    token: string
  ): Promise<any> {
    // Try to create the repository first
    const createResponse = await fetch(`${this.API_BASE}/user/repos`, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description: idea.raw_text || `Project: ${idea.title}`,
        private: false,
        auto_init: true,
      }),
    });

    if (createResponse.ok) {
      return createResponse.json();
    }

    // If creation fails (e.g., repo already exists), try to get the existing repo
    const getResponse = await fetch(
      `${this.API_BASE}/repos/${owner}/${repoName}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!getResponse.ok) {
      throw new Error(
        `Failed to create or get repository: ${getResponse.statusText}`
      );
    }

    return getResponse.json();
  }

  private async createProject(
    owner: string,
    repo: string,
    projectName: string,
    token: string
  ): Promise<any> {
    const response = await fetch(
      `${this.API_BASE}/repos/${owner}/${repo}/projects`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.inertia-preview+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          body: `Project board for ${projectName}`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create GitHub project: ${response.statusText}`
      );
    }

    return response.json();
  }

  private async createProjectColumn(
    projectId: string,
    columnName: string,
    token: string
  ): Promise<any> {
    const response = await fetch(
      `${this.API_BASE}/projects/${projectId}/columns`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.inertia-preview+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: columnName,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create project column: ${response.statusText}`
      );
    }

    return response.json();
  }

  private async createIssue(
    owner: string,
    repo: string,
    task: any,
    token: string
  ): Promise<any> {
    const issueData: any = {
      title: task.title,
      body: task.description || '',
    };

    if (task.assignee) {
      issueData.assignees = [task.assignee];
    }

    // Add labels for priority and status
    const labels: string[] = [];
    if (task.priority) {
      labels.push(this.getPriorityLabel(task.priority));
    }
    if (task.estimate) {
      labels.push(`estimate: ${task.estimate}h`);
    }
    if (task.status) {
      labels.push(`status: ${task.status}`);
    }

    if (labels.length > 0) {
      issueData.labels = labels;
    }

    const response = await fetch(
      `${this.API_BASE}/repos/${owner}/${repo}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create issue: ${response.statusText}`);
    }

    return response.json();
  }

  private async addIssueToProjectCard(
    columnId: string,
    issueId: string,
    token: string
  ): Promise<void> {
    const response = await fetch(
      `${this.API_BASE}/projects/columns/${columnId}/cards`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.inertia-preview+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_id: issueId,
          content_type: 'Issue',
        }),
      }
    );

    if (!response.ok) {
      console.warn(
        `Failed to add issue to project card: ${response.statusText}`
      );
    }
  }

  private async createReadme(
    owner: string,
    repo: string,
    idea: any,
    deliverables: any[],
    tasks: any[],
    token: string
  ): Promise<void> {
    let readme = `# ${idea.title}\n\n`;
    readme += `${idea.raw_text || 'No description available.'}\n\n`;

    if (deliverables.length > 0) {
      readme += `## 📋 Deliverables\n\n`;
      deliverables.forEach((deliverable, index) => {
        readme += `${index + 1}. **${deliverable.title}** — ${deliverable.description || 'No description'} — ${deliverable.estimate_hours || 0}h estimated\n`;
      });
      readme += '\n';
    }

    if (tasks.length > 0) {
      readme += `## ✅ Tasks\n\n`;
      tasks.forEach((task) => {
        const status = task.status === 'completed' ? 'x' : ' ';
        readme += `- [${status}] ${task.title} — ${task.assignee || 'Unassigned'} — ${task.estimate || 0}h\n`;
      });
      readme += '\n';
    }

    readme += `---\n\n*This repository was automatically generated by IdeaFlow*`;

    const response = await fetch(
      `${this.API_BASE}/repos/${owner}/${repo}/contents/README.md`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Add project README',
          content: Buffer.from(readme).toString('base64'),
        }),
      }
    );

    if (!response.ok) {
      console.warn(`Failed to create README: ${response.statusText}`);
    }
  }

  private getTaskColumnId(
    task: any,
    deliverableColumns: Record<string, string>,
    todoColumnId: string,
    inProgressColumnId: string,
    doneColumnId: string
  ): string {
    // First try to use the deliverable column
    if (task.deliverable_id && deliverableColumns[task.deliverable_id]) {
      return deliverableColumns[task.deliverable_id];
    }

    // Fall back to status-based columns
    switch (task.status) {
      case 'completed':
        return doneColumnId;
      case 'in_progress':
        return inProgressColumnId;
      default:
        return todoColumnId;
    }
  }

  private getPriorityLabel(priority: number): string {
    if (priority >= 4) return 'priority: high';
    if (priority >= 2) return 'priority: medium';
    return 'priority: low';
  }

  private sanitizeRepoName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

// Export manager class
export class ExportManager {
  private connectors: Map<string, ExportConnector> = new Map();

  constructor() {
    // Register built-in connectors
    this.registerConnector(new JSONExporter());
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

    for (const type of Array.from(this.connectors.keys())) {
      const connector = this.connectors.get(type);
      if (connector) {
        try {
          results[type] = await connector.validateConfig();
        } catch (error) {
          results[type] = false;
        }
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

// Rate limiting utility
export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 100, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();

    // Remove old requests outside the time window
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    this.requests.push(now);
  }
}

// Sync status tracking
export class SyncStatusTracker {
  private static instance: SyncStatusTracker;
  private syncStatuses: Map<string, SyncStatus> = new Map();

  static getInstance(): SyncStatusTracker {
    if (!SyncStatusTracker.instance) {
      SyncStatusTracker.instance = new SyncStatusTracker();
    }
    return SyncStatusTracker.instance;
  }

  setSyncStatus(exportId: string, status: SyncStatus): void {
    this.syncStatuses.set(exportId, {
      ...status,
      lastSync: new Date().toISOString(),
    });
  }

  getSyncStatus(exportId: string): SyncStatus | undefined {
    return this.syncStatuses.get(exportId);
  }

  getAllSyncStatuses(): Record<string, SyncStatus> {
    return Object.fromEntries(this.syncStatuses);
  }

  clearSyncStatus(exportId: string): void {
    this.syncStatuses.delete(exportId);
  }
}

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

  // Generate unique export ID
  generateExportId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Handle export errors with retry logic
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    throw lastError!;
  },
};
