import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { userMessage } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: 'No user message provided' },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = process.env.JARVIS_SYSTEM_PROMPT || 
      'You are Jarvis, a witty and helpful AI assistant. Keep your answers to 1-2 short sentences.';

    // Call Groq API (Free tier available)
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768', // Free model
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
      },
      {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const jarvisResponse = response.data.choices[0]?.message?.content || 
      'I apologize, but I could not generate a response.';

    return NextResponse.json({ response: jarvisResponse });
  } catch (error: any) {
    console.error('Chat error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
