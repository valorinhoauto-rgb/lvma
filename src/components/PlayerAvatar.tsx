import React, { useState } from 'react';
import { getAvatarColorTheme } from '../utils/avatarData.ts';

interface PlayerAvatarProps {
  avatar: string;
  avatarColor?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showBorder?: boolean;
  className?: string;
}

const SIZE_CONFIGS = {
  xs: {
    container: 'w-6 h-6 rounded-lg text-xs',
    img: 'w-6 h-6 rounded-lg'
  },
  sm: {
    container: 'w-8 h-8 rounded-xl text-base',
    img: 'w-8 h-8 rounded-xl'
  },
  md: {
    container: 'w-10 h-10 rounded-xl text-xl',
    img: 'w-10 h-10 rounded-xl'
  },
  lg: {
    container: 'w-12 h-12 rounded-2xl text-2xl',
    img: 'w-12 h-12 rounded-2xl'
  },
  xl: {
    container: 'w-16 h-16 rounded-2xl text-3xl',
    img: 'w-16 h-16 rounded-2xl'
  },
  '2xl': {
    container: 'w-20 h-20 rounded-3xl text-4xl shadow-xl',
    img: 'w-20 h-20 rounded-3xl'
  }
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatar,
  avatarColor = 'emerald',
  size = 'md',
  showBorder = true,
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const colorTheme = getAvatarColorTheme(avatarColor);
  const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  const isUrl = (avatar.startsWith('http://') || avatar.startsWith('https://')) && !imgError;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none transition-transform ${config.container} ${
        isUrl
          ? 'bg-slate-800'
          : `${colorTheme.bgGradient} shadow-md`
      } ${
        showBorder ? `border ${colorTheme.borderClass}` : ''
      } ${className}`}
    >
      {isUrl ? (
        <img
          src={avatar}
          alt="Avatar"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover ${config.img}`}
        />
      ) : (
        <span className="leading-none flex items-center justify-center filter drop-shadow-sm">
          {avatar || '🦊'}
        </span>
      )}
    </div>
  );
};
