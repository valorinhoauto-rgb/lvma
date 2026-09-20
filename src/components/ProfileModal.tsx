/**
 * Profile & Achievements Modal for STOP + TERMO
 */

import React, { useState, useEffect } from 'react';
import { X, User, Trophy, Zap, Sparkles, BookOpen, Target, Crown, Check, Save, LogIn, LogOut, History, Award, AlertCircle, Dice5, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { GameHistoryEntry, UserProfile } from '../types.ts';
import { ACHIEVEMENTS_LIST, calculateLevel, saveUserProfile } from '../utils/profile.ts';
import { sound } from '../utils/audio.ts';
import { auth, loginWithGoogle, logout, fetchUserGameHistory, syncUserProfileToDb, fetchUserProfile, checkNicknameAvailable, reserveNickname } from '../lib/firebase.ts';
import { AVATAR_CATEGORIES, AVATAR_COLOR_THEMES, generateRandomNickname, getSuggestedNickname } from '../utils/avatarData.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile
}) => {
  const isLocked = Boolean(userProfile.nicknameLocked);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'achievements'>('profile');
  const [name, setName] = useState(userProfile.nickname || userProfile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);
  const [selectedColor, setSelectedColor] = useState(userProfile.avatarColor || 'emerald');
  const [activeCategory, setActiveCategory] = useState(AVATAR_CATEGORIES[0].id);
  const [useGooglePhoto, setUseGooglePhoto] = useState(
    Boolean(userProfile.photoURL && userProfile.avatar === userProfile.photoURL)
  );
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [nickError, setNickError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(userProfile.nickname || userProfile.name);
    setSelectedAvatar(userProfile.avatar);
    setSelectedColor(userProfile.avatarColor || 'emerald');
    setUseGooglePhoto(Boolean(userProfile.photoURL && userProfile.avatar === userProfile.photoURL));
  }, [userProfile]);

  useEffect(() => {
    if (isOpen && activeTab === 'history' && userProfile.id) {
      fetchUserGameHistory(userProfile.id).then(entries => {
        setHistory(entries);
      });
    }
  }, [isOpen, activeTab, userProfile.id]);

  if (!isOpen) return null;

  const levelInfo = calculateLevel(userProfile.xp);

  const handleRandomizeNick = () => {
    if (isLocked) return;
    sound.playClick();
    setName(generateRandomNickname());
    setNickError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const cleanName = name.trim().replace(/\s+/g, '_');
    if (!cleanName || cleanName.length < 3) {
      setNickError('O nickname deve ter no mínimo 3 caracteres.');
      sound.playError();
      return;
    }

    setSaving(true);
    setNickError(null);

    // If nickname wasn't locked yet, verify uniqueness and reserve it
    if (!isLocked) {
      const checkRes = await checkNicknameAvailable(cleanName, userProfile.id);
      if (!checkRes.available) {
        setNickError(checkRes.error || 'Nickname já está em uso por outro jogador!');
        sound.playError();
        setSaving(false);
        return;
      }
      await reserveNickname(cleanName, userProfile.id);
    }

    const finalAvatar = useGooglePhoto && userProfile.photoURL ? userProfile.photoURL : selectedAvatar;

    const updated: UserProfile = {
      ...userProfile,
      name: cleanName,
      nickname: cleanName,
      avatar: finalAvatar,
      avatarColor: selectedColor,
      hasConfiguredProfile: true,
      nicknameLocked: true
    };

    saveUserProfile(updated);
    syncUserProfileToDb(updated);
    onUpdateProfile(updated);
    sound.playSuccess();
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      setLoadingAuth(true);
      sound.playClick();
      const fbUser = await loginWithGoogle();
      if (fbUser) {
        const remoteProfile = await fetchUserProfile(fbUser.uid);
        if (remoteProfile) {
          saveUserProfile(remoteProfile);
          onUpdateProfile(remoteProfile);
        } else {
          const suggestedNick = getSuggestedNickname(fbUser.displayName || fbUser.email || '');
          const updated: UserProfile = {
            ...userProfile,
            id: fbUser.uid,
            name: suggestedNick,
            nickname: suggestedNick,
            email: fbUser.email || undefined,
            photoURL: fbUser.photoURL || undefined,
            avatar: userProfile.avatar,
            avatarColor: selectedColor,
            isGoogleAuth: true,
            hasConfiguredProfile: true
          };
          saveUserProfile(updated);
          await syncUserProfileToDb(updated);
          onUpdateProfile(updated);
        }
        sound.playSuccess();
      }
    } catch (err: unknown) {
      console.error('Google login failed:', err);
      const errorObj = err as { code?: string; message?: string };
      if (errorObj?.code === 'auth/unauthorized-domain') {
        setAuthError('O domínio atual (malm.netlify.app) precisa ser adicionado à lista de "Domínios Autorizados" nas configurações do Firebase Authentication.');
      } else if (errorObj?.code === 'auth/popup-closed-by-user') {
        setAuthError('Janela de login fechada antes da confirmação.');
      } else {
        setAuthError(errorObj?.message || 'Falha ao conectar com a conta Google.');
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      sound.playClick();
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const currentDisplayAvatar = useGooglePhoto && userProfile.photoURL ? userProfile.photoURL : selectedAvatar;
  const currentCatObj = AVATAR_CATEGORIES.find(c => c.id === activeCategory) || AVATAR_CATEGORIES[0];

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return <Trophy className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'Target': return <Target className="w-4 h-4" />;
      case 'Crown': return <Crown className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  const currentUser = auth.currentUser;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-white text-base">Perfil & Conta</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Perfil & Conta
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Histórico de Partidas
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'achievements'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Conquistas
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'profile' && (
            <>
              {/* Google Auth Status / Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="Avatar" className="w-10 h-10 rounded-full" />
                    ) : (
                      'G'
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {currentUser ? currentUser.displayName || currentUser.email : 'Modo Convidado'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {currentUser ? 'Progresso salvo na Nuvem' : 'Faça login com Google para salvar seu progresso'}
                    </div>
                  </div>
                </div>

                {currentUser ? (
                  <button
                    onClick={handleGoogleLogout}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loadingAuth}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5 text-blue-600" />
                    <span>Entrar com Google</span>
                  </button>
                )}
              </div>

              {/* Auth Warning/Error for Unauthorized Domain or Other Issues */}
              {authError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-xs text-rose-200 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Aviso de Autenticação</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">{authError}</p>
                  {authError.includes('Domínios Autorizados') && (
                    <div className="pt-1 border-t border-rose-500/20 text-[11px] text-slate-400">
                      <span>Para liberar no Netlify, adicione </span>
                      <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">malm.netlify.app</code>
                      <span> em: </span>
                      <a
                        href="https://console.firebase.google.com/project/gen-lang-client-0260535518/authentication/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-emerald-400 hover:text-emerald-300 font-bold underline ml-1"
                      >
                        Firebase Console &rarr; Auth &rarr; Settings
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Level & XP Card with Live PlayerAvatar */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                <PlayerAvatar
                  avatar={currentDisplayAvatar}
                  avatarColor={selectedColor}
                  size="xl"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{name.trim() || 'Jogador'}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded font-mono">
                        Nv. {levelInfo.level}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono font-medium">
                      {levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Total acumulado: {userProfile.xp} XP
                  </div>
                </div>
              </div>

              {/* Edit Identity Form */}
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isLocked ? 'Nickname Único (Permanente)' : 'Definir Nickname Único'}</span>
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
                          <span className="text-sm font-bold text-white font-mono">@{userProfile.nickname || userProfile.name}</span>
                          <p className="text-[10px] text-slate-400">
                            Identificação única e permanente. Nicknames não podem ser trocados.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                        Bloqueado
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={18}
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setNickError(null);
                          }}
                          placeholder="Ex: RaposaVeloz, Leo_Stop, Bia"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold pr-14"
                        />
                        <span className="absolute right-3 top-2.5 text-[11px] text-slate-500 font-mono">
                          {name.length}/18
                        </span>
                      </div>
                      {nickError && (
                        <p className="text-xs text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{nickError}</span>
                        </p>
                      )}
                      <p className="text-[10px] text-amber-400/90 mt-1">
                        ⚠️ Atenção: O nickname só pode ser definido 1 única vez e é único em todo o jogo.
                      </p>
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
                        className="w-7 h-7 rounded-full border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">Usar Foto da Conta Google</div>
                        <div className="text-[10px] text-slate-400">Exibir sua foto oficial nas partidas</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setUseGooglePhoto(false);
                          if (selectedAvatar === userProfile.photoURL) setSelectedAvatar('🦊');
                        }}
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
                        onClick={() => {
                          sound.playClick();
                          setUseGooglePhoto(true);
                          setSelectedAvatar(userProfile.photoURL || '🦊');
                        }}
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

                {/* Avatar Color Themes */}
                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                    Cor de Fundo do Avatar
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {AVATAR_COLOR_THEMES.map((theme) => {
                      const isSelected = selectedColor === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedColor(theme.id);
                          }}
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

                {/* Avatar Icon Grid (When not using Google Photo) */}
                {!useGooglePhoto && (
                  <div>
                    <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                      Escolha seu Ícone
                    </label>

                    {/* Category Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none mb-2">
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

                    {/* Category Avatars Grid */}
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-slate-950/80 border border-slate-800 rounded-2xl max-h-40 overflow-y-auto">
                      {currentCatObj.avatars.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedAvatar(av);
                          }}
                          className={`h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                            selectedAvatar === av
                              ? 'bg-emerald-500/20 border-emerald-500 scale-105 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Validando Nickname Único...</span>
                    </>
                  ) : saved ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Salvo com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Histórico de Partidas Recentes
              </div>

              {history.length === 0 ? (
                <div className="text-center py-10 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                  Nenhuma partida registrada ainda. Jogue rodadas multiplayer para acumular histórico!
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white capitalize">
                          {entry.gameMode === 'juice_photo' ? 'Juice / Fotos' : entry.gameMode === 'termo_multiplayer' ? 'TERMO Coop' : 'STOP+TERMO'}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {entry.playedAt ? new Date(entry.playedAt).toLocaleDateString('pt-BR') : 'Hoje'} • {entry.totalPlayers} jogadores
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="font-bold text-emerald-400 font-mono">{entry.score} pts</div>
                          <div className="text-[10px] text-amber-300">+{entry.xpGained} XP</div>
                        </div>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                          entry.rank === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          #{entry.rank}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Conquistas</span>
                <span className="text-emerald-400">
                  {userProfile.achievements.length} de {ACHIEVEMENTS_LIST.length} desbloqueadas
                </span>
              </div>

              <div className="grid gap-2">
                {ACHIEVEMENTS_LIST.map((ach) => {
                  const isUnlocked = userProfile.achievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                        isUnlocked
                          ? 'bg-slate-950 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isUnlocked
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-600 border border-slate-700'
                        }`}
                      >
                        {getAchievementIcon(ach.icon)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{ach.title}</span>
                          <span className="text-[10px] text-amber-300 font-mono">+{ach.xpReward} XP</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{ach.description}</p>
                      </div>

                      {isUnlocked && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          OK
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
