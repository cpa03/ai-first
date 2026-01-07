import { successResponse, ApiContext, withApiHandler } from '@/lib/api-handler';

async function handleGet(_context: ApiContext) {
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
      environment: string;
    };
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {},
  };

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'COST_LIMIT_DAILY',
    'NEXT_PUBLIC_APP_URL',
  ];

  const aiVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];

  const missingVars: string[] = [];
  let hasAIProvider = false;

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

  if (missingVars.length > 0) {
    envStatus.status = 'unhealthy';
    envStatus.error = `Missing required environment variables`;
  } else if (!hasAIProvider) {
    envStatus.status = 'warning';
    envStatus.warning = 'No AI provider configured';
  }

  envStatus.summary = {
    requiredVarsSet: requiredVars.length - missingVars.length,
    totalRequiredVars: requiredVars.length,
    hasAIProvider,
    environment: envStatus.environment,
  };

  return successResponse({
    success: true,
    data: envStatus,
    requestId: _context.requestId,
  });
}

export const GET = withApiHandler(handleGet, { validateSize: false });
