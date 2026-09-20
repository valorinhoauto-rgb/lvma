import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Dice5, Check, User, ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { AVATAR_CATEGORIES, AVATAR_COLOR_THEMES, generateRandomNickname } from '../utils/avatarData.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';
import { sound } from '../utils/audio.ts';
import { checkNicknameAvailable, reserveNickname } from '../lib/firebase.ts';

interface NicknameSetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  isFirstLogin?: boolean;
}

export const NicknameSetupModal: React.FC<NicknameSetupModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  isFirstLogin = true
}) => {
  const isLocked = Boolean(userProfile.nicknameLocked);
  const [nickname, setNickname] = useState(userProfile.nickname || userProfile.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar || '🦊');
  const [selectedColor, setSelectedColor] = useState(userProfile.avatarColor || 'emerald');
  const [activeCategory, setActiveCategory] = useState(AVATAR_CATEGORIES[0].id);
  const [useGooglePhoto, setUseGooglePhoto] = useState(
    Boolean(userProfile.photoURL && userProfile.avatar === userProfile.photoURL)
  );
  const [error, setError] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkTimeoutRef = useRef<any>(null);

  useEffect(() => {
    setNickname(userProfile.nickname || userProfile.name || '');
    setSelectedAvatar(userProfile.avatar || '🦊');
    setSelectedColor(userProfile.avatarColor || 'emerald');
    setUseGooglePhoto(Boolean(userProfile.photoURL && userProfile.avatar === userProfile.photoURL));
  }, [userProfile]);

  // Debounced check for nickname availability when not locked
  useEffect(() => {
    if (isLocked) return;
    const clean = nickname.trim().replace(/\s+/g, '_');
    if (clean.length < 3) {
      setCheckStatus('idle');
      return;
    }

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    setCheckStatus('checking');
    checkTimeoutRef.current = setTimeout(async () => {
      const result = await checkNicknameAvailable(clean, userProfile.id);
      if (result.available) {
        setCheckStatus('available');
        setError(null);
      } else {
        setCheckStatus('taken');
        setError(result.error || 'Nickname já está em uso.');
      }
    }, 450);

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [nickname, isLocked, userProfile.id]);

  if (!isOpen) return null;

  const handleRandomizeNick = () => {
    if (isLocked) return;
    sound.playClick();
    const randomNick = generateRandomNickname();
    setNickname(randomNick);
    setError(null);
  };

  const handleSelectAvatar = (av: string) => {
    sound.playClick();
    setSelectedAvatar(av);
    setUseGooglePhoto(false);
  };

  const handleSelectColor = (colorId: string) => {
    sound.playClick();
    setSelectedColor(colorId);
  };

  const handleToggleGooglePhoto = (usePhoto: boolean) => {
    sound.playClick();
    setUseGooglePhoto(usePhoto);
    if (usePhoto && userProfile.photoURL) {
      setSelectedAvatar(userProfile.photoURL);
    } else if (!usePhoto && userProfile.photoURL && selectedAvatar === userProfile.photoURL) {
      setSelectedAvatar('🦊');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const clean = nickname.trim().replace(/\s+/g, '_');

    if (!clean || clean.length < 3) {
      setError('O nickname deve ter no mínimo 3 caracteres.');
      sound.playError();
      return;
    }

    if (clean.length > 18) {
      setError('O nickname deve ter no máximo 18 caracteres.');
      sound.playError();
      return;
    }

    setIsSubmitting(true);

    // If nickname is not yet locked, verify uniqueness in Firestore
    if (!isLocked) {
      const checkResult = await checkNicknameAvailable(clean, userProfile.id);
      if (!checkResult.available) {
        setError(checkResult.error || 'Este nickname já está em uso por outro jogador! Escolha outro.');
        setCheckStatus('taken');
        sound.playError();
        setIsSubmitting(false);
        return;
      }

      // Reserve the nickname permanently in Firestore
      await reserveNickname(clean, userProfile.id);
    }

    sound.playSuccess();
    const finalAvatar = useGooglePhoto && userProfile.photoURL ? userProfile.photoURL : selectedAvatar;

    const updated: UserProfile = {
      ...userProfile,
      name: clean,
      nickname: clean,
      avatar: finalAvatar,
      avatarColor: selectedColor,
      hasConfiguredProfile: true,
      nicknameLocked: true // Locked permanently once configured!
    };

    setIsSubmitting(false);
    onSaveProfile(updated);
  };

  const currentDisplayAvatar = useGooglePhoto && userProfile.photoURL ? userProfile.photoURL : selectedAvatar;
  const currentCatObj = AVATAR_CATEGORIES.find(c => c.id === activeCategory) || AVATAR_CATEGORIES[0];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-['Outfit']">
                {isFirstLogin ? 'Defina seu Nickname Único' : isLocked ? 'Personalizar Avatar' : 'Personalizar Nickname & Avatar'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isLocked
                  ? 'Seu nickname é exclusivo e já está registrado. Você pode alterar seu avatar a qualquer momento.'
                  : 'O nickname é definido uma única vez e será sua identificação exclusiva.'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Live Preview Card */}
          <div className="bg-gradient-to-b from-slate-950/90 to-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-inner">
            <PlayerAvatar
              avatar={currentDisplayAvatar}
              avatarColor={selectedColor}
              size="xl"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Card de Partida</span>
              </div>
              <div className="text-base font-black text-white truncate font-['Outfit'] flex items-center gap-1.5">
                <span>{nickname.trim() || 'Seu_Nickname'}</span>
                {isLocked && (
                  <span title="Nickname permanente">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-mono font-bold text-[10px]">
                  Nv. {userProfile.level || 1}
                </span>
                <span>•</span>
                <span className="text-emerald-300 font-medium">Pronto para jogar</span>
              </div>
            </div>
          </div>

          {/* Nickname Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Seu Nickname Exclusivo</span>
              </label>
              {!isLocked && (
                <button
                  type="button"
                  onClick={handleRandomizeNick}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Dice5 className="w-3.5 h-3.5" />
                  <span>Sugerir Aleatório</span>
                </button>
              )}
            </div>

            {isLocked ? (
              <div className="bg-slate-950 border border-slate-750 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-white font-mono">@{nickname}</span>
                    <p className="text-[10px] text-slate-400">
                      Definido permanentemente. Nicknames não podem ser trocados para garantir identidade única.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-md shrink-0 border border-amber-500/20">
                  Bloqueado
                </span>
              </div>
            ) : (
              <>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={18}
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setError(null);
                    }}
                    placeholder="Ex: RaposaVeloz, Leo_Stop, Bia"
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none transition-colors pr-24 ${
                      checkStatus === 'taken'
                        ? 'border-rose-500 focus:border-rose-400'
                        : checkStatus === 'available'
                        ? 'border-emerald-500 focus:border-emerald-400'
                        : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-2 text-[11px]">
                    {checkStatus === 'checking' && (
                      <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    )}
                    {checkStatus === 'available' && (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="text-slate-500 font-mono">
                      {nickname.length}/18
                    </span>
                  </div>
                </div>

                {/* Live validation feedback */}
                {checkStatus === 'available' && !error && (
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Nickname único disponível!
                  </p>
                )}
                {checkStatus === 'checking' && (
                  <p className="text-xs text-amber-400/80 font-medium flex items-center gap-1">
                    Verificando disponibilidade do nickname...
                  </p>
                )}
                {error && (
                  <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </p>
                )}

                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-[11px] text-amber-200">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Atenção:</strong> O nickname só pode ser definido <strong>1 única vez</strong> e nunca existirão dois iguais. Ele será sua identificação definitiva para amigos e salas.
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Google Photo Toggle (if available) */}
          {userProfile.photoURL && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={userProfile.photoURL}
                  alt="Google"
                  className="w-8 h-8 rounded-full border border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="text-xs font-bold text-white">Usar Foto do Google</div>
                  <div className="text-[10px] text-slate-400">Usar sua foto de perfil oficial</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleGooglePhoto(false)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                    !useGooglePhoto
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Ícone
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleGooglePhoto(true)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                    useGooglePhoto
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Foto
                </button>
              </div>
            </div>
          )}

          {/* Avatar Icon Selector (Shown if not using Google photo) */}
          {!useGooglePhoto && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  1. Escolha a Cor de Fundo do Avatar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {AVATAR_COLOR_THEMES.map((theme) => {
                    const isSelected = selectedColor === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleSelectColor(theme.id)}
                        className={`h-9 rounded-xl flex items-center justify-center border transition-all ${theme.bgGradient} ${
                          isSelected
                            ? 'border-white scale-105 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400'
                            : 'border-slate-800/80 opacity-70 hover:opacity-100'
                        }`}
                        title={theme.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white filter drop-shadow" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  2. Escolha seu Ícone
                </label>

                {/* Category Navigation Pills */}
                <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none">
                  {AVATAR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveCategory(cat.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                        activeCategory === cat.id
                          ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                {/* Avatars Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-slate-950/70 border border-slate-800 rounded-2xl max-h-44 overflow-y-auto">
                  {currentCatObj.avatars.map((av) => {
                    const isSelected = selectedAvatar === av;
                    return (
                      <button
                        key={av}
                        type="button"
                        onClick={() => handleSelectAvatar(av)}
                        className={`h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 scale-110 shadow-sm shadow-emerald-500/30 font-bold'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                        }`}
                      >
                        {av}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            {onClose && !isFirstLogin && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || (!isLocked && checkStatus === 'taken')}
              className={`flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] ${
                isSubmitting || (!isLocked && checkStatus === 'taken')
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Check className="w-4 h-4 text-slate-950" />
              )}
              <span>
                {isFirstLogin
                  ? 'Confirmar Nickname & Começar'
                  : isLocked
                  ? 'Salvar Novo Avatar'
                  : 'Confirmar Nickname'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

