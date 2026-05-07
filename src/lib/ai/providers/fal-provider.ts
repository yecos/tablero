import { AIRequest, AIResponse, AIProviderConfig } from '../types';

export async function falProvider(request: AIRequest, config: AIProviderConfig): Promise<AIResponse> {
  const startTime = Date.now();
  try {
    const modelMap: Record<string, string> = {
      image: 'fal-ai/flux/schnell', video: 'fal-ai/minimax/video-01-live',
      upscale: 'fal-ai/clarity-upscaler', 'image-to-3d': 'fal-ai/hunyuan3d',
    };
    const model = request.model || modelMap[request.mode] || 'fal-ai/flux/schnell';
    const response = await fetch(`${config.baseUrl || 'https://fal.run'}/${model}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Key ${config.apiKey}` },
      body: JSON.stringify({
        prompt: request.prompt, negative_prompt: request.negativePrompt,
        image_size: request.width && request.height ? `${request.width}x${request.height}` : undefined,
        image_url: request.image, num_inference_steps: request.steps, guidance_scale: request.cfgScale,
      }),
    });
    if (!response.ok) throw new Error(`fal.ai API error: ${response.status}`);
    const data = await response.json();
    return {
      success: true,
      data: { url: data.image?.url || data.video?.url || data.images?.[0]?.url, provider: 'fal', model },
      provider: 'fal', duration: Date.now() - startTime,
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'fal.ai error', provider: 'fal', duration: Date.now() - startTime };
  }
}
