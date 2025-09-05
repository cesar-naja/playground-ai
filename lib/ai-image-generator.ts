import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export type ImageSize = '1024x1024' | '1792x1024' | '1024x1792';
export type ImageStyle = 'vivid' | 'natural';
export type ImageQuality = 'standard' | 'hd';

export interface ImageGenerationRequest {
  prompt: string;
  size: ImageSize;
  style: ImageStyle;
  quality: ImageQuality;
  n: number;
}

export interface GeneratedImage {
  url: string;
  revised_prompt?: string;
}

export interface ImageGenerationResponse {
  images: GeneratedImage[];
  request: ImageGenerationRequest;
  timestamp: Date;
}

// Predefined prompt suggestions
export const promptSuggestions = [
  {
    id: 'fantasy-landscape',
    title: 'Fantasy Landscape',
    prompt: 'A mystical fantasy landscape with floating islands, glowing crystals, and ethereal waterfalls under a starry sky',
    category: 'Fantasy',
    icon: '🏔️'
  },
  {
    id: 'cyberpunk-city',
    title: 'Cyberpunk City',
    prompt: 'A neon-lit cyberpunk cityscape at night with flying cars, holographic advertisements, and rain-soaked streets',
    category: 'Sci-Fi',
    icon: '🌃'
  },
  {
    id: 'cute-animal',
    title: 'Cute Animal',
    prompt: 'An adorable baby dragon with iridescent scales, sitting in a field of colorful flowers, digital art style',
    category: 'Animals',
    icon: '🐉'
  },
  {
    id: 'space-exploration',
    title: 'Space Scene',
    prompt: 'An astronaut floating in space near a colorful nebula with distant galaxies and bright stars in the background',
    category: 'Space',
    icon: '🚀'
  },
  {
    id: 'abstract-art',
    title: 'Abstract Art',
    prompt: 'A vibrant abstract composition with flowing geometric shapes, gradient colors, and dynamic movement',
    category: 'Abstract',
    icon: '🎨'
  },
  {
    id: 'nature-scene',
    title: 'Nature Scene',
    prompt: 'A serene forest clearing with sunbeams filtering through ancient trees, moss-covered rocks, and wildflowers',
    category: 'Nature',
    icon: '🌲'
  },
  {
    id: 'portrait-art',
    title: 'Portrait Art',
    prompt: 'A stylized portrait of a person with flowing hair made of galaxies and stars, cosmic art style',
    category: 'Portrait',
    icon: '👤'
  },
  {
    id: 'steampunk',
    title: 'Steampunk',
    prompt: 'A steampunk airship with brass gears, copper pipes, and steam engines flying over a Victorian city',
    category: 'Steampunk',
    icon: '⚙️'
  },
  {
    id: 'underwater',
    title: 'Underwater World',
    prompt: 'An underwater coral reef city with bioluminescent creatures, crystal formations, and ancient ruins',
    category: 'Underwater',
    icon: '🐠'
  },
  {
    id: 'minimalist',
    title: 'Minimalist',
    prompt: 'A minimalist composition with simple geometric shapes, clean lines, and a calming color palette',
    category: 'Minimalist',
    icon: '◻️'
  }
];

// Generate images using DALL-E 3
export const generateImages = async (request: ImageGenerationRequest): Promise<ImageGenerationResponse> => {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: request.prompt,
      size: request.size,
      style: request.style,
      quality: request.quality,
      n: 1, // DALL-E 3 only supports n=1
    });

    const images: GeneratedImage[] = (response.data || []).map(image => ({
      url: image.url || '',
      revised_prompt: image.revised_prompt
    }));

    return {
      images,
      request,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error generating images:', error);
    throw new Error('Failed to generate images. Please try again.');
  }
};

// Convert image URL to blob for saving using our API route
export const urlToBlob = async (url: string): Promise<Blob> => {
  try {
    // Use our API route to convert the image server-side
    const response = await fetch('/api/convert-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API conversion failed:', response.status, errorData);
      throw new Error(errorData.error || 'Failed to convert image');
    }

    const blob = await response.blob();
    
    // Validate that we got a proper image blob
    if (!blob.type.startsWith('image/')) {
      throw new Error('Invalid image format received');
    }

    return blob;
  } catch (error) {
    console.error('Error converting URL to blob:', error);
    throw new Error('Failed to process image for saving. Please try again.');
  }
};

// Generate a unique filename
export const generateImageFilename = (prompt: string, timestamp: Date): string => {
  const cleanPrompt = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);
  
  const dateStr = timestamp.toISOString().split('T')[0];
  const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  return `ai-image-${cleanPrompt}-${dateStr}-${timeStr}.png`;
};

// Image size options with descriptions
export const imageSizeOptions: { value: ImageSize; label: string; description: string }[] = [
  {
    value: '1024x1024',
    label: 'Square (1024×1024)',
    description: 'Perfect for social media posts and avatars'
  },
  {
    value: '1792x1024',
    label: 'Landscape (1792×1024)',
    description: 'Great for wallpapers and banners'
  },
  {
    value: '1024x1792',
    label: 'Portrait (1024×1792)',
    description: 'Ideal for mobile wallpapers and posters'
  }
];

// Style options
export const styleOptions: { value: ImageStyle; label: string; description: string }[] = [
  {
    value: 'vivid',
    label: 'Vivid',
    description: 'More dramatic and artistic interpretation'
  },
  {
    value: 'natural',
    label: 'Natural',
    description: 'More realistic and natural looking'
  }
];

// Quality options
export const qualityOptions: { value: ImageQuality; label: string; description: string }[] = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Good quality, faster generation'
  },
  {
    value: 'hd',
    label: 'HD',
    description: 'Higher quality, more detailed'
  }
];
