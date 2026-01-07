import { NextResponse } from 'next/server';

// Environment validation endpoint
export async function GET() {
  try {
    const envStatus: {
      status: string;
      timestamp: string;
      environment: string;
      checks: Record<string, { present: boolean; required: boolean }>;
      error?: string;
      warning?: string;
      summary?: {
        requiredVarsSet: number;
        totalRequiredVars: number;
        hasAIProvider: boolean;
        aiProvider: string;
        environment: string;
      };
    } = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: {},
    };

    // Check required environment variables
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'COST_LIMIT_DAILY',
      'NEXT_PUBLIC_APP_URL',
    ];

    // Check AI provider variables
    const aiVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];

    const missingVars: string[] = [];
    let hasAIProvider = false;

    // Check required variables
    requiredVars.forEach((varName) => {
      const isSet = !!process.env[varName];
      envStatus.checks[varName] = {
        present: isSet,
        required: true,
      };

      if (!isSet) {
        missingVars.push(varName);
      }
    });

    // Check AI providers
    aiVars.forEach((varName) => {
      const isSet = !!process.env[varName];
      envStatus.checks[varName] = {
        present: isSet,
        required: false,
      };

      if (isSet) {
        hasAIProvider = true;
      }
    });

    // Determine overall health
    if (missingVars.length > 0) {
      envStatus.status = 'unhealthy';
      envStatus.error = `Missing required environment variables: ${missingVars.join(', ')}`;
    } else if (!hasAIProvider) {
      envStatus.status = 'warning';
      envStatus.warning = 'No AI provider (OpenAI or Anthropic) configured';
    }

    // Add configuration summary
    envStatus.summary = {
      requiredVarsSet: requiredVars.length - missingVars.length,
      totalRequiredVars: requiredVars.length,
      hasAIProvider,
      aiProvider: process.env.OPENAI_API_KEY
        ? 'OpenAI'
        : process.env.ANTHROPIC_API_KEY
          ? 'Anthropic'
          : 'None',
      environment: envStatus.environment,
    };

    return NextResponse.json(envStatus);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
