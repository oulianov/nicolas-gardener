import Anthropic from '@anthropic-ai/sdk';
import { Stream } from '@anthropic-ai/sdk/streaming';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function* generateNicolasResponse(messages: Array<{ role: string; content: string }>) {
  const stream = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240229",
    max_tokens: 1024,
    messages: messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    stream: true,
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text;
    }
  }
}

export async function sendMessageToNicolas(userMessage: string, chatHistory: Array<{ role: string; content: string }>) {
  const updatedChatHistory = [
    ...chatHistory,
    { role: 'user', content: userMessage }
  ];

  return generateNicolasResponse(updatedChatHistory);
}
