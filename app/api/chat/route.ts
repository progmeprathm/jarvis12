import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationContext } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: 'No user message provided' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = process.env.JARVIS_SYSTEM_PROMPT || 
      'You are Jarvis, a witty and helpful AI assistant. Keep your answers to 1-2 short sentences.';

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const jarvisResponse = response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return NextResponse.json({ response: jarvisResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
