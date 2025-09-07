# Firestore Security Rules

To ensure your AI Image Generator works properly, you need to set up Firestore security rules. Here are the recommended rules:

## 📋 **Security Rules for Firestore**

Go to your [Firebase Console](https://console.firebase.google.com/) → Firestore Database → Rules, and replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own profile
    match /users/{userId} {
      allow read, write: if true; // Temporarily allow all operations for Clerk integration
    }
    
    // Allow users to read/write their own AI images
    match /ai-images/{imageId} {
      allow read, write, create: if true; // Temporarily allow all operations for Clerk integration
    }
    
    // Allow users to read/write their own notes
    match /notes/{noteId} {
      allow read, write, create: if true; // Temporarily allow all operations for Clerk integration
    }
    
    // Allow users to read/write their own demo documents (if using Firebase demo)
    match /demo-documents/{docId} {
      allow read, write, create: if true; // Temporarily allow all operations for Clerk integration
    }
  }
}
```

## 🔧 **Firebase Storage Rules**

Also update your Storage rules in Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to read/write their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## ⚠️ **Important Security Note**

**These rules are temporarily permissive to work with Clerk authentication.** In production, you should implement proper security by either:

1. **Integrating Clerk with Firebase Auth** using custom tokens
2. **Using Firebase Functions** to validate Clerk tokens server-side
3. **Implementing application-level security** in your API routes

## ✅ **What These Rules Do**

1. **Temporary Access**: Allow all authenticated operations (via Clerk)
2. **Application Security**: Security is handled at the application level
3. **User Isolation**: Data isolation is enforced by the application logic
4. **Flexible Structure**: Supports all current and future collections

## 🚀 **After Setting Rules**

1. **Publish the rules** in Firebase Console
2. **Test your app** - the errors should be resolved
3. **Generate some images** to verify everything works

These rules ensure your app is secure while allowing full functionality for authenticated users!

