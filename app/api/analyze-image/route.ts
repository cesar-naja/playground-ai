import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LANGUAGE_PROMPTS = {
  english: "Analyze this image and provide an interesting fun fact about what you see. Keep it engaging and informative, around 2-3 sentences.",
  spanish: "Analiza esta imagen y proporciona un dato curioso e interesante sobre lo que ves. Manténlo atractivo e informativo, alrededor de 2-3 oraciones.",
  turkish: "Bu görüntüyü analiz et ve gördüğün şey hakkında ilginç ve eğlenceli bir gerçek sun. İlgi çekici ve bilgilendirici olsun, yaklaşık 2-3 cümle.",
  russian: "Проанализируй это изображение и предоставь интересный факт о том, что ты видишь. Сделай это увлекательным и информативным, около 2-3 предложений."
};

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, language = 'english' } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const prompt = LANGUAGE_PROMPTS[language as keyof typeof LANGUAGE_PROMPTS] || LANGUAGE_PROMPTS.english;

    console.log('Analyzing image with OpenAI Vision API...');
    console.log('Image URL:', imageUrl);
    console.log('Language:', language);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "low" // Use low detail for faster processing and lower costs
              }
            }
          ]
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const funFact = response.choices[0]?.message?.content;

    if (!funFact) {
      throw new Error('No analysis received from OpenAI');
    }

    console.log('Image analysis completed successfully');

    return NextResponse.json({ 
      funFact: funFact.trim(),
      language 
    });

  } catch (error: any) {
    console.error('Error analyzing image:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      status: error.status
    });
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({ 
        error: 'OpenAI API quota exceeded. Please try again later.' 
      }, { status: 429 });
    } else if (error.code === 'invalid_api_key') {
      return NextResponse.json({ 
        error: 'Invalid OpenAI API key configuration.' 
      }, { status: 401 });
    } else if (error.message?.includes('content_policy_violation')) {
      return NextResponse.json({ 
        error: 'Image content violates OpenAI policy. Cannot analyze this image.' 
      }, { status: 400 });
    } else if (error.message?.includes('model_not_found') || error.message?.includes('model')) {
      return NextResponse.json({ 
        error: 'Vision model temporarily unavailable. Please try again later.' 
      }, { status: 503 });
    } else if (error.message?.includes('rate_limit')) {
      return NextResponse.json({ 
        error: 'Too many requests. Please wait a moment and try again.' 
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: `Analysis failed: ${error.message || 'Unknown error'}. Please try again.` 
    }, { status: 500 });
  }
}
