# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard

## Step 2: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you don't have a web app yet:
   - Click the **web icon** (`</>`)
   - Register your app with a nickname (e.g., "Expense Tracker")
   - Click **"Register app"**
5. Copy the `firebaseConfig` object values

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 3: Create .env File

1. In the `client` directory, create a file named `.env`
2. Copy the template from `.env.example` or create it with these variables:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Important:** Replace the placeholder values with your actual Firebase config values!

## Step 4: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password** - Click it, toggle "Enable", and save
   - **Google** - Click it, toggle "Enable", and save
   - **Apple** (optional) - Click it, toggle "Enable", and save (requires Apple Developer account)

## Step 5: Restart Your Dev Server

After creating the `.env` file:
1. Stop your current dev server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```

The warning message should disappear once your `.env` file is properly configured!

## Quick Command to Create .env

You can copy the example file:
```bash
cd client
cp .env.example .env
```

Then edit `.env` with your actual Firebase values.

