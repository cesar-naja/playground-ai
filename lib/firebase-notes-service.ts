import { Timestamp, WhereFilterOp } from 'firebase/firestore';
import { createDocument, getDocuments, updateDocument, deleteDocument } from './firebase-firestore';

export interface SavedNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'text' | 'voice';
  language?: string;
  audioUrl?: string; // For voice notes, URL to the audio file in Firebase Storage
  audioPath?: string; // Storage path for the audio file
  tags: string[];
  isFavorite: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Extract tags from note content (simple keyword extraction)
const extractTagsFromContent = (content: string): string[] => {
  // Remove common words and extract meaningful keywords
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'];
  
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10); // Limit to 10 tags
  
  // Remove duplicates and return
  return [...new Set(words)];
};

// Clean data to remove undefined values (Firestore requirement)
const cleanDataForFirestore = (data: any): any => {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Timestamp)) {
        cleaned[key] = cleanDataForFirestore(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
};

// Save note to Firestore
export const saveNote = async (
  userId: string,
  title: string,
  content: string,
  type: 'text' | 'voice',
  language?: string,
  audioUrl?: string,
  audioPath?: string
): Promise<string> => {
  try {
    console.log('Starting note save process for user:', userId);
    console.log('Note type:', type, 'Language:', language);
    
    // Prepare metadata for Firestore
    const rawNoteData = {
      userId,
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      type,
      language,
      audioUrl,
      audioPath,
      tags: extractTagsFromContent(content),
      isFavorite: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    // Clean data to remove undefined values (Firestore requirement)
    const noteData = cleanDataForFirestore(rawNoteData);

    console.log('Saving note to Firestore...', noteData);
    const documentId = await createDocument<SavedNote>('notes', noteData);
    console.log('Note saved successfully with document ID:', documentId);
    
    return documentId;
  } catch (error: any) {
    console.error('Error saving note:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('firestore') || error.message?.includes('database')) {
      throw new Error('Failed to save note metadata. Please try again.');
    } else {
      throw new Error('Failed to save note. Please try again or contact support if the issue persists.');
    }
  }
};

// Get user's saved notes
export const getUserNotes = async (
  userId: string,
  limit?: number,
  type?: 'text' | 'voice'
): Promise<SavedNote[]> => {
  try {
    console.log('Loading notes for user:', userId, 'Type filter:', type, 'Limit:', limit);
    
    // Build query conditions
    const conditions: { field: string; operator: WhereFilterOp; value: any }[] = [
      { field: 'userId', operator: '==', value: userId }
    ];
    
    if (type) {
      conditions.push({ field: 'type', operator: '==', value: type });
    }
    
    const notes = await getDocuments<SavedNote>(
      'notes',
      conditions,
      [{ field: 'createdAt', direction: 'desc' }], // Sort by newest first
      'desc',
      limit
    );
    
    console.log('Loaded notes count:', notes?.length || 0);
    return notes || [];
  } catch (error) {
    console.error('Error loading user notes:', error);
    return [];
  }
};

// Update note
export const updateNote = async (
  noteId: string,
  updates: Partial<Omit<SavedNote, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  try {
    console.log('Updating note:', noteId);
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    // Clean data to remove undefined values
    const cleanedData = cleanDataForFirestore(updateData);
    
    await updateDocument('notes', noteId, cleanedData);
    console.log('Note updated successfully');
  } catch (error) {
    console.error('Error updating note:', error);
    throw new Error('Failed to update note. Please try again.');
  }
};

// Delete note
export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    console.log('Starting note deletion process for note ID:', noteId);
    await deleteDocument('notes', noteId);
    console.log('Note successfully deleted from Firebase Firestore');
  } catch (error: any) {
    console.error('Error deleting note from Firebase:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('permission') || error.message?.includes('insufficient')) {
      throw new Error('Permission denied. Please check your authentication and try again.');
    } else if (error.message?.includes('not-found')) {
      throw new Error('Note not found. It may have already been deleted.');
    } else {
      throw new Error('Failed to delete note from database. Please try again.');
    }
  }
};

// Toggle favorite status
export const toggleNoteFavorite = async (noteId: string, isFavorite: boolean): Promise<void> => {
  try {
    await updateNote(noteId, { isFavorite });
  } catch (error) {
    console.error('Error toggling note favorite:', error);
    throw new Error('Failed to update note favorite status.');
  }
};

// Search notes by content or title
export const searchUserNotes = async (
  userId: string,
  searchQuery: string,
  limit?: number
): Promise<SavedNote[]> => {
  try {
    console.log('Searching notes for user:', userId, 'Query:', searchQuery);
    
    // Get all user notes first (Firestore doesn't support full-text search natively)
    const allNotes = await getUserNotes(userId);
    
    // Filter notes based on search query
    const searchLower = searchQuery.toLowerCase();
    const filteredNotes = allNotes.filter(note => 
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
    
    // Apply limit if specified
    const results = limit ? filteredNotes.slice(0, limit) : filteredNotes;
    
    console.log('Search results count:', results.length);
    return results;
  } catch (error) {
    console.error('Error searching notes:', error);
    return [];
  }
};
