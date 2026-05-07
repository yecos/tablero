import { AIRequest, AIResponse, AIProviderConfig } from '../types';

export async function runwareProvider(request: AIRequest, config: AIProviderConfig): Promise<AIResponse> {
  const startTime = Date.now();
  try {
    const response = await fetch(config.baseUrl || 'https://api.runware.ai/v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        image: request.mode === 'upscale' ? { inputImage: request.image, outputType: 'URL' }
          : { positivePrompt: request.prompt, negativePrompt: request.negativePrompt, outputType: 'URL',
              width: request.width || 1024, height: request.height || 1024, steps: request.steps || 30,
              cfgScale: request.cfgScale || 7, seed: request.seed },
      }),
    });
    if (!response.ok) throw new Error(`Runware API error: ${response.status}`);
    const data = await response.json();
    return {
      success: true,
      data: { url: data.imageURL || data?.data?.[0]?.imageURL, provider: 'runware', model: request.model || 'stable-diffusion' },
      provider: 'runware', duration: Date.now() - startTime,
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Runware error', provider: 'runware', duration: Date.now() - startTime };
  }
}
