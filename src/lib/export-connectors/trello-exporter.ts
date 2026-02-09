import { ExportConnector, ExportResult, ExportData } from './base';
import { Task } from '../db';
import { TRELLO_CONFIG } from '../config';

import { createLogger } from '../logger';

const logger = createLogger('TrelloExporter');

export class TrelloExporter extends ExportConnector {
  readonly type = 'trello';
  readonly name = 'Trello';
  private readonly API_BASE = TRELLO_CONFIG.API.BASE_URL;

  async export(
    data: ExportData,
    _options?: Record<string, unknown>
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

      const [todoName, inProgressName, doneName] = TRELLO_CONFIG.DEFAULTS.LIST_NAMES;
      const todoList = await this.createList(boardId, todoName, apiKey, token);
      const inProgressList = await this.createList(
        boardId,
        inProgressName,
        apiKey,
        token
      );
      const doneList = await this.createList(boardId, doneName, apiKey, token);

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
            id: '',
            deliverable_id: '',
            title: TRELLO_CONFIG.DEFAULTS.PROJECT_CARD_TITLE,
            description: idea.raw_text,
            status: 'todo',
            assignee: undefined,
            estimate: 0,
            start_date: null,
            end_date: null,
            actual_hours: null,
            completion_percentage: 0,
            priority_score: 50,
            complexity_score: 50,
            risk_level: 'low',
            tags: null,
            custom_fields: null,
            milestone_id: null,
            created_at: new Date().toISOString(),
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
      logger.error('Unknown export error:', _error);
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
    const appName = TRELLO_CONFIG.APP.NAME;
    const redirectUri =
      process.env.TRELLO_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/trello/callback`;

    const params = new URLSearchParams({
      key: apiKey || '',
      name: appName,
      expiration: TRELLO_CONFIG.APP.EXPIRATION,
      scope: TRELLO_CONFIG.APP.SCOPE,
      response_type: TRELLO_CONFIG.APP.RESPONSE_TYPE,
      return_url: redirectUri,
    });

    return `${TRELLO_CONFIG.API.AUTH_URL}?${params.toString()}`;
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
  ): Promise<{ id: string; url: string }> {
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
  ): Promise<{ id: string }> {
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
    task: Task,
    apiKey: string,
    token: string
  ): Promise<{ id: string }> {
    const cardData: Record<string, unknown> = {
      name: task.title,
      desc: task.description || '',
      key: apiKey,
      token: token,
    };

    if (task.estimate) {
      cardData.due = task.estimate;
    }

    const params = new URLSearchParams(cardData as Record<string, string>);
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

    if (task.priority_score) {
      await this.addCardLabel(
        card.id,
        this.getPriorityLabel(task.priority_score),
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
      logger.warn(`Failed to add label to card: ${response.statusText}`);
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
      logger.warn(`Failed to add comment to card: ${response.statusText}`);
    }
  }

  private getTaskListId(
    task: Task,
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
    if (priority >= TRELLO_CONFIG.PRIORITY.HIGH_THRESHOLD) return 'red';
    if (priority >= TRELLO_CONFIG.PRIORITY.MEDIUM_THRESHOLD) return 'orange';
    return 'green';
  }
}
