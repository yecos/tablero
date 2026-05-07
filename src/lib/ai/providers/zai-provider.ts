import { AIRequest, AIResponse, AIProviderConfig } from '../types';
import ZAI from 'z-ai-web-dev-sdk';

export async function zaiProvider(request: AIRequest, config: AIProviderConfig): Promise<AIResponse> {
  const startTime = Date.now();
  try {
    const zai = await ZAI.create();
    
    if (request.mode === 'chat') {
      const completion = await zai.chat.completions.create({
        messages: [{ role: 'user', content: request.prompt }],
      });
      return {
        success: true,
        data: { text: completion.choices[0]?.message?.content || '', provider: 'zai', model: 'zai-chat' },
        provider: 'zai', duration: Date.now() - startTime,
      };
    }

    if (request.mode === 'image' || request.mode === 'brand-kit') {
      const response = await zai.images.generations.create({
        prompt: request.prompt,
        size: request.width && request.height ? `${request.width}x${request.height}` as any : '1024x1024',
      });
      return {
        success: true,
        data: { url: response.data[0]?.url, provider: 'zai', model: 'zai-image' },
        provider: 'zai', duration: Date.now() - startTime,
      };
    }

    if (request.mode === 'audio') {
      const completion = await zai.chat.completions.create({
        messages: [{ role: 'system', content: 'Generate audio content description.' }, { role: 'user', content: request.prompt }],
      });
      return {
        success: true,
        data: { text: completion.choices[0]?.message?.content || '', provider: 'zai', model: 'zai-audio' },
        provider: 'zai', duration: Date.now() - startTime,
      };
    }

    return { success: false, error: `Mode ${request.mode} not supported by ZAI`, provider: 'zai', duration: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'ZAI error', provider: 'zai', duration: Date.now() - startTime };
  }
}
