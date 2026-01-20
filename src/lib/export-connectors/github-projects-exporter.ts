import { ExportConnector, ExportResult, ExportData } from './base';
import { Task, Deliverable, Idea } from '../db';

import { createLogger } from '../logger';

const logger = createLogger('GitHubProjectsExporter');

export class GitHubProjectsExporter extends ExportConnector {
  readonly type = 'github-projects';
  readonly name = 'GitHub Projects';
  private readonly API_BASE = 'https://api.github.com';

  async export(
    data: ExportData,
    _options?: Record<string, unknown>
  ): Promise<ExportResult> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return {
        success: false,
        error: 'GitHub token is required',
      };
    }

    try {
      const { idea, deliverables = [], tasks = [] } = data;

      const user = await this.getAuthenticatedUser(token);

      const repoName = this.sanitizeRepoName(idea.title);
      const repository = await this.createOrUpdateRepository(
        user.login,
        repoName,
        idea,
        token
      );

      const project = await this.createProject(
        user.login,
        repository.name,
        idea.title,
        token
      );

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

      const deliverableColumns: Record<string, number> = {};
      for (const deliverable of deliverables) {
        const column = await this.createProjectColumn(
          project.id,
          deliverable.title,
          token
        );
        deliverableColumns[deliverable.id] = column.id;
      }

      const createdIssues: { id: number }[] = [];
      for (const task of tasks) {
        const issue = await this.createIssue(
          user.login,
          repository.name,
          task,
          token
        );
        createdIssues.push(issue);

        const columnId = this.getTaskColumnId(
          task,
          deliverableColumns,
          todoColumn.id,
          inProgressColumn.id,
          doneColumn.id
        );
        await this.addIssueToProjectCard(columnId, String(issue.id), token);
      }

      if (idea.raw_text) {
        await this.createIssue(
          user.login,
          repository.name,
          {
            id: '',
            deliverable_id: '',
            title: '📋 Project Overview',
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
          token
        );
      }

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
      const token = process.env.GITHUB_TOKEN;
      if (!token) return false;

      const response = await this.executeWithResilience(
        () =>
          fetch(`${this.API_BASE}/user`, {
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }),
        'validate-config'
      );

      return response.ok;
    } catch (_error) {
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

  async handleAuthCallback(_code: string): Promise<void> {
    throw new Error(
      'GitHub OAuth callback handling requires server-side implementation'
    );
  }

  private async getAuthenticatedUser(
    token: string
  ): Promise<{ login: string }> {
    const response = await this.executeWithResilience(
      () =>
        fetch(`${this.API_BASE}/user`, {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }),
      'get-authenticated-user'
    );

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
    idea: Omit<Idea, 'user_id' | 'deleted_at'>,
    token: string
  ): Promise<{ id: number; name: string; html_url: string }> {
    const createResponse = await this.executeWithResilience(
      () =>
        fetch(`${this.API_BASE}/user/repos`, {
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
        }),
      'create-repository'
    );

    if (createResponse.ok) {
      return createResponse.json();
    }

    const getResponse = await this.executeWithResilience(
      () =>
        fetch(`${this.API_BASE}/repos/${owner}/${repoName}`, {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }),
      'get-repository'
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
  ): Promise<{ id: number }> {
    const response = await this.executeWithResilience(
      () =>
        fetch(`${this.API_BASE}/repos/${owner}/${repo}/projects`, {
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
        }),
      'create-project'
    );

    if (!response.ok) {
      throw new Error(
        `Failed to create GitHub project: ${response.statusText}`
      );
    }

    return response.json();
  }

  private async createProjectColumn(
    projectId: number,
    columnName: string,
    token: string
  ): Promise<{ id: number }> {
    const response = await this.executeWithResilience(
      () =>
        fetch(`${this.API_BASE}/projects/${projectId}/columns`, {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.inertia-preview+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: columnName,
          }),
        }),
      'create-project-column'
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
    task: Task,
    token: string
  ): Promise<{ id: number }> {
    const issueData: Record<string, unknown> = {
      title: task.title,
      body: task.description || '',
    };

    if (task.assignee) {
      issueData.assignees = [task.assignee];
    }

    const labels: string[] = [];
    if (task.priority_score) {
      labels.push(this.getPriorityLabel(task.priority_score));
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

    const response = await this.executeWithResilience(
      () =>
        fetch(`${this.API_BASE}/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(issueData),
        }),
      'create-issue'
    );

    if (!response.ok) {
      throw new Error(`Failed to create issue: ${response.statusText}`);
    }

    return response.json();
  }

  private async addIssueToProjectCard(
    columnId: number,
    issueId: string,
    token: string
  ): Promise<void> {
    const response = await this.executeWithResilience(
      () =>
        fetch(`${this.API_BASE}/projects/columns/${String(columnId)}/cards`, {
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
        }),
      'add-issue-to-project-card'
    );

    if (!response.ok) {
      logger.warn(
        `Failed to add issue to project card: ${response.statusText}`
      );
    }
  }

  private async createReadme(
    owner: string,
    repo: string,
    idea: Omit<Idea, 'user_id' | 'deleted_at'>,
    deliverables: Deliverable[],
    tasks: Task[],
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

    const response = await this.executeWithResilience(
      () =>
        fetch(`${this.API_BASE}/repos/${owner}/${repo}/contents/README.md`, {
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
        }),
      'create-readme'
    );

    if (!response.ok) {
      logger.warn(`Failed to create README: ${response.statusText}`);
    }
  }

  private getTaskColumnId(
    task: Task,
    deliverableColumns: Record<string, number>,
    todoColumnId: number,
    inProgressColumnId: number,
    doneColumnId: number
  ): number {
    if (task.deliverable_id && deliverableColumns[task.deliverable_id]) {
      return deliverableColumns[task.deliverable_id];
    }

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
