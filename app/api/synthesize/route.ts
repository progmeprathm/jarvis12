import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const coquiUrl = process.env.COQUI_TTS_URL || 'http://localhost:5002';

    // Call Coqui TTS API
    const response = await fetch(`${coquiUrl}/api/tts?text=${encodeURIComponent(text)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Coqui error:', error);
      return NextResponse.json(
        { error: `Coqui TTS API error: Make sure Coqui TTS is running on ${coquiUrl}` },
        { status: 500 }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Synthesis error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Make sure Coqui TTS is running.' },
      { status: 500 }
    );
  }
}
