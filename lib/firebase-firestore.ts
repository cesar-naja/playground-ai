import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Timestamp,
  serverTimestamp,
  WhereFilterOp
} from 'firebase/firestore';
import { db } from './firebase';

// Generic document interface
export interface FirestoreDocument {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  [key: string]: any;
}

// User profile interface
export interface UserProfile extends FirestoreDocument {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Example: Video bookmark interface
export interface VideoBookmark extends FirestoreDocument {
  userId: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  bookmarkedAt: Timestamp;
  notes?: string;
}

// Generic CRUD operations

// Create document
export const createDocument = async <T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

// Create document with custom ID
export const createDocumentWithId = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  try {
    await setDoc(doc(db, collectionName, docId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating document with ID:', error);
    throw error;
  }
};

// Read single document
export const getDocument = async <T extends FirestoreDocument>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as T;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

// Read multiple documents
export const getDocuments = async <T extends FirestoreDocument>(
  collectionName: string,
  conditions?: {
    field: string;
    operator: WhereFilterOp;
    value: any;
  }[],
  orderByField?: string,
  orderDirection: 'asc' | 'desc' = 'desc',
  limitCount?: number
): Promise<T[]> => {
  try {
    let q = collection(db, collectionName);
    
    // Apply where conditions
    if (conditions) {
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value)) as any;
      });
    }
    
    // Apply ordering
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection)) as any;
    }
    
    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount)) as any;
    }
    
    const querySnapshot = await getDocs(q as any);
    const documents: T[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      documents.push({
        id: doc.id,
        ...(data as Record<string, any>)
      } as T);
    });
    
    return documents;
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

// Update document
export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  updates: Partial<Omit<T, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

// Delete document
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Real-time listener
export const subscribeToDocument = <T extends FirestoreDocument>(
  collectionName: string,
  docId: string,
  callback: (doc: T | null) => void
): (() => void) => {
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(docRef, (doc: any) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        id: doc.id,
        ...(data as Record<string, any>)
      } as T);
    } else {
      callback(null);
    }
  });
};

// Real-time listener for collection
export const subscribeToCollection = <T extends FirestoreDocument>(
  collectionName: string,
  callback: (docs: T[]) => void,
  conditions?: {
    field: string;
    operator: WhereFilterOp;
    value: any;
  }[]
): (() => void) => {
  let q = collection(db, collectionName);
  
  if (conditions) {
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value)) as any;
    });
  }
  
  return onSnapshot(q as any, (querySnapshot: any) => {
    const documents: T[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      documents.push({
        id: doc.id,
        ...(data as Record<string, any>)
      } as T);
    });
    callback(documents);
  });
};

// Specific functions for user profiles
export const createUserProfile = async (
  uid: string,
  profileData: Omit<UserProfile, 'id' | 'uid' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  return createDocumentWithId('users', uid, { uid, ...profileData });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  return getDocument<UserProfile>('users', uid);
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<Omit<UserProfile, 'id' | 'uid' | 'createdAt'>>
): Promise<void> => {
  return updateDocument<UserProfile>('users', uid, updates);
};

// Specific functions for video bookmarks
export const bookmarkVideo = async (
  bookmarkData: Omit<VideoBookmark, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  return createDocument<VideoBookmark>('bookmarks', bookmarkData);
};

export const getUserBookmarks = async (userId: string): Promise<VideoBookmark[]> => {
  return getDocuments<VideoBookmark>(
    'bookmarks',
    [{ field: 'userId', operator: '==', value: userId }],
    'bookmarkedAt',
    'desc'
  );
};

export const removeBookmark = async (bookmarkId: string): Promise<void> => {
  return deleteDocument('bookmarks', bookmarkId);
};

