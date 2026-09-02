import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { profileAPI } from '../services/api';

interface ProfileContextType {
  /** Picture to show: the uploaded one, otherwise the provider (Google/Apple) photo */
  photoURL: string | null;
  /** Picture the user uploaded in this app, if any */
  customPhoto: string | null;
  /** Photo that came from the sign-in provider, if any */
  providerPhoto: string | null;
  displayName: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  savePhoto: (dataUrl: string) => Promise<void>;
  removePhoto: () => Promise<void>;
  saveDisplayName: (name: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid ?? null;
  const providerPhoto = currentUser?.photoURL ?? null;
  const providerName = currentUser?.displayName ?? '';

  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setCustomPhoto(null);
      setCustomName('');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    profileAPI
      .get(userId)
      .then((profile) => {
        if (!isMounted) return;
        setCustomPhoto(profile.photoData || null);
        setCustomName(profile.displayName || '');
        setError(null);
      })
      .catch((err: any) => {
        // A missing profile should never block the dashboard from rendering
        console.error('Error loading profile:', err);
        if (isMounted) setError(err.message || 'Failed to load profile');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const savePhoto = useCallback(
    async (dataUrl: string) => {
      if (!userId) throw new Error('User not authenticated');
      setSaving(true);
      try {
        const profile = await profileAPI.updatePhoto(userId, dataUrl);
        setCustomPhoto(profile.photoData || null);
        setError(null);
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const removePhoto = useCallback(async () => {
    if (!userId) throw new Error('User not authenticated');
    setSaving(true);
    try {
      await profileAPI.removePhoto(userId);
      setCustomPhoto(null);
      setError(null);
    } finally {
      setSaving(false);
    }
  }, [userId]);

  const saveDisplayName = useCallback(
    async (name: string) => {
      if (!userId) throw new Error('User not authenticated');
      setSaving(true);
      try {
        const profile = await profileAPI.updateDisplayName(userId, name);
        setCustomName(profile.displayName || '');
        setError(null);
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const value = useMemo<ProfileContextType>(
    () => ({
      photoURL: customPhoto || providerPhoto,
      customPhoto,
      providerPhoto,
      displayName: customName || providerName,
      loading,
      saving,
      error,
      savePhoto,
      removePhoto,
      saveDisplayName,
    }),
    [customPhoto, providerPhoto, customName, providerName, loading, saving, error, savePhoto, removePhoto, saveDisplayName]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
