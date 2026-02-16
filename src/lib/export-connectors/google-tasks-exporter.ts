import { ExportConnector, ExportResult, ExportData } from './base';
import { GOOGLE_TASKS_CONFIG } from '@/lib/config';

export class GoogleTasksExporter extends ExportConnector {
  readonly type = 'google-tasks';
  readonly name = 'Google Tasks';

  async export(
    _data: ExportData,
    _options?: Record<string, unknown>
  ): Promise<ExportResult> {
    return {
      success: false,
      error:
        'Google Tasks export requires server-side API route. Use /api/export/google-tasks endpoint.',
    };
  }

  async validateConfig(): Promise<boolean> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    return !!(clientId && clientSecret);
  }

  async getAuthUrl(): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      scope: GOOGLE_TASKS_CONFIG.API.SCOPE,
      access_type: GOOGLE_TASKS_CONFIG.DEFAULTS.ACCESS_TYPE,
      prompt: GOOGLE_TASKS_CONFIG.DEFAULTS.PROMPT,
    });

    return `${GOOGLE_TASKS_CONFIG.API.AUTH_URL}?${params.toString()}`;
  }

  async handleAuthCallback(_code: string): Promise<void> {
    throw new Error(
      'Google OAuth callback handling requires server-side implementation'
    );
  }
}
