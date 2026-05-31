import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { text, speed } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const googleTtsKey = process.env.GOOGLE_TTS_API_KEY;
    if (!googleTtsKey) {
      return NextResponse.json(
        { error: 'Google Cloud Text-to-Speech API key not configured' },
        { status: 500 }
      );
    }

    // Call Google Cloud Text-to-Speech API
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsKey}`,
      {
        input: {
          text: text,
        },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Neural2-A',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speed || 1.0,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const audioContent = response.data.audioContent;
    if (!audioContent) {
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(audioContent, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Synthesis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
