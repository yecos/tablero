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
      // Use chat completions to generate a detailed audio description prompt,
      // then return structured audio metadata for the frontend to process
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an audio production assistant. When the user describes audio they want, respond ONLY with a JSON object in this exact format:
{
  "title": "Short title for the audio",
  "description": "Detailed description of the audio content",
  "genre": "Music genre or audio type (e.g., ambient, electronic, narration, sound_effect)",
  "mood": "Emotional tone (e.g., calm, energetic, dramatic, mysterious)",
  "tempo": "Tempo description (e.g., slow, medium, fast, variable)",
  "duration": "Suggested duration in seconds",
  "instruments": ["list of instruments or sound types"],
  "suggestedPrompt": "An optimized prompt for audio generation"
}
Respond ONLY with valid JSON, no additional text.`
          },
          { role: 'user', content: request.prompt }
        ],
      });

      const content = completion.choices[0]?.message?.content || '';

      // Parse the JSON response
      let audioData;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          audioData = JSON.parse(jsonMatch[0]);
        }
      } catch {
        audioData = null;
      }

      return {
        success: true,
        data: {
          text: content,
          audioMetadata: audioData || {
            title: 'Audio Generation',
            description: request.prompt,
            genre: 'general',
            mood: 'neutral',
            suggestedPrompt: request.prompt,
          },
          provider: 'zai',
          model: 'zai-audio-tts',
        },
        provider: 'zai', duration: Date.now() - startTime,
      };
    }

    if (request.mode === 'vision') {
      // VLM mode - analyze images with text prompts
      const messages: any[] = [];

      if (request.image) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: request.prompt },
            { type: 'image_url', image_url: { url: request.image } }
          ]
        });
      } else {
        messages.push({ role: 'user', content: request.prompt });
      }

      const response = await zai.chat.completions.createVision({
        messages,
        thinking: { type: 'disabled' }
      });

      return {
        success: true,
        data: {
          text: response.choices?.[0]?.message?.content || '',
          provider: 'zai',
          model: 'zai-vision',
        },
        provider: 'zai', duration: Date.now() - startTime,
      };
    }

    return { success: false, error: `Mode ${request.mode} not supported by ZAI`, provider: 'zai', duration: Date.now() - startTime };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'ZAI error', provider: 'zai', duration: Date.now() - startTime };
  }
}
