import { AIRequest, AIResponse, AIProvider, AIMode, AIProviderConfig, AIStatus, ProviderHealth } from './types';
import { routeRequest } from './router';
import { getCache, setCache, getCacheSize } from './cache';

const MAX_CACHE_SIZE = 500;

const PROVIDER_CONFIGS: Record<AIProvider, AIProviderConfig> = {
  zai: { name: 'zai', apiKey: process.env.ZAI_API_KEY || '', priority: 1, enabled: true },
  runware: { name: 'runware', apiKey: process.env.RUNWARE_API_KEY || '', baseUrl: 'https://api.runware.ai/v1', priority: 2, enabled: true },
  fal: { name: 'fal', apiKey: process.env.FAL_API_KEY || '', baseUrl: 'https://fal.run', priority: 3, enabled: true },
  siliconflow: { name: 'siliconflow', apiKey: process.env.SILICONFLOW_API_KEY || '', baseUrl: 'https://api.siliconflow.cn/v1', priority: 4, enabled: true },
};

const MODE_PROVIDER_MAP: Record<AIMode, AIProvider[]> = {
  chat: ['zai', 'siliconflow'],
  image: ['zai', 'runware', 'fal', 'siliconflow'],
  video: ['fal'],
  audio: ['zai'],
  upscale: ['runware', 'fal'],
  'image-to-3d': ['fal'],
  'brand-kit': ['zai'],
  vision: ['zai'],
};

const healthStatus: Record<AIProvider, ProviderHealth> = {
  zai: { provider: 'zai', healthy: true, latency: 0, lastCheck: Date.now(), errorRate: 0 },
  runware: { provider: 'runware', healthy: true, latency: 0, lastCheck: Date.now(), errorRate: 0 },
  fal: { provider: 'fal', healthy: true, latency: 0, lastCheck: Date.now(), errorRate: 0 },
  siliconflow: { provider: 'siliconflow', healthy: true, latency: 0, lastCheck: Date.now(), errorRate: 0 },
};

let totalRequests = 0;
let successRequests = 0;

export async function processRequest(request: AIRequest): Promise<AIResponse> {
  const startTime = Date.now();
  totalRequests++;

  // Check cache (skip for vision/upscale modes that are typically unique)
  const cacheable = !['vision', 'upscale'].includes(request.mode);
  if (cacheable) {
    const cacheKey = generateCacheKey(request);
    const cached = getCache(cacheKey);
    if (cached) {
      return { ...cached, cached: true, duration: Date.now() - startTime };
    }
  }

  // Get providers for this mode
  const providers = MODE_PROVIDER_MAP[request.mode] || [];
  const enabledProviders = providers.filter(p => PROVIDER_CONFIGS[p]?.enabled && healthStatus[p]?.healthy);

  if (enabledProviders.length === 0) {
    return { success: false, error: 'No available providers for this mode', provider: 'zai' as AIProvider, duration: Date.now() - startTime };
  }

  // Try providers in priority order with circuit breaker
  let lastError: string | undefined;
  for (const providerName of enabledProviders) {
    const config = PROVIDER_CONFIGS[providerName];
    if (!config?.apiKey) continue;

    try {
      const response = await routeRequest(providerName, request, config);
      if (response.success) {
        successRequests++;

        // Cache the response
        if (cacheable) {
          const cacheKey = generateCacheKey(request);
          setCache(cacheKey, response);
        }

        // Log API usage
        logApiUsage(request, providerName, response.duration || 0, true).catch(() => {});

        updateHealth(providerName, true, Date.now() - startTime);
        return { ...response, duration: Date.now() - startTime };
      }
      lastError = response.error;
      updateHealth(providerName, false, Date.now() - startTime);
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      updateHealth(providerName, false, Date.now() - startTime);
    }
  }

  // Log failed request
  logApiUsage(request, enabledProviders[0], Date.now() - startTime, false).catch(() => {});

  return { success: false, error: lastError || 'All providers failed', provider: enabledProviders[0], duration: Date.now() - startTime };
}

async function logApiUsage(request: AIRequest, provider: AIProvider, duration: number, success: boolean) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.apiUsage.create({
      data: {
        userId: request.userId || null,
        provider,
        mode: request.mode,
        duration,
        success,
      },
    });
    await prisma.$disconnect();
  } catch {
    // Silently fail - logging should not break the main flow
  }
}

function updateHealth(provider: AIProvider, success: boolean, latency: number) {
  const health = healthStatus[provider];
  health.lastCheck = Date.now();
  health.latency = latency;
  if (success) {
    health.errorRate = Math.max(0, health.errorRate - 0.1);
    health.healthy = true;
  } else {
    health.errorRate = Math.min(1, health.errorRate + 0.2);
    health.healthy = health.errorRate < 0.6;
  }
}

function generateCacheKey(req: AIRequest): string {
  return `${req.mode}:${req.prompt}:${req.model || ''}:${req.width || ''}:${req.height || ''}`;
}

export function getAIStatus(): AIStatus {
  return {
    providers: Object.values(healthStatus),
    cacheSize: getCacheSize(),
    uptime: process.uptime(),
    totalRequests,
    successRate: totalRequests > 0 ? successRequests / totalRequests : 0,
  };
}

export function getProviderConfigs() { return PROVIDER_CONFIGS; }
export function getModeProviderMap() { return MODE_PROVIDER_MAP; }
