import { Timestamp } from 'firebase/firestore';
import { 
  createDocument, 
  getDocuments, 
  updateDocument, 
  deleteDocument,
  subscribeToCollection 
} from './firebase-firestore';
import { 
  uploadFromBlob, 
  deleteFile
} from './firebase-storage';
import { 
  urlToBlob, 
  generateImageFilename,
  ImageSize,
  ImageStyle,
  ImageQuality 
} from './ai-image-generator';

// Utility function to clean data for Firestore (removes undefined values)
const cleanDataForFirestore = (data: any): any => {
  const cleaned: any = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Recursively clean nested objects
        const cleanedNested = cleanDataForFirestore(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else if (Array.isArray(value)) {
        // Clean arrays by filtering out undefined/null values
        const cleanedArray = value.filter(item => item !== undefined && item !== null);
        if (cleanedArray.length > 0) {
          cleaned[key] = cleanedArray;
        }
      } else if (typeof value === 'string' && value.trim() === '') {
        // Skip empty strings if needed (optional)
        // cleaned[key] = value;
      } else {
        cleaned[key] = value;
      }
    }
  });
  
  return cleaned;
};

// Interface for saved images in Firestore
export interface SavedImage {
  id: string;
  userId: string;
  prompt: string;
  revisedPrompt?: string; // Optional - only present if provided by AI
  imageUrl: string;
  storageUrl: string;
  storagePath: string;
  filename: string;
  size: ImageSize;
  style: ImageStyle;
  quality: ImageQuality;
  category?: string; // Optional - defaults to 'generated'
  tags?: string[]; // Optional - extracted from prompt
  isFavorite: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Save generated image to Firebase Storage and Firestore
export const saveGeneratedImage = async (
  userId: string,
  imageUrl: string,
  prompt: string,
  revisedPrompt: string | undefined,
  size: ImageSize,
  style: ImageStyle,
  quality: ImageQuality,
  category?: string
): Promise<string> => {
  try {
    console.log('Starting image save process for user:', userId);
    console.log('Image URL:', imageUrl);
    
    // Convert image URL to blob using our API route
    console.log('Converting image URL to blob...');
    const imageBlob = await urlToBlob(imageUrl);
    console.log('Image blob created successfully, size:', imageBlob.size, 'type:', imageBlob.type);
    
    // Generate unique filename and path
    const filename = generateImageFilename(prompt, new Date());
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const storagePath = `users/${userId}/ai-images/${timestamp}-${randomId}-${filename}`;
    
    console.log('Uploading to Firebase Storage at path:', storagePath);
    
    // Upload to Firebase Storage
    const storageUrl = await uploadFromBlob(imageBlob, storagePath, {
      userId,
      prompt: prompt.substring(0, 100), // Limit prompt length for metadata
      size,
      style,
      quality,
      category: category || 'generated',
      uploadedAt: new Date().toISOString()
    });
    
    console.log('Image uploaded successfully to:', storageUrl);

    // Prepare metadata for Firestore
    const rawImageData = {
      userId,
      prompt,
      revisedPrompt, // This might be undefined
      imageUrl, // Original OpenAI URL (may expire)
      storageUrl, // Firebase Storage URL (permanent)
      storagePath,
      filename,
      size,
      style,
      quality,
      category: category || 'generated',
      tags: extractTagsFromPrompt(prompt),
      isFavorite: false
    };

    // Clean data to remove undefined values (Firestore requirement)
    const imageData = cleanDataForFirestore(rawImageData);

    console.log('Saving metadata to Firestore...', imageData);
    const documentId = await createDocument<SavedImage>('ai-images', imageData);
    console.log('Image saved successfully with document ID:', documentId);
    
    return documentId;
  } catch (error: any) {
    console.error('Error saving generated image:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('Failed to convert image')) {
      throw new Error('Unable to process the generated image. Please try generating again.');
    } else if (error.message?.includes('storage')) {
      throw new Error('Failed to upload image to storage. Please check your connection and try again.');
    } else if (error.message?.includes('firestore') || error.message?.includes('database')) {
      throw new Error('Failed to save image metadata. Please try again.');
    } else {
      throw new Error('Failed to save image. Please try again or contact support if the issue persists.');
    }
  }
};

// Get user's saved images
export const getUserImages = async (
  userId: string,
  limit?: number,
  category?: string
): Promise<SavedImage[]> => {
  try {
    // Use simpler query to avoid index requirements
    const conditions = [
      { field: 'userId', operator: '==', value: userId }
    ];

    // Get documents without complex ordering to avoid index issues
    const allImages = await getDocuments<SavedImage>(
      'ai-images',
      conditions as any
    );

    // Filter by category if specified
    let filteredImages = allImages;
    if (category) {
      filteredImages = allImages.filter(img => img.category === category);
    }

    // Sort by creation date (newest first) in JavaScript
    filteredImages.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
      const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
      return dateB - dateA;
    });

