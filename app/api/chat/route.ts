import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { userMessage, image } = await request.json();

    if (!userMessage && !image) {
      return NextResponse.json(
        { error: 'No user message or image provided' },
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

    // Construct the user message content.
    // Llama 4 Scout supports standard OpenAI vision payload formats.
    let userContent: any = userMessage || '';
    if (image) {
      userContent = [
        {
          type: 'text',
          text: userMessage || 'Describe this image and answer my query.',
        },
        {
          type: 'image_url',
          image_url: {
            url: image,
          },
        },
      ];
    }

    // Call Groq API (using the multimodal Llama 4 Scout model)
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userContent,
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
