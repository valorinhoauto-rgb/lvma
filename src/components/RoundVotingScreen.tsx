/**
 * Tela de Julgamento / Votação Comunitária de Respostas (estilo STOP / Stopots)
 * Permite que os jogadores votem se aceitam ou rejeitam respostas da rodada,
 * inclusive aceitando zoeiras e termos contextuais mesmo fora do dicionário estrito.
 */

import React, { useEffect, useState } from 'react';
import { Check, X, ThumbsUp, ThumbsDown, Clock, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';
import { Player, PlayerAnswer, RoomState } from '../types.ts';
import { sound } from '../utils/audio.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';

interface RoundVotingScreenProps {
  room: RoomState;
  currentUserId: string;
  onVote: (targetPlayerId: string, approve: boolean) => void;
  onConcludeVoting: () => void;
}

export const RoundVotingScreen: React.FC<RoundVotingScreenProps> = ({
  room,
  currentUserId,
  onVote,
  onConcludeVoting
}) => {
  const round = room.currentRound;
  const isHost = room.hostId === currentUserId;
  const answers = Object.values(room.roundAnswers);

  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (!room.votingEndsAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.votingEndsAt! - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [room.votingEndsAt]);

  const handleVote = (targetPlayerId: string, approve: boolean) => {
    sound.playClick();
    onVote(targetPlayerId, approve);
  };

  return (
    <div id="round-voting-screen" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header do Julgamento */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Votação da Galera
              </span>
              <span className="text-xs text-slate-400">Rodada {round?.roundNumber} de {round?.totalRounds}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Julgamento das Respostas
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Votem para decidir quais palavras valem! Respostas criativas, gírias e zoeiras podem ser aprovadas pelo voto da maioria.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Cronômetro */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <div className="text-right">
                <div className="text-xs text-slate-400">Tempo de Voto</div>
                <div className="text-lg font-black text-amber-400 font-mono leading-none">{timeLeft}s</div>
              </div>
            </div>

            {/* Host Button */}
            {isHost && (
              <button
                id="btn-conclude-voting-host"
                onClick={() => {
                  sound.playClick();
                  onConcludeVoting();
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all"
              >
                Concluir Votação
              </button>
            )}
          </div>
        </div>

        {/* Critérios da Rodada */}
        {round && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critérios da Rodada:</span>
            <div className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-lg text-amber-300 text-xs font-bold">
              Letra: <span className="text-base text-white ml-1">{round.letter}</span>
            </div>
            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-300 text-xs font-bold">
              Tema: <span className="text-white ml-1">{round.categoryName}</span>
            </div>
            <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-300 text-xs font-bold">
              Tamanho: <span className="text-white ml-1">{round.wordLength} letras</span>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Respostas para Julgamento */}
      <div className="space-y-4">
        {answers.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400">
            Nenhum jogador enviou resposta nesta rodada.
          </div>
        ) : (
          answers.map((answer) => {
            const player = room.players.find(p => p.id === answer.playerId);
            const isSelf = answer.playerId === currentUserId;
            const votes = answer.votes || { yes: 0, no: 0, voterIds: {} };
            const myVote = votes.voterIds[currentUserId];
            const hasStartedWithLetter = round ? answer.normalizedAnswer.startsWith(round.letter) : true;
            const hasCorrectLength = round ? answer.normalizedAnswer.length === round.wordLength : true;

            const isApprovedSoFar = votes.yes >= votes.no;

            return (
              <div
                key={answer.playerId}
                id={`voting-card-${answer.playerId}`}
                className={`bg-slate-900 border rounded-2xl p-5 transition-all ${
                  isApprovedSoFar
                    ? 'border-slate-800 hover:border-emerald-500/30'
                    : 'border-red-950/40 bg-slate-900/90'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Informações do Jogador e Resposta */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar
                        avatar={player?.avatar || '👤'}
                        avatarColor={player?.avatarColor}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{player?.name || 'Jogador'}</span>
                          {isSelf && (
                            <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                              Você
                            </span>
                          )}
                          {player?.isBot && (
                            <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                              Bot
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-2xl md:text-3xl font-black text-amber-300 tracking-wider font-mono">
                        {answer.rawAnswer || '—'}
                      </div>
                    </div>

                    {/* Chips de Conformidade */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                        hasStartedWithLetter
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-300 border border-red-500/30'
                      }`}>
                        {hasStartedWithLetter ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Letra {round?.letter}
                      </span>

                      <span className={`px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                        hasCorrectLength
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      }`}>
                        {answer.normalizedAnswer.length} letras
                      </span>

                      {/* Indicador de dicionário */}
                      {answer.inDictionary ? (
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-indigo-400" />
                          No Dicionário
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-purple-400" />
                          Fora do Dicionário (Voto da Galera)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Votos e Controles */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {/* Placar de votos */}
                    <div className="flex items-center gap-4 px-3 py-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{votes.yes}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-red-400 font-bold text-sm">
                        <ThumbsDown className="w-4 h-4" />
                        <span>{votes.no}</span>
                      </div>
                    </div>

                    {/* Botões de Votação (Não vota em si mesmo para manter fair play, ou vota livre) */}
                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-vote-yes-${answer.playerId}`}
                        onClick={() => handleVote(answer.playerId, true)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          myVote === true
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-300'
                            : 'bg-slate-800 hover:bg-emerald-950/60 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Aceitar
                      </button>

                      <button
                        id={`btn-vote-no-${answer.playerId}`}
                        onClick={() => handleVote(answer.playerId, false)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          myVote === false
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 ring-2 ring-red-300'
                            : 'bg-slate-800 hover:bg-red-950/60 text-red-300 hover:text-red-200 border border-red-500/30'
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dica da Votação */}
      <div className="text-center text-xs text-slate-400 py-2">
        Dica: Se a resposta for uma zoeira aceita pelo grupo ou uma gíria conhecida no contexto da brincadeira, clique em <strong className="text-emerald-400">Aceitar</strong>!
      </div>
    </div>
  );
};
