# Enable Firestore Database

To use the expense tracking features, you need to enable Firestore in your Firebase project.

## Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your Firebase project
3. Click on **"Firestore Database"** in the left menu
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select a location (choose the closest to you)
7. Click **"Enable"**

## Security Rules (for production):

After enabling, update the security rules in Firestore to:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

This ensures users can only access their own expenses.

## That's it!

Once Firestore is enabled, your expense tracking features will work automatically!

