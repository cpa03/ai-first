import { ExportData } from './base';

export interface LazyExportResult {
  success: boolean;
  url?: string;
  error?: string;
  content?: string;
}

export async function lazyExportToMarkdown(
  data: ExportData
): Promise<LazyExportResult> {
  const { MarkdownExporter } = await import('./connectors');
  const exporter = new MarkdownExporter();
  const result = await exporter.export(data);

  return {
    success: result.success,
    url: result.url,
    error: result.error,
    content: (result as LazyExportResult & { content?: string }).content,
  };
}

export async function lazyExportToJSON(
  data: ExportData
): Promise<LazyExportResult> {
  const { JSONExporter } = await import('./connectors');
  const exporter = new JSONExporter();
  const result = await exporter.export(data);

  return {
    success: result.success,
    url: result.url,
    error: result.error,
  };
}

export async function lazyExportToNotion(
  data: ExportData
): Promise<LazyExportResult> {
  const { NotionExporter } = await import('./connectors');
  const exporter = new NotionExporter();
  const result = await exporter.export(data);

  return {
    success: result.success,
    url: result.url,
    error: result.error,
    content: (result as LazyExportResult & { notionPageId?: string })
      .notionPageId,
  };
}

export async function lazyExportToTrello(
  data: ExportData
): Promise<LazyExportResult> {
  const { TrelloExporter } = await import('./connectors');
  const exporter = new TrelloExporter();
  const result = await exporter.export(data);

  return {
    success: result.success,
    url: result.url,
    error: result.error,
    content: (result as LazyExportResult & { boardId?: string }).boardId,
  };
}

export async function lazyExportToGoogleTasks(
  data: ExportData
): Promise<LazyExportResult> {
  const { GoogleTasksExporter } = await import('./connectors');
  const exporter = new GoogleTasksExporter();
  const result = await exporter.export(data);

  return {
    success: result.success,
    url: result.url,
    error: result.error,
  };
}

export async function lazyExportToGitHubProjects(
  data: ExportData
): Promise<LazyExportResult> {
  const { GitHubProjectsExporter } = await import('./connectors');
  const exporter = new GitHubProjectsExporter();
  const result = await exporter.export(data);

  return {
    success: result.success,
    url: result.url,
    error: result.error,
  };
}
