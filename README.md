# Expense Tracker Web App

A modern, responsive expense tracking web application with Google and Apple authentication support.

## Features

- 🔐 **Authentication**: Sign in/Sign up with Google (Gmail) and Apple (Apple ID)
- 📱 **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- 🎨 **Modern UI**: Beautiful, user-friendly interface with smooth animations
- 🔒 **Protected Routes**: Secure dashboard access with authentication guards

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite (Build tool)
- Firebase Authentication
- React Router
- CSS3 (Responsive design)

### Backend
- Node.js
- Express.js
- CORS enabled

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable **Google** sign-in provider
   - Enable **Apple** sign-in provider (requires Apple Developer account)
4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web icon (`</>`) to add a web app
   - Copy the Firebase configuration object

### 2. Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `client` directory:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

### 3. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory (optional):
   ```bash
   PORT=3000
   CLIENT_URL=http://localhost:5173
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000`

## Project Structure

```
E_Tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (AuthContext)
│   │   ├── firebase/       # Firebase configuration
│   │   ├── pages/          # Page components (Login, Signup, Dashboard)
│   │   ├── App.tsx         # Main app component with routing
│   │   └── main.tsx        # Entry point
│   └── package.json
├── server/                 # Express backend
│   ├── server.js           # Server entry point
│   └── package.json
└── README.md
```

## Available Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server
- `npm start` - Start server with nodemon
- `npm run dev` - Start server with nodemon

## Authentication Flow

1. User visits the app and is redirected to `/login` if not authenticated
2. User can choose to sign in with Google or Apple
3. After successful authentication, user is redirected to `/dashboard`
4. Protected routes require authentication
5. User can sign out from the dashboard

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 641px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1440px

## Environment Variables

### Client (.env)
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

### Server (.env)
- `PORT` - Server port (default: 3000)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:5173)

## Next Steps

- [ ] Add expense tracking functionality
- [ ] Implement expense categories
- [ ] Add data visualization (charts/graphs)
- [ ] Implement expense filtering and search
- [ ] Add export functionality (CSV, PDF)
- [ ] Implement user profile management

## Notes

- Apple Sign-In requires an Apple Developer account and proper domain verification
- Make sure to configure authorized domains in Firebase Console
- For production, update CORS settings in the server

## License

ISC

# ExpenseTracker
