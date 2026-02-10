import {
  standardSuccessResponse,
  ApiContext,
  withApiHandler,
} from '@/lib/api-handler';

async function handleGet(context: ApiContext) {
  const { rateLimit: _rateLimit } = context;
  const envStatus: {
    status: string;
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
    const isSensitive =
      varName.toUpperCase().includes('KEY') ||
      varName.toUpperCase().includes('SECRET') ||
      varName.toUpperCase().includes('TOKEN');

    // Security: Only expose non-sensitive variable names in the health check response
    if (!isSensitive) {
      envStatus.checks[varName] = {
        present: isSet,
        required: true,
      };
    }

    if (!isSet) {
      missingVars.push(varName);
    }
  });

  aiVars.forEach((varName) => {
    const isSet = !!process.env[varName];
    const isSensitive =
      varName.toUpperCase().includes('KEY') ||
      varName.toUpperCase().includes('SECRET') ||
      varName.toUpperCase().includes('TOKEN');

    // Security: Only expose non-sensitive variable names in the health check response
    if (!isSensitive) {
      envStatus.checks[varName] = {
        present: isSet,
        required: false,
      };
    }

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

  return standardSuccessResponse(envStatus, context.requestId);
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
});
