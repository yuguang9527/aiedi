import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export const runtime = 'edge';

const PROMPTS: Record<string, (text: string) => string> = {
    'Expand': (text) => `You are a world-class author. Your task is to expand upon the following text, making it more detailed, rich, and eloquent. It is crucial to maintain the original language and the core meaning of the text.
    
    Original text:
    "${text}"
    
    Expanded text:`,
    'Continue Writing': (text) => `You are a creative writer. Continue the story or argument from the following text, ensuring a natural and compelling progression. Maintain the original language and style.
    
    Original text:
    "${text}"
    
    Continued text:`,
    'Summarize': (text) => `You are a skilled analyst. Summarize the following text into a concise paragraph, capturing the main points and key takeaways. Please respond in the same language as the original text.
    
    Original text:
    "${text}"
    
    Summary:`,
    'Translate to English': (text) => `Translate the following Chinese text into fluent, idiomatic English.
    
    Chinese text:
    "${text}"
    
    English translation:`,
};

export async function POST(request: Request) {
  try {
    const { action, text, customPrompt } = await request.json();

    if (!action) {
      return new Response('Action is required', { status: 400 });
    }
    
    let systemPrompt: string;
    
    if (action === 'Custom Prompt...') {
        if (!customPrompt) {
            return new Response('Custom prompt is required for this action', { status: 400 });
        }
        systemPrompt = `You are a world-class AI writing assistant. The user has provided a piece of text (which might be empty) and a custom instruction. Execute the instruction precisely. Maintain the original language of the text unless the instruction specifies otherwise.

        Text:
        "${text}"

        Instruction:
        "${customPrompt}"

        Result:`;
    } else {
        const promptGenerator = PROMPTS[action];
        if (!promptGenerator) {
          return new Response(`Unsupported action: ${action}`, { status: 400 });
        }
        systemPrompt = promptGenerator(text);
    }

    const result = await streamText({
        model: anthropic('claude-3-opus-20240229'),
        prompt: systemPrompt,
    });
    
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('API route error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(`Failed to process AI request: ${errorMessage}`, { status: 500 });
  }
} 