import React, { useState } from 'react';
import { Users, UserPlus, Search, Copy, Check, Trash2, Send, X, ShieldCheck, AlertCircle, Loader2, LogIn, Lock } from 'lucide-react';
import { Friend, UserProfile } from '../types.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';
import { sound } from '../utils/audio.ts';
import { findUserByNickname, auth, loginWithGoogle } from '../lib/firebase.ts';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  friends: Friend[];
  onAddFriend: (friend: Friend) => void;
  onRemoveFriend: (friendId: string) => void;
  currentRoomId?: string | null;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  friends,
  onAddFriend,
  onRemoveFriend,
  currentRoomId
}) => {
  const isGoogleUser = Boolean(currentUser.isGoogleAuth || auth.currentUser);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [searchNick, setSearchNick] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoadingAuth(true);
      setAuthError(null);
      sound.playClick();
      await loginWithGoogle();
      sound.playSuccess();
    } catch (err: unknown) {
      console.error('Google login error from FriendsModal:', err);
      const errorObj = err as { message?: string };
      setAuthError(errorObj?.message || 'Falha ao conectar com a conta Google.');
      sound.playError();
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchNick.trim().replace(/^@/, '');
    if (!clean) return;

    if (clean.toLowerCase() === (currentUser.nickname || currentUser.name).toLowerCase()) {
      setSearchError('Você não pode adicionar seu próprio perfil como amigo.');
      setSearchResult(null);
      sound.playError();
      return;
    }

    setSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const found = await findUserByNickname(clean);
      if (found) {
        setSearchResult(found);
        sound.playSuccess();
      } else {
        setSearchError(`Nenhum jogador encontrado com o nickname único "@${clean}".`);
        sound.playError();
      }
    } catch (err) {
      setSearchError('Erro ao buscar jogador. Verifique a conexão.');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFoundUser = () => {
    if (!searchResult) return;

    const alreadyFriend = friends.some(
      f => f.id === searchResult.id || (f.nickname && f.nickname.toLowerCase() === (searchResult.nickname || searchResult.name).toLowerCase())
    );

    if (alreadyFriend) {
      setSearchError('Este jogador já está na sua lista de amigos!');
      sound.playError();
      return;
    }

    const newFriend: Friend = {
      id: searchResult.id,
      nickname: searchResult.nickname || searchResult.name,
      name: searchResult.name,
      avatar: searchResult.avatar || '🦊',
      avatarColor: searchResult.avatarColor || 'emerald',
      level: searchResult.level || 1,
      addedAt: new Date().toISOString()
    };

    onAddFriend(newFriend);
    sound.playSuccess();
    setInviteFeedback(`@${newFriend.nickname} adicionado aos amigos!`);
    setSearchResult(null);
    setSearchNick('');
    setTimeout(() => setInviteFeedback(null), 3000);
    setActiveTab('list');
  };

  const handleInviteFriend = (friend: Friend) => {
    if (!currentRoomId) return;
    sound.playClick();
    const inviteText = `Vem jogar comigo no STOP + TERMO! Entre na sala com o código: ${currentRoomId}`;
    navigator.clipboard.writeText(inviteText);
    setCopiedId(friend.id);
    setInviteFeedback(`Convite para @${friend.nickname} copiado para a área de transferência!`);
    setTimeout(() => {
      setCopiedId(null);
      setInviteFeedback(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-['Outfit']">
                Lista de Amigos
              </h2>
              <p className="text-[11px] text-slate-400">
                Adicione amigos por nickname único e convide-os para suas partidas
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector - only shown when logged in with Google */}
        {isGoogleUser && (
          <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('list');
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Meus Amigos ({friends.length})</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('add');
              }}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Adicionar por Nickname</span>
            </button>
          </div>
        )}

        {/* Toast / Feedback notification */}
        {inviteFeedback && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-2 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{inviteFeedback}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {!isGoogleUser ? (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Users className="w-8 h-8" />
              </div>

              <div className="space-y-1.5 max-w-sm">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Exclusivo para Contas Google</span>
                </div>
                <h3 className="text-lg font-black text-white font-['Outfit']">
                  Lista de Amigos Requer Login
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para adicionar amigos por <strong>Nickname Único</strong>, ver quem está online e convidar amigos diretamente para suas salas, conecte-se com sua conta Google.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 text-left text-xs text-slate-300 space-y-2 max-w-xs w-full">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Salvar amigos permanentemente na nuvem</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Pesquisar jogadores por <strong>@Nickname</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Enviar convite de sala com 1 clique</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loadingAuth}
                className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
              >
                {loadingAuth ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <LogIn className="w-4 h-4 text-blue-600" />
                )}
                <span>Entrar com Conta Google</span>
              </button>

              {authError && (
                <p className="text-xs text-rose-400 max-w-xs">{authError}</p>
              )}
            </div>
          ) : activeTab === 'list' ? (
            <>
              {friends.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Nenhum amigo adicionado ainda</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                    Adicione jogadores diretamente pelo lobby da partida ou busque pelo nickname único exclusivo!
                  </p>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveTab('add');
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Adicionar Amigo</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <PlayerAvatar
                          avatar={friend.avatar}
                          avatarColor={friend.avatarColor || 'emerald'}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                            <span>{friend.name || friend.nickname}</span>
                            <span className="text-xs text-slate-400 font-mono font-normal">
                              @{friend.nickname}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">
                              Nv. {friend.level || 1}
                            </span>
                            <span>• Amigo</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {currentRoomId && (
                          <button
                            onClick={() => handleInviteFriend(friend)}
                            className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Convidar para a sala atual"
                          >
                            {copiedId === friend.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Convidar</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            sound.playClick();
                            onRemoveFriend(friend.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Remover amigo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Digite o Nickname Único do Jogador
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-mono font-bold text-sm">@</span>
                    <input
                      type="text"
                      value={searchNick}
                      onChange={(e) => {
                        setSearchNick(e.target.value);
                        setSearchError(null);
                      }}
                      placeholder="Ex: RaposaVeloz, Leo_Stop"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchNick.trim()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {searching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Buscar</span>
                  </button>
                </div>
              </form>

              {searchError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {searchResult && (
                <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      avatar={searchResult.avatar || '🦊'}
                      avatarColor={searchResult.avatarColor || 'emerald'}
                      size="lg"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{searchResult.name}</span>
                        <span className="text-xs text-emerald-400 font-mono">
                          @{searchResult.nickname || searchResult.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Nv. {searchResult.level || 1} • {searchResult.gamesPlayed || 0} partidas jogadas
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleAddFoundUser}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Adicionar Amigo</span>
                  </button>
                </div>
              )}

              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  Cada jogador possui um <strong>nickname único e exclusivo</strong>, garantindo que você adicione exatamente a pessoa que procura sem risco de homônimos.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Current Room Invite */}
        {currentRoomId && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Sua sala atual:</span>
              <span className="font-mono font-bold text-white bg-slate-900 px-2 py-1 rounded-md border border-slate-800 tracking-wider">
                {currentRoomId}
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentRoomId);
                sound.playClick();
                setInviteFeedback('Código da sala copiado!');
                setTimeout(() => setInviteFeedback(null), 2500);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Código</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
