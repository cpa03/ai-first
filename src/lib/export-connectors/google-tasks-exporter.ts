import { ExportConnector, ExportResult } from './base';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class GoogleTasksExporter extends ExportConnector {
  readonly type = 'google-tasks';
  readonly name = 'Google Tasks';

  async export(
    _data: any,
    _options?: Record<string, any>
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
      scope: 'https://www.googleapis.com/auth/tasks',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/oauth/authorize?${params.toString()}`;
  }

  async handleAuthCallback(_code: string): Promise<void> {
    throw new Error(
      'Google OAuth callback handling requires server-side implementation'
    );
  }
}
