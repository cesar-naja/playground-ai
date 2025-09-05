import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side, no NEXT_PUBLIC_ needed
});

export interface MotivationalQuote {
  quote: string;
  author: string;
  theme: string;
}

// Predefined motivational images from Unsplash
const motivationalImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80', // Mountain sunrise
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80', // Ocean waves
  'https://images.unsplash.com/photo-1464822759844-d150baac0b37?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80', // Mountain peak
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80', // Forest path
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80', // Forest sunlight
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80', // Sky clouds
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80', // Desert landscape
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80', // Field horizon
];

export async function GET() {
  try {
    console.log('API Key available:', !!process.env.OPENAI_API_KEY);
    console.log('API Key first 10 chars:', process.env.OPENAI_API_KEY?.substring(0, 10) || 'undefined');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a motivational quote generator. Generate inspiring, uplifting quotes that encourage perseverance, growth, and positivity. The quotes should be original and powerful. Respond with ONLY a JSON object containing 'quote', 'author' (can be 'Anonymous' or a real person), and 'theme' (one word describing the main theme like 'perseverance', 'growth', 'success', etc.)."
        },
        {
          role: "user",
          content: "Generate a motivational quote about keeping going and never giving up."
        }
      ],
      max_tokens: 150,
      temperature: 0.9,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('Original OpenAI response:', response);

    // Clean the response to extract JSON from markdown code blocks
    const cleanResponse = response
      .replace(/```json\s*/, '') // Remove opening ```json
      .replace(/```\s*$/, '')    // Remove closing ```
      .trim();

    console.log('Cleaned response for JSON parsing:', cleanResponse);

    let quoteData: MotivationalQuote;
    try {
      quoteData = JSON.parse(cleanResponse) as MotivationalQuote;
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Failed to parse response:', cleanResponse);
      throw new Error('Invalid JSON response from OpenAI');
    }

    const randomImage = motivationalImages[Math.floor(Math.random() * motivationalImages.length)];

    return NextResponse.json({
      ...quoteData,
      image: randomImage
    });
  } catch (error) {
    console.error('Error generating motivational quote:', error);
    
    // Fallback quotes if API fails
    const fallbackQuotes = [
      {
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        theme: "passion",
        image: motivationalImages[0]
      },
      {
        quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        theme: "perseverance",
        image: motivationalImages[1]
      },
      {
        quote: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        theme: "dreams",
        image: motivationalImages[2]
      },
      {
        quote: "It is during our darkest moments that we must focus to see the light.",
        author: "Aristotle",
        theme: "hope",
        image: motivationalImages[3]
      },
      {
        quote: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt",
        theme: "confidence",
        image: motivationalImages[4]
      }
    ];

    const fallbackQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    return NextResponse.json(fallbackQuote);
  }
}
