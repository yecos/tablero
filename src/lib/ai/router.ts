import { AIRequest, AIResponse, AIProvider, AIProviderConfig } from './types';
import { zaiProvider } from './providers/zai-provider';
import { runwareProvider } from './providers/runware-provider';
import { falProvider } from './providers/fal-provider';
import { siliconflowProvider } from './providers/siliconflow-provider';

const PROVIDERS: Record<AIProvider, (req: AIRequest, config: AIProviderConfig) => Promise<AIResponse>> = {
  zai: zaiProvider,
  runware: runwareProvider,
  fal: falProvider,
  siliconflow: siliconflowProvider,
};

export async function routeRequest(provider: AIProvider, request: AIRequest, config: AIProviderConfig): Promise<AIResponse> {
  const handler = PROVIDERS[provider];
  if (!handler) return { success: false, error: `Unknown provider: ${provider}`, provider, duration: 0 };
  return handler(request, config);
}
