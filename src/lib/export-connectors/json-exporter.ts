import { ExportConnector, ExportResult, ExportData } from './base';

export class JSONExporter extends ExportConnector {
  readonly type = 'json';
  readonly name = 'JSON';

  async export(
    data: ExportData,
    options?: Record<string, unknown>
  ): Promise<ExportResult> {
    try {
      const jsonData = this.generateJSON(data, options);

      return {
        success: true,
        url: `data:application/json;charset=utf-8,${encodeURIComponent(jsonData)}`,
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
    throw new Error('JSON export does not require authentication');
  }

  async handleAuthCallback(_code: string): Promise<void> {
    throw new Error('JSON export does not require authentication');
  }

  private generateJSON(
    data: ExportData,
    options?: Record<string, unknown>
  ): string {
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
