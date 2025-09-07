import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SUPPORTED_LANGUAGES = {
  english: 'en',
  spanish: 'es', 
  french: 'fr',
  turkish: 'tr'
} as const;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'english';

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Validate language
    const languageCode = SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES];
    if (!languageCode) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    console.log('Transcribing audio with OpenAI Whisper API...');
    console.log('Audio file size:', audioFile.size, 'bytes');
    console.log('Language:', language, '(' + languageCode + ')');

    // Convert File to the format expected by OpenAI
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
    
    // Create a File object that OpenAI expects
    const openaiFile = new File([audioBlob], audioFile.name, { type: audioFile.type });

    const response = await openai.audio.transcriptions.create({
      file: openaiFile,
      model: 'whisper-1',
      language: languageCode,
      response_format: 'json',
      temperature: 0.2, // Lower temperature for more accurate transcription
    });

    const transcription = response.text;

    if (!transcription) {
      throw new Error('No transcription received from OpenAI');
    }

    console.log('Audio transcription completed successfully');
    console.log('Transcription length:', transcription.length, 'characters');

    return NextResponse.json({ 
      transcription: transcription.trim(),
      language: language,
      languageCode: languageCode
    });

  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('file size')) {
      return NextResponse.json({ 
        error: 'Audio file is too large. Please use a file smaller than 25MB.' 
      }, { status: 400 });
    } else if (error.message?.includes('format')) {
      return NextResponse.json({ 
        error: 'Unsupported audio format. Please use MP3, MP4, MPEG, MPGA, M4A, WAV, or WEBM.' 
      }, { status: 400 });
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return NextResponse.json({ 
        error: 'API quota exceeded. Please try again later.' 
      }, { status: 429 });
    } else {
      return NextResponse.json({ 
        error: 'Failed to transcribe audio. Please try again.' 
      }, { status: 500 });
    }
  }
}
