import {
  standardSuccessResponse,
  ApiContext,
  withApiHandler,
} from '@/lib/api-handler';
import { APP_CONFIG } from '@/lib/config';
import { STATUS_CODES, API_CACHE_CONFIG } from '@/lib/config/constants';
import { getCloudflareRequestInfo } from '@/lib/cloudflare';
import { isSensitiveVar } from '@/lib/security';

async function handleGet(context: ApiContext) {
  const { rateLimit, request } = context;
  const envStatus: {
    status: string;
    environment: string;
    checks: Record<string, { present: boolean; required: boolean }>;
    cloudflare?: {
      isCloudflare: boolean;
      rayId: string | null;
      cacheStatus: string | null;
      country: string | null;
      isWorker: boolean;
    };
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

  // Add Cloudflare-specific information for observability
  const cfInfo = getCloudflareRequestInfo(request);
  envStatus.cloudflare = {
    isCloudflare: cfInfo.isCloudflare,
    rayId: cfInfo.rayId,
    cacheStatus: cfInfo.cacheStatus,
    country: cfInfo.country,
    isWorker: cfInfo.isWorker,
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

  return standardSuccessResponse(
    envStatus,
    context.requestId,
    STATUS_CODES.OK,
    rateLimit
  );
}

export const GET = withApiHandler(handleGet, {
  validateSize: false,
  rateLimit: 'strict',
  cacheTtlSeconds: API_CACHE_CONFIG.HEALTH_TTL_SECONDS,
  cacheScope: 'public',
});
