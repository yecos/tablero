export type AIProvider = 'zai' | 'runware' | 'fal' | 'siliconflow';
export type AIMode = 'chat' | 'image' | 'video' | 'audio' | 'upscale' | 'image-to-3d' | 'brand-kit' | 'vision';

export interface AIProviderConfig {
  name: AIProvider;
  apiKey: string;
  baseUrl?: string;
  priority: number;
  enabled: boolean;
  rateLimit?: { rpm: number; current: number; resetAt: number };
  circuitBreaker?: { failures: number; lastFailure: number; state: 'closed' | 'open' | 'half-open' };
}

export interface AIRequest {
  mode: AIMode;
  prompt: string;
  negativePrompt?: string;
  model?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  batchSize?: number;
  image?: string;
  images?: string[];
  userId?: string;
  spaceId?: string;
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  success: boolean;
  data?: {
    url?: string; urls?: string[]; text?: string;
    duration?: number; model?: string;
    provider: AIProvider; metadata?: Record<string, unknown>;
    audioMetadata?: {
      title: string;
      description: string;
      genre: string;
      mood: string;
      tempo?: string;
      duration?: string | number;
      instruments?: string[];
      suggestedPrompt: string;
    };
  };
  error?: string;
  cached?: boolean;
  provider: AIProvider;
  duration: number;
}

export interface CacheEntry {
  key: string; response: AIResponse;
  createdAt: number; expiresAt: number; hits: number;
}

export interface ProviderHealth {
  provider: AIProvider; healthy: boolean;
  latency: number; lastCheck: number; errorRate: number;
}

export interface AIStatus {
  providers: ProviderHealth[];
  cacheSize: number; uptime: number;
  totalRequests: number; successRate: number;
}
