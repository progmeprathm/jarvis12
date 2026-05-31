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

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'Adam';

    // First, get available voices to find the voice ID
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
    });

    let selectedVoiceId = voiceId;
    if (voicesResponse.ok) {
      const voicesData: any = await voicesResponse.json();
      const voice = voicesData.voices?.find(
        (v: any) => v.name === voiceId || v.voice_id === voiceId
      );
      if (voice) {
        selectedVoiceId = voice.voice_id;
      }
    }

    // Generate speech
    const synthesizeResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!synthesizeResponse.ok) {
      const errorText = await synthesizeResponse.text();
      console.error('ElevenLabs error:', errorText);
      return NextResponse.json(
        { error: 'Speech synthesis failed' },
        { status: 500 }
      );
    }

    const audioBuffer = await synthesizeResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Synthesis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
