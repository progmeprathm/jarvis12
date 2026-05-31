import { NextRequest, NextResponse } from 'next/server';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationContext } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: 'No user message provided' },
        { status: 400 }
      );
    }

    const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama2';
    const systemPrompt = process.env.JARVIS_SYSTEM_PROMPT || 
      'You are Jarvis, a witty and helpful AI assistant. Keep your answers to 1-2 short sentences.';

    // Prepare messages for Ollama
    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Call Ollama API
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        messages: messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Ollama error:', error);
      return NextResponse.json(
        { error: `Ollama API error: Make sure Ollama is running on ${ollamaUrl}` },
        { status: 500 }
      );
    }

    const data: any = await response.json();
    const jarvisResponse = data.message?.content || 'I apologize, but I could not generate a response.';

    return NextResponse.json({ response: jarvisResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response. Make sure Ollama is running.' },
      { status: 500 }
    );
  }
}
