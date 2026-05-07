import { AIRequest, AIResponse, AIProviderConfig } from '../types';

export async function siliconflowProvider(request: AIRequest, config: AIProviderConfig): Promise<AIResponse> {
  const startTime = Date.now();
  try {
    if (request.mode === 'chat') {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: request.model || 'Qwen/Qwen2.5-7B-Instruct', messages: [{ role: 'user', content: request.prompt }] }),
      });
      if (!response.ok) throw new Error(`SiliconFlow API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: { text: data.choices[0]?.message?.content, provider: 'siliconflow', model: request.model }, provider: 'siliconflow', duration: Date.now() - startTime };
    }
    if (request.mode === 'image') {
      const response = await fetch(`${config.baseUrl}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: request.model || 'stabilityai/stable-diffusion-xl-base-1.0', prompt: request.prompt, image_size: `${request.width || 1024}x${request.height || 1024}` }),
      });
      if (!response.ok) throw new Error(`SiliconFlow API error: ${response.status}`);
      const data = await response.json();
      return { success: true, data: { url: data.images?.[0]?.url, provider: 'siliconflow', model: request.model }, provider: 'siliconflow', duration: Date.now() - startTime };
    }
    return { success: false, error: `Mode ${request.mode} not supported`, provider: 'siliconflow', duration: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'SiliconFlow error', provider: 'siliconflow', duration: Date.now() - startTime };
  }
}
