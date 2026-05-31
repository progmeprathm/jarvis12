import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';


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

    const googleSttKey = process.env.GOOGLE_STT_API_KEY;
    if (!googleSttKey) {
      return NextResponse.json(
        { error: 'Google Cloud Speech-to-Text API key not configured' },
        { status: 500 }
      );
    }

    const buffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');

    // Call Google Cloud Speech-to-Text API
    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${googleSttKey}`,
      {
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
        },
        audio: {
          content: base64Audio,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const transcript = response.data.results
      ?.map((result: any) => result.alternatives[0].transcript)
      .join(' ') || '';

    if (!transcript) {
      return NextResponse.json(
        { error: 'Could not transcribe audio' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: transcript });
  } catch (error: any) {
    console.error('Transcription error details:', error.response?.data || error.message || error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