    // Apply limit if specified
    if (limit) {
      filteredImages = filteredImages.slice(0, limit);
    }

    return filteredImages;
  } catch (error) {
    console.error('Error getting user images:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

// Get user's favorite images
export const getUserFavoriteImages = async (userId: string): Promise<SavedImage[]> => {
  try {
    // Get all user images first, then filter for favorites
    const allImages = await getUserImages(userId);
    return allImages.filter(img => img.isFavorite);
  } catch (error) {
    console.error('Error getting favorite images:', error);
    return [];
  }
};

// Toggle favorite status
export const toggleImageFavorite = async (
  imageId: string,
  isFavorite: boolean
): Promise<void> => {
  try {
    await updateDocument<SavedImage>('ai-images', imageId, {
      isFavorite
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new Error('Failed to update favorite status.');
  }
};

// Delete saved image (from both Storage and Firestore)
export const deleteSavedImage = async (image: SavedImage): Promise<void> => {
  try {
    // Delete from Firebase Storage
    await deleteFile(image.storagePath);
    
    // Delete from Firestore
    await deleteDocument('ai-images', image.id);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image.');
  }
};

// Update image metadata
export const updateImageMetadata = async (
  imageId: string,
  updates: Partial<Pick<SavedImage, 'category' | 'tags' | 'prompt'>>
): Promise<void> => {
  try {
    // Clean the updates to remove undefined values
    const cleanedUpdates = cleanDataForFirestore(updates);
    await updateDocument<SavedImage>('ai-images', imageId, cleanedUpdates);
  } catch (error) {
    console.error('Error updating image metadata:', error);
    throw new Error('Failed to update image.');
  }
};

// Subscribe to user's images in real-time
export const subscribeToUserImages = (
  userId: string,
  callback: (images: SavedImage[]) => void
): (() => void) => {
  return subscribeToCollection<SavedImage>(
    'ai-images',
    (allImages) => {
      // Filter and sort images client-side
      const userImages = allImages
        .filter(img => img.userId === userId)
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
          const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
          return dateB - dateA;
        });
      callback(userImages);
    },
    [{ field: 'userId', operator: '==', value: userId }] as any
  );
};

// Get image statistics for user
export const getUserImageStats = async (userId: string) => {
  try {
    const images = await getUserImages(userId);
    
    const stats = {
      totalImages: images.length,
      favoriteImages: images.filter(img => img.isFavorite).length,
      categoryCounts: {} as Record<string, number>,
      sizeCounts: {} as Record<ImageSize, number>,
      styleCounts: {} as Record<ImageStyle, number>,
      recentImages: images.slice(0, 5)
    };

    // Count by category
    images.forEach(img => {
      const category = img.category || 'uncategorized';
      stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
    });

    // Count by size
    images.forEach(img => {
      stats.sizeCounts[img.size] = (stats.sizeCounts[img.size] || 0) + 1;
    });

    // Count by style
    images.forEach(img => {
      stats.styleCounts[img.style] = (stats.styleCounts[img.style] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting image stats:', error);
    return null;
  }
};

// Extract tags from prompt (simple keyword extraction)
const extractTagsFromPrompt = (prompt: string): string[] => {
  // Simple tag extraction - you could make this more sophisticated
  const words = prompt.toLowerCase().split(/\s+/);
  const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  
  return words
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 5); // Limit to 5 tags
};

// Search images by prompt or tags
export const searchUserImages = async (
  userId: string,
  searchTerm: string
): Promise<SavedImage[]> => {
  try {
    const allImages = await getUserImages(userId);
    const searchLower = searchTerm.toLowerCase();
    
    return allImages.filter(image => 
      image.prompt?.toLowerCase().includes(searchLower) ||
      image.revisedPrompt?.toLowerCase().includes(searchLower) ||
      image.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
      image.category?.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching images:', error);
    return [];
  }
};
