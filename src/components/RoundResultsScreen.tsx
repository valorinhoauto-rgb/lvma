/**
 * Round Results Screen for STOP + TERMO
 * Apresenta o resultado da rodada, respostas reveladas, pontuação e palavras válidas do dicionário.
 */

import React from 'react';
import { Check, X, Sparkles, Zap, ArrowRight, BookOpen, Crown } from 'lucide-react';
import { Player, PlayerAnswer, RoundConfig, RoomState } from '../types.ts';
import { sound } from '../utils/audio.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';

interface RoundResultsScreenProps {
  room: RoomState;
  currentUserId: string;
  onNextRound: () => void;
}

export const RoundResultsScreen: React.FC<RoundResultsScreenProps> = ({
  room,
  currentUserId,
  onNextRound
}) => {
  const round = room.currentRound;
  const isHost = room.hostId === currentUserId;
  const myAnswer: PlayerAnswer | undefined = room.roundAnswers[currentUserId];

  if (!round) return null;

  const isLastRound = room.currentRoundIndex >= room.settings.totalRounds;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
          Rodada {round.roundNumber} Concluída
        </span>
        <h2 className="text-3xl font-black text-white font-['Outfit']">RODADA ENCERRADA</h2>
        <div className="text-sm font-extrabold text-slate-300 flex items-center justify-center gap-2">
          <span className="text-emerald-400 font-mono text-base">{round.letter.toUpperCase()}</span>
          <span>•</span>
          <span className="text-white">{round.categoryName}</span>
          <span>•</span>
          <span className="text-amber-300 font-mono text-base">{round.wordLength} Letras</span>
        </div>
      </div>

      {/* Juice Photo Challenge Reveal */}
      {round.photoChallenge && (
        <div className="bg-slate-900 border border-pink-500/30 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-700">
            <img
              src={round.photoChallenge.imageUrl}
              alt={round.photoChallenge.targetName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/api/image-proxy')) {
                  target.src = `/api/image-proxy?url=${encodeURIComponent(round.photoChallenge!.imageUrl)}`;
                }
              }}
            />
          </div>
          <div className="space-y-1 flex-1">
            <div className="text-[11px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Resposta Revelada</span>
              {round.photoChallenge.isBrazilian && (
                <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded font-bold border border-pink-500/30">
                  🇧🇷 Brasil
                </span>
              )}
            </div>
            <div className="text-xl font-black text-white font-mono">
              {round.photoChallenge.targetName}
            </div>
            <div className="text-xs text-slate-400">
              {round.photoChallenge.hint}
            </div>
          </div>
        </div>
      )}

      {/* Secret Word Reveal (Termo Mode) */}
      {round.targetWord && !round.photoChallenge && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-xl text-center space-y-1">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            Palavra Secreta do Termo
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-widest uppercase">
            {round.targetWord}
          </div>
        </div>
      )}

      {/* User's Personal Result Card */}
      {myAnswer ? (
        <div
          className={`p-5 rounded-2xl border text-center space-y-2 shadow-xl ${
            myAnswer.isValid
              ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-emerald-500/10'
              : 'bg-rose-950/40 border-rose-500/50 text-white shadow-rose-500/10'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Sua Resposta</div>
          <div className="text-2xl font-black font-mono tracking-wider">
            {myAnswer.rawAnswer.toUpperCase()}{' '}
            {myAnswer.isValid ? (
              <span className="text-emerald-400 inline-block">✅</span>
            ) : (
              <span className="text-rose-400 inline-block">❌</span>
            )}
          </div>

          {myAnswer.isValid ? (
            <div className="space-y-1">
              <div className="text-2xl font-black text-emerald-300">+{myAnswer.points} pontos</div>
              {myAnswer.breakdown && (
                <div className="flex items-center justify-center gap-3 text-xs text-slate-300 font-medium">
                  <span>Base: {myAnswer.breakdown.base}</span>
                  {myAnswer.breakdown.speedBonus > 0 && (
                    <span className="text-teal-300 flex items-center gap-0.5">
                      <Zap className="w-3 h-3" /> +{myAnswer.breakdown.speedBonus} vel.
                    </span>
                  )}
                  {myAnswer.breakdown.rarityBonus > 0 && (
                    <span className="text-amber-300 flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3" /> +{myAnswer.breakdown.rarityBonus} raridade única!
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-rose-300 font-medium">
              {myAnswer.validationReason || 'Resposta não aceita.'}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 text-center text-slate-400 text-xs">
          Tempo esgotado antes de enviar uma resposta. (0 pts)
        </div>
      )}

      {/* Answers Table for all players */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Jogador & Resposta</span>
          <span>Pontos</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {room.players.map((player) => {
            const answer = room.roundAnswers[player.id];
            const isMe = player.id === currentUserId;

            return (
              <div
                key={player.id}
                className={`p-3.5 flex items-center justify-between gap-3 ${
                  isMe ? 'bg-emerald-500/5' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PlayerAvatar
                    avatar={player.avatar}
                    avatarColor={player.avatarColor}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                      <span>{player.name}</span>
                      {isMe && <span className="text-[10px] text-emerald-400 font-medium">(Você)</span>}
                    </div>

                    {answer ? (
                      <div className="text-xs font-mono flex items-center gap-1 mt-0.5">
                        <span className={answer.isValid ? 'text-emerald-300 font-bold' : 'text-rose-400 line-through'}>
                          {answer.rawAnswer.toUpperCase()}
                        </span>
                        {answer.isValid ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 inline shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-rose-400 inline shrink-0" />
                        )}
                        {answer.isUnique && answer.isValid && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold ml-1 shrink-0">
                            Única
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">Sem resposta</div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-white">
                    {answer ? `+${answer.points}` : '0'} pts
                  </div>
                  <div className="text-[11px] text-slate-400">Total: {player.score} pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Valid Dictionary Words Sample */}
      {room.sampleValidAnswers && room.sampleValidAnswers.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Outras respostas válidas no banco:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {room.sampleValidAnswers.map((word, idx) => (
              <span
                key={idx}
                className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-mono font-medium"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next Round CTA */}
      <div className="pt-2">
        {isHost ? (
          <button
            id="btn-next-round"
            onClick={() => {
              sound.playClick();
              onNextRound();
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>{isLastRound ? 'VER RESULTADO FINAL' : 'PRÓXIMA RODADA'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="text-center p-3 text-xs text-slate-400 font-medium">
            Aguardando o anfitrião avançar para a próxima rodada...
          </div>
        )}
      </div>
    </div>
  );
};
