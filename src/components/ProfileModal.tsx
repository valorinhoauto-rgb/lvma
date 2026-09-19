/**
 * Profile & Achievements Modal for STOP + TERMO
 */

import React, { useState, useEffect } from 'react';
import { X, User, Trophy, Zap, Sparkles, BookOpen, Target, Crown, Check, Save, LogIn, LogOut, History, Award } from 'lucide-react';
import { GameHistoryEntry, UserProfile } from '../types.ts';
import { ACHIEVEMENTS_LIST, calculateLevel, saveUserProfile } from '../utils/profile.ts';
import { sound } from '../utils/audio.ts';
import { auth, loginWithGoogle, logout, fetchUserGameHistory, syncUserProfileToDb } from '../lib/firebase.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

const AVATAR_OPTIONS = ['🦊', '🐻', '🦁', '🐼', '🐯', '🦉', '🐺', '🐬', '🦄', '🚀', '⚡', '👑'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'achievements'>('profile');
  const [name, setName] = useState(userProfile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    setName(userProfile.name);
    setSelectedAvatar(userProfile.avatar);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: UserProfile = {
      ...userProfile,
      name: name.trim(),
      avatar: selectedAvatar
    };
    saveUserProfile(updated);
    syncUserProfileToDb(updated);
    onUpdateProfile(updated);
    sound.playClick();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoadingAuth(true);
      sound.playClick();
      const fbUser = await loginWithGoogle();
      if (fbUser) {
        const updated: UserProfile = {
          ...userProfile,
          id: fbUser.uid,
          name: fbUser.displayName || userProfile.name,
          avatar: userProfile.avatar,
        };
        saveUserProfile(updated);
        await syncUserProfileToDb(updated);
        onUpdateProfile(updated);
        sound.playSuccess();
      }
    } catch (err) {
      console.error('Google login failed:', err);
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

              {/* Level & XP Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
                  {selectedAvatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">Nível {levelInfo.level}</span>
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
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">Nome de Exibição</label>
                  <input
                    type="text"
                    maxLength={20}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold block mb-1.5">Escolha seu Avatar</label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedAvatar(av);
                        }}
                        className={`h-11 rounded-xl text-xl flex items-center justify-center border transition-all ${
                          selectedAvatar === av
                            ? 'bg-emerald-500/20 border-emerald-500 scale-105 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  {saved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
                  <span>{saved ? 'Salvo!' : 'Salvar Alterações'}</span>
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
