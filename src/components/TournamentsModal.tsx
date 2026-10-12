/**
 * TournamentsModal Component
 * Central Competitiva de Torneios, Premiações e Economia de Moedas
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Coins,
  PlusCircle,
  Users,
  Clock,
  Award,
  CheckCircle,
  Sparkles,
  X,
  Play,
  ArrowRight,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { Tournament, UserProfile, GameMode } from '../types.ts';
import {
  subscribeTournaments,
  registerInTournament,
  createCustomTournament,
  claimDailyBonus,
  purchaseCoinsPack
} from '../lib/tournamentService.ts';
import { sound } from '../utils/audio.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';

interface TournamentsModalProps {
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onStartTournamentMatch?: (tournament: Tournament) => void;
}

export const TournamentsModal: React.FC<TournamentsModalProps> = ({
  userProfile,
  isOpen,
  onClose,
  onUpdateProfile,
  onStartTournamentMatch
}) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'bracket' | 'create' | 'shop'>('tournaments');
  const [tournamentsList, setTournamentsList] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form para criação de torneio personalizado
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createMode, setCreateMode] = useState<GameMode>('uno');
  const [createFee, setCreateFee] = useState<number>(50);
  const [createMaxPlayers, setCreateMaxPlayers] = useState<number>(8);

  // Saldo de moedas do jogador
  const playerCoins = userProfile.malmCoins ?? 250;

  // Assinatura em tempo real dos torneios
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeTournaments((items) => {
      setTournamentsList(items);
      if (selectedTournament) {
        const updated = items.find((t) => t.id === selectedTournament.id);
        if (updated) setSelectedTournament(updated);
      } else if (items.length > 0) {
        setSelectedTournament(items[0]);
      }
    });

    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Resgate do bônus diário
  const handleClaimDaily = () => {
    sound.playClick();
    const res = claimDailyBonus(userProfile);
    if (res.success && res.updatedProfile) {
      sound.playVictory();
      onUpdateProfile(res.updatedProfile);
      showNotification(res.message, 'success');
    } else {
      sound.playError();
      showNotification(res.message, 'error');
    }
  };

  // Inscrição em torneio
  const handleRegister = async (tournament: Tournament) => {
    sound.playClick();
    setIsSubmitting(true);
    const res = await registerInTournament(tournament.id, userProfile);
    setIsSubmitting(false);

    if (res.success && res.updatedProfile) {
      sound.playVictory();
      onUpdateProfile(res.updatedProfile);
      showNotification(res.message, 'success');
    } else {
      sound.playError();
      showNotification(res.message, 'error');
    }
  };

  // Criação de torneio personalizado
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSubmitting(true);

    const res = await createCustomTournament(
      {
        title: createTitle,
        description: createDesc,
        gameMode: createMode,
        entryFee: createFee,
        maxParticipants: createMaxPlayers
      },
      userProfile
    );

    setIsSubmitting(false);

    if (res.success && res.tournament) {
      sound.playVictory();
      showNotification(res.message, 'success');
      setSelectedTournament(res.tournament);
      setActiveTab('tournaments');
      setCreateTitle('');
      setCreateDesc('');
    } else {
      sound.playError();
      showNotification(res.message, 'error');
    }
  };

  // Simulação de compra de pacote de moedas
  const handleBuyCoins = (amount: number, priceBRL: string) => {
    sound.playClick();
    const res = purchaseCoinsPack(userProfile, amount, priceBRL);
    sound.playVictory();
    onUpdateProfile(res.updatedProfile);
    showNotification(res.message, 'success');
  };

  const getModeLabel = (mode: GameMode) => {
    switch (mode) {
      case 'uno':
        return 'JOGO UNO';
      case 'stop_termo':
        return 'STOP + TERMO';
      case 'termo_multiplayer':
        return 'TERMO COLETIVO';
      case 'forca':
        return 'JOGO DA FORCA';
      case 'juice_photo':
        return 'MODO JUICE';
      default:
        return 'MULTIPLAYER';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white font-['Outfit'] tracking-tight">Arena de Torneios MALM</h2>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  COMPETITIVO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dispute ligas com premiação em moedas, suba na tabela e conquiste troféus exclusivos.
              </p>
            </div>
          </div>

          {/* User Balance & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-slate-950 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold leading-none">Saldo</div>
                <div className="text-sm font-black text-amber-300 font-mono leading-tight">{playerCoins}</div>
              </div>
            </div>

            <button
              id="btn-close-tournaments-modal"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Bar */}
        {feedbackMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-200 border-b border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-200 border-b border-rose-500/30'
            }`}
          >
            {feedbackMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ShieldCheck className="w-4 h-4 text-rose-400" />}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 gap-1 overflow-x-auto scrollbar-none">
          <button
            id="tab-tournaments-list"
            onClick={() => {
              sound.playClick();
              setActiveTab('tournaments');
            }}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'tournaments'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Torneios Abertos</span>
            <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 ml-0.5">
              {tournamentsList.length}
            </span>
          </button>

          <button
            id="tab-tournaments-bracket"
            onClick={() => {
              sound.playClick();
              setActiveTab('bracket');
            }}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bracket'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Classificação & Chave</span>
          </button>

          <button
            id="tab-tournaments-create"
            onClick={() => {
              sound.playClick();
              setActiveTab('create');
            }}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'create'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Criar Torneio</span>
          </button>

          <button
            id="tab-tournaments-shop"
            onClick={() => {
              sound.playClick();
              setActiveTab('shop');
            }}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'shop'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Loja de Moedas & Bônus</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          {/* ABA 1: LISTA DE TORNEIOS */}
          {activeTab === 'tournaments' && (
            <div className="space-y-4">
              {/* Daily Reward Banner Callout */}
              <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/20 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Bônus Diário de Inscrição</span>
                      <span className="text-[10px] text-emerald-400 font-mono">+100 Moedas</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Colete suas moedas diárias para se inscrever nos campeonatos sem gastar nada.
                    </div>
                  </div>
                </div>
                <button
                  id="btn-claim-daily-banner"
                  onClick={handleClaimDaily}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resgatar +100 Moedas</span>
                </button>
              </div>

              {/* Grid de Torneios */}
              <div className="grid md:grid-cols-2 gap-3.5">
                {tournamentsList.map((tour) => {
                  const isRegistered = tour.participants.some((p) => p.id === userProfile.id);
                  const isFull = tour.participants.length >= tour.maxParticipants;
                  const isSelected = selectedTournament?.id === tour.id;

                  return (
                    <div
                      key={tour.id}
                      onClick={() => setSelectedTournament(tour)}
                      className={`relative bg-slate-900 border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-amber-400/80 shadow-lg shadow-amber-500/10 bg-slate-850'
                          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                      }`}
                    >
                      {/* Top Info */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                            {getModeLabel(tour.gameMode)}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {tour.isOfficial && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                OFICIAL
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                tour.status === 'live'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {tour.status === 'live' ? 'AO VIVO' : 'INSCRIÇÕES'}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base font-black text-white font-['Outfit'] leading-snug">{tour.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{tour.description}</p>
                      </div>

                      {/* Prize Pool & Entry Fee */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-400 leading-none">Prêmio Total</div>
                          <div className="text-base font-black text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            <span>{tour.prizePool}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">1º: {tour.prizes.first} moedas</div>
                        </div>

                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-400 leading-none">Inscrição</div>
                          <div className="text-base font-black text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                            {tour.entryFee === 0 ? (
                              <span className="text-emerald-300 text-xs font-bold uppercase">GRÁTIS</span>
                            ) : (
                              <>
                                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{tour.entryFee}</span>
                              </>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Vagas: {tour.participants.length}/{tour.maxParticipants}
                          </div>
                        </div>
                      </div>

                      {/* Action CTA */}
                      <div className="flex items-center gap-2 pt-1">
                        {isRegistered ? (
                          <div className="w-full flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl flex-1 justify-center">
                              <CheckCircle className="w-4 h-4" />
                              <span>Inscrição Confirmada</span>
                            </span>

                            {onStartTournamentMatch && (
                              <button
                                id={`btn-play-tour-${tour.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sound.playClick();
                                  onStartTournamentMatch(tour);
                                }}
                                className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shadow-md active:scale-95 cursor-pointer shrink-0"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Jogar</span>
                              </button>
                            )}
                          </div>
                        ) : isFull ? (
                          <button
                            disabled
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold cursor-not-allowed"
                          >
                            Vagas Esgotadas
                          </button>
                        ) : (
                          <button
                            id={`btn-register-tour-${tour.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegister(tour);
                            }}
                            disabled={isSubmitting}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                          >
                            <Trophy className="w-3.5 h-3.5" />
                            <span>
                              {tour.entryFee === 0 ? 'Entrar Grátis' : `Inscrever-se (🪙 ${tour.entryFee})`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABA 2: CLASSIFICAÇÃO & DETALHES DO TORNEIO */}
          {activeTab === 'bracket' && (
            <div className="space-y-4">
              {selectedTournament ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                          {getModeLabel(selectedTournament.gameMode)}
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs text-slate-400">Criado por {selectedTournament.creatorName}</span>
                      </div>
                      <h3 className="text-lg font-black text-white font-['Outfit'] mt-0.5">
                        {selectedTournament.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Pote Total</div>
                        <div className="text-sm font-black text-amber-400 font-mono">
                          🪙 {selectedTournament.prizePool}
                        </div>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">1º Lugar</div>
                        <div className="text-sm font-black text-emerald-400 font-mono">
                          🪙 {selectedTournament.prizes.first}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divisão de Premiação */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5">
                      <div className="text-amber-400 font-black text-sm">🥇 1º Lugar</div>
                      <div className="text-amber-300 font-mono font-bold mt-0.5">
                        🪙 {selectedTournament.prizes.first} moedas
                      </div>
                      <div className="text-[10px] text-slate-400">60% do Pote</div>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
                      <div className="text-slate-200 font-black text-sm">🥈 2º Lugar</div>
                      <div className="text-slate-300 font-mono font-bold mt-0.5">
                        🪙 {selectedTournament.prizes.second} moedas
                      </div>
                      <div className="text-[10px] text-slate-400">25% do Pote</div>
                    </div>
                    <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-2.5">
                      <div className="text-amber-600 font-black text-sm">🥉 3º Lugar</div>
                      <div className="text-amber-400 font-mono font-bold mt-0.5">
                        🪙 {selectedTournament.prizes.third} moedas
                      </div>
                      <div className="text-[10px] text-slate-400">15% do Pote</div>
                    </div>
                  </div>

                  {/* Lista de Participantes & Classificação */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2.5">
                      <span>Participantes Confirmados ({selectedTournament.participants.length}/{selectedTournament.maxParticipants})</span>
                      <span className="text-slate-500">Ordenado por Pontuação</span>
                    </div>

                    {selectedTournament.participants.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                        Nenhum competidor inscrito ainda. Seja o primeiro a entrar!
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {[...selectedTournament.participants]
                          .sort((a, b) => b.score - a.score)
                          .map((participant, index) => {
                            const isMe = participant.id === userProfile.id;
                            return (
                              <div
                                key={participant.id}
                                className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                                  isMe
                                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                                    : 'bg-slate-950 border-slate-800/80 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-6 text-center font-black font-mono text-xs text-slate-400">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                  </div>
                                  <PlayerAvatar
                                    avatar={participant.avatar}
                                    avatarColor={participant.avatarColor}
                                    size="sm"
                                  />
                                  <div className="leading-tight">
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                      <span>{participant.nickname || participant.name}</span>
                                      {isMe && (
                                        <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1 rounded">
                                          VOCÊ
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      Partidas: {participant.matchesPlayed} · Vitórias: {participant.wins}
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="text-xs font-black font-mono text-amber-400">
                                    {participant.score} pts
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Selecione um torneio na aba "Torneios Abertos" para visualizar o chaveamento.
                </div>
              )}
            </div>
          )}

          {/* ABA 3: CRIAR TORNEIO */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 max-w-xl mx-auto">
              <div>
                <h3 className="text-base font-black text-white font-['Outfit']">Criar Torneio Comunitário</h3>
                <p className="text-xs text-slate-400">
                  Crie sua própria copa com amigos ou com a comunidade MALM. Defina o modo de jogo e taxa de entrada.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Torneio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Taça Amigos do Stop 2026"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Modo de Jogo</label>
                  <select
                    value={createMode}
                    onChange={(e) => setCreateMode(e.target.value as GameMode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="uno">JOGO UNO (Cartas & Ação)</option>
                    <option value="stop_termo">STOP + TERMO (Com Votação)</option>
                    <option value="termo_multiplayer">TERMO COLETIVO (Palavra Secreta)</option>
                    <option value="forca">JOGO DA FORCA (Infância)</option>
                    <option value="juice_photo">MODO JUICE (Fotos do Brasil)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Taxa de Entrada (Moedas)</label>
                    <select
                      value={createFee}
                      onChange={(e) => setCreateFee(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="0">0 (Grátis)</option>
                      <option value="25">25 MALM Coins</option>
                      <option value="50">50 MALM Coins</option>
                      <option value="100">100 MALM Coins</option>
                      <option value="200">200 MALM Coins</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Máximo de Participantes</label>
                    <select
                      value={createMaxPlayers}
                      onChange={(e) => setCreateMaxPlayers(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="4">4 Jogadores (Semifinal)</option>
                      <option value="8">8 Jogadores (Quartas de final)</option>
                      <option value="16">16 Jogadores (Copa Completa)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição / Regras (Opcional)</label>
                  <textarea
                    rows={2}
                    placeholder="Regras especiais da sala ou instruções para os participantes..."
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Torneio na Arena</span>
              </button>
            </form>
          )}

          {/* ABA 4: LOJA DE MOEDAS & RECARGA */}
          {activeTab === 'shop' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">Banco de Competições</div>
                  <h3 className="text-xl font-black text-white font-['Outfit'] mt-0.5">Pacotes de MALM Coins</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Moedas usadas para inscrições nos torneios com prêmios e personalizações cosméticas.
                  </p>
                </div>

                <div className="bg-slate-950 border border-amber-500/30 px-4 py-2.5 rounded-2xl text-center shrink-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Seu Saldo Atual</div>
                  <div className="text-xl font-black text-amber-300 font-mono">🪙 {playerCoins}</div>
                </div>
              </div>

              {/* Pacotes de Recarga */}
              <div className="grid sm:grid-cols-3 gap-3">
                {/* Pacote Básico */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Iniciante</div>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-1">200</div>
                    <div className="text-xs text-slate-400 font-semibold">MALM Coins</div>
                  </div>
                  <div className="text-base font-black text-white">R$ 4,90</div>
                  <button
                    onClick={() => handleBuyCoins(200, 'R$ 4,90')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-colors cursor-pointer active:scale-95"
                  >
                    Recarregar (Teste)
                  </button>
                </div>

                {/* Pacote Popular */}
                <div className="bg-gradient-to-b from-amber-500/10 to-slate-900 border border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between gap-3 text-center relative shadow-lg shadow-amber-500/10">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    MAIS POPULAR
                  </span>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-300">Competidor</div>
                    <div className="text-2xl font-black text-amber-300 font-mono mt-1">600</div>
                    <div className="text-xs text-amber-200/80 font-semibold">+100 Bônus</div>
                  </div>
                  <div className="text-base font-black text-white">R$ 9,90</div>
                  <button
                    onClick={() => handleBuyCoins(600, 'R$ 9,90')}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Recarregar (Teste)
                  </button>
                </div>

                {/* Pacote Pro */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Campeão Pro</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-1">1.500</div>
                    <div className="text-xs text-slate-400 font-semibold">+350 Bônus</div>
                  </div>
                  <div className="text-base font-black text-white">R$ 19,90</div>
                  <button
                    onClick={() => handleBuyCoins(1500, 'R$ 19,90')}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-colors cursor-pointer active:scale-95"
                  >
                    Recarregar (Teste)
                  </button>
                </div>
              </div>

              {/* Informações de Transparência e Monetização */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 space-y-1.5">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Como funciona a monetização de torneios?</span>
                </div>
                <p className="leading-relaxed">
                  Em cada torneio com taxa de entrada, 80% do valor arrecadado é injetado diretamente no Pote de Premiação distribuído aos 3 melhores colocados (1º lugar: 60%, 2º lugar: 25%, 3º lugar: 15%). A taxa da plataforma (20%) financia servidores, prêmios diários e torneios gratuitos!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
