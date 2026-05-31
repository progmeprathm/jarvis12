import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export async function POST(request: NextRequest) {
  let tempAudioPath: string | null = null;
  let tempOutputPath: string | null = null;

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Create temp files
    const tempDir = path.join('/tmp', 'jarvis-audio');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    tempAudioPath = path.join(tempDir, `audio-${Date.now()}.wav`);
    tempOutputPath = path.join(tempDir, `output-${Date.now()}.txt`);

    // Save uploaded audio
    const buffer = await audioFile.arrayBuffer();
    fs.writeFileSync(tempAudioPath, Buffer.from(buffer));

    // Run Whisper (make sure it's installed: pip install openai-whisper)
    const whisperModel = process.env.WHISPER_MODEL || 'base';
    const command = `whisper "${tempAudioPath}" --model ${whisperModel} --output_format txt --output_dir "${tempDir}" --task transcribe`;

    try {
      await execAsync(command);
    } catch (error: any) {
      console.error('Whisper error:', error);
      return NextResponse.json(
        { error: 'Whisper not installed. Install with: pip install openai-whisper' },
        { status: 500 }
      );
    }

    // Read transcription result
    const baseName = path.basename(tempAudioPath, '.wav');
    const transcriptPath = path.join(tempDir, `${baseName}.txt`);

    if (!fs.existsSync(transcriptPath)) {
      return NextResponse.json(
        { error: 'Transcription failed' },
        { status: 500 }
      );
    }

    const transcript = fs.readFileSync(transcriptPath, 'utf-8').trim();

    // Cleanup
    if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
    if (fs.existsSync(transcriptPath)) fs.unlinkSync(transcriptPath);

    return NextResponse.json({ text: transcript });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Cleanup temp files
    if (tempAudioPath && fs.existsSync(tempAudioPath)) {
      try {
        fs.unlinkSync(tempAudioPath);
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }
  }
}
