import { useEffect, useState } from 'react';
import './Avatar.css';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}

const getInitials = (name?: string | null, email?: string | null) => {
  const source = (name || '').trim();
  if (source) {
    const parts = source.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]).join('').toUpperCase();
  }
  return (email?.[0] || 'U').toUpperCase();
};

const Avatar = ({ src, name, email, size = 40, className = '' }: AvatarProps) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const style = { width: size, height: size, fontSize: Math.max(12, size * 0.4) };

  if (!src || failed) {
    return (
      <div className={`avatar avatar-placeholder ${className}`} style={style}>
        {getInitials(name, email)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || 'Profile'}
      className={`avatar avatar-img ${className}`}
      style={style}
      // Google/Apple photo hosts reject requests that carry a referrer
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
};

export default Avatar;
