import {
  standardSuccessResponse,
  ApiContext,
  withApiHandler,
} from '@/lib/api-handler';
import { APP_CONFIG } from '@/lib/config';

function isSensitiveVar(varName: string): boolean {
  const upper = varName.toUpperCase();
  return (
    upper.includes('KEY') || upper.includes('SECRET') || upper.includes('TOKEN')
  );
}

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
    status: APP_CONFIG.HEALTH_STATUS.HEALTHY,
    environment: process.env.NODE_ENV || 'development',
    checks: {},
  };

  const requiredVars = [...APP_CONFIG.ENV_VARS.REQUIRED];
  const aiVars = [...APP_CONFIG.ENV_VARS.AI_PROVIDERS];

  const missingVars: string[] = [];
  let hasAIProvider = false;

  requiredVars.forEach((varName) => {
    const isSet = !!process.env[varName];

    // Security: Only expose non-sensitive variable names in the health check response
    if (!isSensitiveVar(varName)) {
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

    // Security: Only expose non-sensitive variable names in the health check response
    if (!isSensitiveVar(varName)) {
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
    envStatus.status = APP_CONFIG.HEALTH_STATUS.UNHEALTHY;
    envStatus.error = `Missing required environment variables`;
  } else if (!hasAIProvider) {
    envStatus.status = APP_CONFIG.HEALTH_STATUS.WARNING;
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
