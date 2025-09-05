import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  UploadTask,
  UploadTaskSnapshot,
  StorageReference
} from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'paused' | 'running' | 'success' | 'canceled' | 'error';
}

export interface FileMetadata {
  name: string;
  fullPath: string;
  size: number;
  contentType?: string;
  downloadURL: string;
  timeCreated: string;
  updated: string;
  customMetadata?: { [key: string]: string };
}

// Upload file with progress tracking
export const uploadFileWithProgress = (
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void,
  customMetadata?: { [key: string]: string }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      customMetadata
    });

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress: UploadProgress = {
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          state: snapshot.state as any
        };
        
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// Simple file upload (without progress tracking)
export const uploadFile = async (
  file: File,
  path: string,
  customMetadata?: { [key: string]: string }
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, {
      customMetadata
    });
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Upload from URL or blob
export const uploadFromBlob = async (
  blob: Blob,
  path: string,
  customMetadata?: { [key: string]: string }
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, blob, {
      customMetadata
    });
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading blob:', error);
    throw error;
  }
};

// Get download URL for existing file
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get file metadata
export const getFileMetadata = async (path: string): Promise<FileMetadata> => {
  try {
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      name: metadata.name,
      fullPath: metadata.fullPath,
      size: metadata.size,
      contentType: metadata.contentType,
      downloadURL,
      timeCreated: metadata.timeCreated,
      updated: metadata.updated,
      customMetadata: metadata.customMetadata
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};

// Update file metadata
export const updateFileMetadata = async (
  path: string,
  metadata: { [key: string]: string }
): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await updateMetadata(storageRef, {
      customMetadata: metadata
    });
  } catch (error) {
    console.error('Error updating file metadata:', error);
    throw error;
  }
};

// List files in a directory
export const listFiles = async (path: string): Promise<FileMetadata[]> => {
  try {
    const storageRef = ref(storage, path);
    const listResult = await listAll(storageRef);
    
    const files: FileMetadata[] = [];
    
    for (const itemRef of listResult.items) {
      try {
        const metadata = await getMetadata(itemRef);
        const downloadURL = await getDownloadURL(itemRef);
        
        files.push({
          name: metadata.name,
          fullPath: metadata.fullPath,
          size: metadata.size,
          contentType: metadata.contentType,
          downloadURL,
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          customMetadata: metadata.customMetadata
        });
      } catch (error) {
        console.error('Error getting metadata for file:', itemRef.fullPath, error);
      }
    }
    
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Helper functions for common use cases

// Upload user profile picture
export const uploadProfilePicture = async (
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const path = `users/${userId}/profile-picture.${file.name.split('.').pop()}`;
  return uploadFileWithProgress(file, path, onProgress, {
    userId,
    type: 'profile-picture'
  });
};

// Upload user document/file
export const uploadUserFile = async (
  userId: string,
  file: File,
  category: string = 'documents',
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const timestamp = Date.now();
  const path = `users/${userId}/${category}/${timestamp}-${file.name}`;
  return uploadFileWithProgress(file, path, onProgress, {
    userId,
    category,
    originalName: file.name,
    uploadedAt: new Date().toISOString()
  });
};

// Get user files
export const getUserFiles = async (
  userId: string,
  category: string = 'documents'
): Promise<FileMetadata[]> => {
  const path = `users/${userId}/${category}`;
  return listFiles(path);
};

// Delete user file
export const deleteUserFile = async (
  userId: string,
  fileName: string,
  category: string = 'documents'
): Promise<void> => {
  const path = `users/${userId}/${category}/${fileName}`;
  return deleteFile(path);
};

// Utility to generate unique file path
export const generateUniqueFilePath = (
  userId: string,
  fileName: string,
  category: string = 'uploads'
): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2);
  const extension = fileName.split('.').pop();
  return `users/${userId}/${category}/${timestamp}-${randomId}.${extension}`;
};

