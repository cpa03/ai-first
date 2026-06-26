import { ExportConnector, ExportResult, ExportData } from './base';
import { APP_CONFIG } from '../config';
import { API_ERROR_MESSAGES } from '../config/error-messages';

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
    throw new Error(API_ERROR_MESSAGES.PAGE.JSON_EXPORT_NO_AUTH);
  }

  async handleAuthCallback(_code: string): Promise<void> {
    throw new Error(API_ERROR_MESSAGES.PAGE.JSON_EXPORT_NO_AUTH);
  }

  private generateJSON(
    data: ExportData,
    options?: Record<string, unknown>
  ): string {
    const exportData = {
      ...data,
      metadata: {
        exported_at: new Date().toISOString(),
        version: APP_CONFIG.VERSION,
        ...options,
      },
    };

    return JSON.stringify(exportData, null, 2);
  }
}
