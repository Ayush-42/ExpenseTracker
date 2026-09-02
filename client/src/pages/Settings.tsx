import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useExpenses } from '../context/ExpensesContext';
import Avatar from '../components/Avatar';
import { createSquareThumbnail } from '../utils/image';
import { formatCurrency } from '../utils/format';
import './Settings.css';

const PROVIDER_LABELS: Record<string, string> = {
  'google.com': 'Google',
  'apple.com': 'Apple',
  password: 'Email and password',
};

const Settings = () => {
  const { currentUser, signOut } = useAuth();
  const { photoURL, customPhoto, providerPhoto, displayName, saving, savePhoto, removePhoto, saveDisplayName } =
    useProfile();
  const { expenses } = useExpenses();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nameDraft, setNameDraft] = useState(displayName);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setNameDraft(displayName);
  }, [displayName]);

  const providers = currentUser?.providerData?.map((p) => PROVIDER_LABELS[p.providerId] || p.providerId) ?? [];
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setStatus(null);
    try {
      const thumbnail = await createSquareThumbnail(file);
      await savePhoto(thumbnail);
      setStatus({ type: 'success', message: 'Profile picture updated.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Could not update your picture.' });
    }
  };

  const handleRemovePhoto = async () => {
    setStatus(null);
    try {
      await removePhoto();
      setStatus({
        type: 'success',
        message: providerPhoto
          ? 'Removed. Your sign-in photo is being used again.'
          : 'Profile picture removed.',
      });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Could not remove your picture.' });
    }
  };

  const handleNameSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    try {
      await saveDisplayName(nameDraft);
      setStatus({ type: 'success', message: 'Display name saved.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Could not save your name.' });
    }
  };

  return (
    <div className="settings-page">
      <div className="page-section">
        <h2 className="page-section-title">Profile</h2>
        <p className="page-section-subtitle">
          Your picture comes from your sign-in account, and you can replace it with your own upload.
        </p>

        {status && <div className={`settings-status settings-status-${status.type}`}>{status.message}</div>}

        <div className="settings-profile">
          <div className="settings-avatar-block">
            <Avatar
              src={photoURL}
              name={displayName}
              email={currentUser?.email}
              size={96}
              className="settings-avatar"
            />
            <span className="settings-avatar-source">
              {customPhoto ? 'Your upload' : providerPhoto ? 'From your sign-in account' : 'Your initials'}
            </span>
          </div>

          <div className="settings-profile-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              hidden
            />
            <button
              className="settings-btn settings-btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
            >
              {saving ? 'Saving...' : customPhoto ? 'Change picture' : 'Upload picture'}
            </button>
            {customPhoto && (
              <button className="settings-btn settings-btn-ghost" onClick={handleRemovePhoto} disabled={saving}>
                Remove upload
              </button>
            )}
            <p className="settings-hint">
              PNG, JPEG or WebP. The image is cropped to a square and resized before it is stored.
            </p>
          </div>
        </div>

        <form className="settings-name-form" onSubmit={handleNameSave}>
          <label htmlFor="displayName">Display name</label>
          <div className="settings-name-row">
            <input
              id="displayName"
              type="text"
              value={nameDraft}
              maxLength={60}
              placeholder={currentUser?.email?.split('@')[0] || 'Your name'}
              onChange={(event) => setNameDraft(event.target.value)}
              disabled={saving}
            />
            <button
              type="submit"
              className="settings-btn settings-btn-primary"
              disabled={saving || nameDraft === displayName}
            >
              Save
            </button>
          </div>
        </form>
      </div>

      <div className="page-section">
        <h2 className="page-section-title">Account</h2>
        <p className="page-section-subtitle">Details from the account you signed in with.</p>

        <dl className="settings-details">
          <div>
            <dt>Email</dt>
            <dd>{currentUser?.email || 'Not available'}</dd>
          </div>
          <div>
            <dt>Signed in with</dt>
            <dd>{providers.length > 0 ? providers.join(', ') : 'Unknown'}</dd>
          </div>
          <div>
            <dt>Expenses recorded</dt>
            <dd>{expenses.length}</dd>
          </div>
          <div>
            <dt>Total tracked</dt>
            <dd>{formatCurrency(totalSpent)}</dd>
          </div>
        </dl>

        <button className="settings-btn settings-btn-danger" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Settings;
