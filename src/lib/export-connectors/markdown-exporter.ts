import { ExportConnector, ExportResult, ExportData } from './base';
import { Deliverable, Task } from '../db';

export class MarkdownExporter extends ExportConnector {
  readonly type = 'markdown';
  readonly name = 'Markdown';

  async export(
    data: ExportData,
    options?: Record<string, unknown>
  ): Promise<ExportResult> {
    try {
      const markdown = this.generateMarkdown(data, options);

      return {
        success: true,
        url: `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`,
        content: markdown,
      };
    } catch (_error) {
      return {
        success: false,
        error: _error instanceof Error ? _error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    return true;
  }

  async getAuthUrl(): Promise<string> {
    throw new Error('Markdown export does not require authentication');
  }

  async handleAuthCallback(_code: string): Promise<void> {
    throw new Error('Markdown export does not require authentication');
  }

  private generateMarkdown(
    data: ExportData,
    options?: Record<string, unknown>
  ): string {
    const { idea, deliverables, tasks } = data;

    let markdown = `# Project Blueprint — ${idea.title}\n\n`;

    markdown += `## Summary\n${idea.raw_text}\n\n`;

    if (options?.goals && Array.isArray(options.goals)) {
      markdown += `## Goals\n`;
      (options.goals as string[]).forEach((goal: string) => {
        markdown += `- ${goal}\n`;
      });
      markdown += `\n`;
    }

    if (options?.targetAudience && typeof options.targetAudience === 'string') {
      markdown += `## Target Audience\n${options.targetAudience as string}\n\n`;
    }

    if (deliverables && deliverables.length > 0) {
      markdown += `## Deliverables\n`;
      deliverables.forEach((deliverable: Deliverable, index: number) => {
        markdown += `${index + 1}. **${deliverable.title}** — ${deliverable.description || 'No description'} — ${deliverable.estimate_hours}h estimated\n`;
      });
      markdown += `\n`;
    }

    if (tasks && tasks.length > 0) {
      markdown += `## Tasks\n`;
      tasks.forEach((task: Task) => {
        const status = task.status === 'completed' ? 'x' : ' ';
        markdown += `- [${status}] ${task.title} — ${task.assignee || 'Unassigned'} — ${task.estimate}h\n`;
      });
      markdown += `\n`;
    }

    if (options?.roadmap && Array.isArray(options.roadmap)) {
      markdown += `## Roadmap\n`;
      markdown += `| Phase | Start | End | Key deliverables |\n`;
      markdown += `|-------|-------|-----|------------------|\n`;
      (
        options.roadmap as Array<{
          phase: string;
          start: string;
          end: string;
          deliverables: string[];
        }>
      ).forEach((phase) => {
        markdown += `| ${phase.phase} | ${phase.start} | ${phase.end} | ${phase.deliverables.join(', ')} |\n`;
      });
    }

    return markdown;
  }
}
