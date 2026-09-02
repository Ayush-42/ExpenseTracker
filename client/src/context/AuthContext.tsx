import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../firebase/config';
import { clearGreetingSession } from '../utils/greeting';

// Define User type based on what onAuthStateChanged provides
// The callback receives User | null from firebase/auth
type FirebaseUser = Awaited<ReturnType<typeof signInWithPopup>>['user'] | null;

interface AuthContextType {
  currentUser: FirebaseUser;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Provide helpful error messages
      if (error?.code === 'auth/configuration-not-found') {
        const helpfulError = new Error(
          'Firebase Authentication is not configured. Please:\n' +
          '1. Enable Authentication in Firebase Console: https://console.firebase.google.com/project/expense-tracker-58331/authentication\n' +
          '2. Enable Identity Toolkit API: https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=expense-tracker-58331\n' +
          '3. Check API key restrictions in Google Cloud Console'
        );
        helpfulError.name = error.name;
        throw helpfulError;
      }
      
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      await signInWithPopup(auth, appleProvider);
    } catch (error) {
      console.error('Error signing in with Apple:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (auth.currentUser) {
        clearGreetingSession(auth.currentUser.uid);
      }
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setLoading(false);
      },
      (error: any) => {
        console.error('Firebase Auth initialization error:', error);
        if (error?.code === 'auth/configuration-not-found') {
          console.error(
            '⚠️ Firebase Authentication Configuration Error!\n' +
            'Please enable Authentication in Firebase Console:\n' +
            'https://console.firebase.google.com/project/expense-tracker-58331/authentication\n\n' +
            'And enable Identity Toolkit API:\n' +
            'https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=expense-tracker-58331'
          );
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

