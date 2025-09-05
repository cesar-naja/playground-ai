'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FirebaseUser, mapFirebaseUser } from '@/lib/firebase-auth';
import { getUserProfile, createUserProfile, UserProfile } from '@/lib/firebase-firestore';

interface FirebaseContextType {
  // Authentication
  user: FirebaseUser | null;
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  
  // Methods
  refreshUserProfile: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    if (firebaseUser) {
      try {
        let profile = await getUserProfile(firebaseUser.uid);
        
        // Create profile if it doesn't exist
        if (!profile) {
          const newProfile = {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous User',
            photoURL: firebaseUser.photoURL,
            bio: '',
            preferences: {
              theme: 'light' as const,
              notifications: true
            }
          };
          
          await createUserProfile(firebaseUser.uid, newProfile);
          profile = await getUserProfile(firebaseUser.uid);
        }
        
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    } else {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        const mappedUser = mapFirebaseUser(firebaseUser);
        setUser(mappedUser);
        setFirebaseUser(firebaseUser);
        
        // Load or create user profile
        await refreshUserProfile();
      } else {
        setUser(null);
        setFirebaseUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update user profile when firebaseUser changes
  useEffect(() => {
    if (firebaseUser && !loading) {
      refreshUserProfile();
    }
  }, [firebaseUser]);

  const value: FirebaseContextType = {
    user,
    firebaseUser,
    userProfile,
    loading,
    refreshUserProfile
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Custom hooks for specific functionality
export const useAuth = () => {
  const { user, firebaseUser, loading } = useFirebase();
  return { user, firebaseUser, loading, isAuthenticated: !!user };
};

export const useUserProfile = () => {
  const { userProfile, refreshUserProfile, loading } = useFirebase();
  return { userProfile, refreshUserProfile, loading };
};

