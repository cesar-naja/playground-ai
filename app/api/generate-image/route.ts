import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only, secure
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, size, style, quality } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
      }, { status: 500 });
    }

    console.log('Generating image with OpenAI DALL-E 3...');
    console.log('Prompt:', prompt);
    console.log('Size:', size);
    console.log('Style:', style);
    console.log('Quality:', quality);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: size || '1024x1024',
      style: style || 'vivid',
      quality: quality || 'standard',
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url;
    const revisedPrompt = response.data?.[0]?.revised_prompt;

    if (!imageUrl) {
      throw new Error('No image URL received from OpenAI');
    }

    console.log('Image generated successfully');

    return NextResponse.json({
      success: true,
      imageUrl,
      revisedPrompt,
      originalPrompt: prompt,
      size,
      style,
      quality
    });

  } catch (error: any) {
    console.error('Error generating image:', error);

    // Handle different types of errors
    if (error.message?.includes('API key')) {
      return NextResponse.json({ 
        error: 'Invalid API key. Please check your OpenAI API key configuration.' 
      }, { status: 401 });
    } else if (error.message?.includes('quota') || error.message?.includes('billing')) {
      return NextResponse.json({ 
        error: 'OpenAI API quota exceeded. Please check your billing and usage.' 
      }, { status: 429 });
    } else if (error.message?.includes('content policy')) {
      return NextResponse.json({ 
        error: 'Content policy violation. Please try a different prompt.' 
      }, { status: 400 });
    } else {
      return NextResponse.json({ 
        error: 'Failed to generate image. Please try again.' 
      }, { status: 500 });
    }
  }
}
