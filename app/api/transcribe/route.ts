import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      return NextResponse.json(
        { error: 'Deepgram API key not configured' },
        { status: 500 }
      );
    }

    const audioBuffer = await audioFile.arrayBuffer();

    const deepgramResponse = await fetch(
      'https://api.deepgram.com/v1/listen',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${deepgramApiKey}`,
          'Content-Type': 'audio/wav',
        },
        body: audioBuffer,
      }
    );

    if (!deepgramResponse.ok) {
      console.error('Deepgram error:', await deepgramResponse.text());
      return NextResponse.json(
        { error: 'Transcription failed' },
        { status: 500 }
      );
    }

    const deepgramData: any = await deepgramResponse.json();
    const transcript =
      deepgramData.results?.channels[0]?.alternatives[0]?.transcript || '';

    return NextResponse.json({ text: transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
