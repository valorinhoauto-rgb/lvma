/**
 * Header Component for STOP + TERMO
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, BookOpen, User, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio.ts';
import { UserProfile } from '../types.ts';
import { calculateLevel } from '../utils/profile.ts';

interface HeaderProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenHowToPlay: () => void;
  onOpenDictionary: () => void;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onOpenProfile,
  onOpenHowToPlay,
  onOpenDictionary,
  onLogoClick
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const levelInfo = calculateLevel(userProfile.xp);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <button
          id="btn-logo-home"
          onClick={onLogoClick}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-all border border-slate-700/60 shrink-0 bg-slate-950 flex items-center justify-center">
            <img src="/favicon.svg" alt="MALM Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-xl tracking-wider bg-gradient-to-r from-white via-emerald-200 to-teal-300 bg-clip-text text-transparent font-['Outfit']">
                MALM
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">STOP • TERMO • JUICE</p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dictionary & Suggestions */}
          <button
            id="btn-nav-dictionary"
            onClick={onOpenDictionary}
            title="Dicionário e Sugestões"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Dicionário</span>
          </button>

          {/* How to play */}
          <button
            id="btn-nav-how-to-play"
            onClick={onOpenHowToPlay}
            title="Como Jogar"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Regras</span>
          </button>

          {/* Audio toggle */}
          <button
            id="btn-toggle-audio"
            onClick={handleToggleSound}
            title={isMuted ? 'Ativar som' : 'Desativar som'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* User Profile Pill */}
          <button
            id="btn-nav-profile"
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-full transition-colors group text-left"
          >
            <span className="text-lg leading-none">{userProfile.avatar}</span>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-bold text-white max-w-[90px] truncate">{userProfile.name}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                  Nv.{levelInfo.level}
                </span>
              </div>
              <div className="w-16 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
