import { ExportConnector, ExportResult } from './base';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class TrelloExporter extends ExportConnector {
  readonly type = 'trello';
  readonly name = 'Trello';
  private readonly API_BASE = 'https://api.trello.com/1';

  async export(
    data: any,
    _options?: Record<string, any>
  ): Promise<ExportResult> {
    const { idea, deliverables = [], tasks = [] } = data;
    const apiKey = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;

    if (!apiKey || !token) {
      return {
        success: false,
        error: 'Trello API key and token are required',
      };
    }

    try {
      const boardData = await this.createBoard(idea.title, apiKey, token);
      const boardId = boardData.id;
      const boardUrl = boardData.url;

      const todoList = await this.createList(boardId, 'To Do', apiKey, token);
      const inProgressList = await this.createList(
        boardId,
        'In Progress',
        apiKey,
        token
      );
      const doneList = await this.createList(boardId, 'Done', apiKey, token);

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
      const apiKey = process.env.TRELLO_API_KEY;
      const token = process.env.TRELLO_TOKEN;

      if (!apiKey || !token) return false;

      const response = await this.executeWithResilience(
        () => fetch(`${this.API_BASE}/members/me?key=${apiKey}&token=${token}`),
        'validate-config'
      );
      return response.ok;
    } catch (_error) {
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

  async handleAuthCallback(_code: string): Promise<void> {
    throw new Error(
      'Trello token handling requires server-side implementation'
    );
  }

  private async createBoard(
    name: string,
    apiKey: string,
    token: string
  ): Promise<any> {
    const response = await this.executeWithResilience(
      () =>
        fetch(
          `${this.API_BASE}/boards/?name=${encodeURIComponent(name)}&key=${apiKey}&token=${token}`,
          {
            method: 'POST',
          }
        ),
      'create-board'
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
    const response = await this.executeWithResilience(
      () =>
        fetch(
          `${this.API_BASE}/boards/${boardId}/lists?name=${encodeURIComponent(name)}&key=${apiKey}&token=${token}`,
          {
            method: 'POST',
          }
        ),
      'create-list'
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

    if (task.due_date) {
      (cardData as any).due = task.due_date;
    }

    const params = new URLSearchParams(cardData as any);
    const response = await this.executeWithResilience(
      () =>
        fetch(`${this.API_BASE}/cards?${params.toString()}`, {
          method: 'POST',
        }),
      'create-card'
    );

    if (!response.ok) {
      throw new Error(`Failed to create Trello card: ${response.statusText}`);
    }

    const card = await response.json();

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
    const response = await this.executeWithResilience(
      () =>
        fetch(
          `${this.API_BASE}/cards/${cardId}/labels?color=${label}&key=${apiKey}&token=${token}`,
          {
            method: 'POST',
          }
        ),
      'add-card-label'
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
    const response = await this.executeWithResilience(
      () =>
        fetch(
          `${this.API_BASE}/cards/${cardId}/actions/comments?text=${encodeURIComponent(comment)}&key=${apiKey}&token=${token}`,
          {
            method: 'POST',
          }
        ),
      'add-card-comment'
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
    if (task.deliverable_id && deliverableLists[task.deliverable_id]) {
      return deliverableLists[task.deliverable_id];
    }

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
    if (priority >= 4) return 'red';
    if (priority >= 2) return 'orange';
    return 'green';
  }
}
