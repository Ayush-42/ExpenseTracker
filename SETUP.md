# Quick Setup Guide

## Environment Variables Setup

### Client Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

Also add the API URL so the client knows where the backend lives:

```env
VITE_API_URL=http://localhost:4000/api
```

### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your-mongodb-connection-string
```

Port 4000 is used because 3000 is a common default that another dev server
often occupies. If you change it, update `VITE_API_URL` to match.

## Firebase Configuration Steps

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Authentication**
   - In Firebase Console, go to Authentication > Sign-in method
   - Enable "Email/Password" provider (click and toggle "Enable")
   - Enable "Google" provider
   - Enable "Apple" provider (requires Apple Developer account)

3. **Get Configuration**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click web icon (`</>`) to add web app
   - Copy the config values to your `.env` file

4. **Authorized Domains**
   - In Authentication > Settings > Authorized domains
   - Add your domain (localhost is added by default for development)

## Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start the frontend (in a new terminal):**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Access the app:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000

## Troubleshooting

- **Firebase errors**: Make sure all environment variables are set correctly
- **CORS errors**: Check that CLIENT_URL in server `.env` matches your frontend URL
- **Apple Sign-In not working**: Requires Apple Developer account and domain verification

