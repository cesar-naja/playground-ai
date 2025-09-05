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
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read/write their own AI images
    match /ai-images/{imageId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Allow users to read/write their own demo documents (if using Firebase demo)
    match /demo-documents/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
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

## ✅ **What These Rules Do**

1. **User Isolation**: Each user can only access their own data
2. **Authentication Required**: All operations require valid authentication
3. **Secure File Storage**: Users can only access files in their own folder
4. **Flexible Structure**: Supports all current and future collections

## 🚀 **After Setting Rules**

1. **Publish the rules** in Firebase Console
2. **Test your app** - the errors should be resolved
3. **Generate some images** to verify everything works

These rules ensure your app is secure while allowing full functionality for authenticated users!

