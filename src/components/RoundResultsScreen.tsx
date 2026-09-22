/**
 * Round Results Screen for STOP + TERMO
 * Apresenta o resultado da rodada, respostas reveladas, pontuação e palavras válidas do dicionário.
 */

import React, { useEffect } from 'react';
import { Check, X, Sparkles, Zap, ArrowRight, BookOpen, Trophy, PartyPopper } from 'lucide-react';
import { motion } from 'motion/react';
import { PlayerAnswer, RoomState } from '../types.ts';
import { sound } from '../utils/audio.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';
import { triggerWinnerConfetti } from '../utils/confetti.ts';

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

  useEffect(() => {
    if (myAnswer?.isValid) {
      triggerWinnerConfetti();
    }
  }, [myAnswer?.isValid]);

  if (!round) return null;

  const isLastRound = room.currentRoundIndex >= room.settings.totalRounds;

  const handleManualCelebration = () => {
    sound.playVictory();
    triggerWinnerConfetti(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6"
    >
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            Rodada {round.roundNumber} Concluída
          </span>
          <button
            onClick={handleManualCelebration}
            title="Soltar confetes!"
            className="text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center gap-1 transition-all active:scale-95 shadow-sm"
          >
            <PartyPopper className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Celebrar!</span>
          </button>
        </div>
        <h2 className="text-3xl font-black text-white font-['Outfit'] tracking-tight">RODADA ENCERRADA</h2>
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

      {/* Forca Challenge Reveal */}
      {round.forcaChallenge && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-xl text-center space-y-1">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <span>Palavra Secreta da Forca • {round.forcaChallenge.category}</span>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-widest uppercase">
            {round.forcaChallenge.word}
          </div>
          {round.forcaChallenge.hint && (
            <div className="text-xs text-slate-400">
              Dica: {round.forcaChallenge.hint}
            </div>
          )}
        </div>
      )}

      {/* Secret Word Reveal (Termo Mode) */}
      {round.targetWord && !round.photoChallenge && !round.forcaChallenge && (
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
            myAnswer.isValid || myAnswer.forcaWon
              ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-emerald-500/10'
              : 'bg-rose-950/40 border-rose-500/50 text-white shadow-rose-500/10'
          }`}
        >
          {room.settings.gameMode === 'forca' ? (
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resultado no Jogo da Forca
              </div>
              {myAnswer.forcaWon || myAnswer.isValid ? (
                <>
                  <div className="text-xl sm:text-2xl font-black text-emerald-300 flex items-center justify-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span>VOCÊ SALVOU O BONECO! 🎉</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    +{myAnswer.points} pts
                  </div>
                  <div className="text-xs text-slate-300">
                    {myAnswer.forcaWrongCount === 0
                      ? 'Incrível! Nenhum erro cometido!'
                      : `Apenas ${myAnswer.forcaWrongCount} erro(s) na rodada!`}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-rose-300 flex items-center justify-center gap-1.5">
                    <span>💀 Boneco Enforcado! (0 pts)</span>
                  </div>
                  <div className="text-xs text-rose-300/90 font-medium">
                    {myAnswer.validationReason || 'O boneco foi enforcado após 6 erros.'}
                  </div>
                </>
              )}
            </div>
          ) : room.settings.gameMode === 'termo_multiplayer' ? (
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resultado no Termo Coletivo
              </div>
              {myAnswer.isValid ? (
                <>
                  <div className="text-xl sm:text-2xl font-black text-emerald-300 flex items-center justify-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span>VOCÊ VENCEU A RODADA!</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    +{myAnswer.points} pts
                  </div>
                  <div className="text-xs text-slate-300">
                    {myAnswer.validationReason || `Acertou em ${myAnswer.termoGuesses?.length || 1} tentativa(s)!`}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-rose-300 flex items-center justify-center gap-1.5">
                    <span>Sem pontos nesta rodada</span>
                  </div>
                  <div className="text-xs text-rose-300/90 font-medium">
                    {myAnswer.validationReason || 'Apenas o primeiro jogador a acertar a palavra vence e pontua na rodada.'}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
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
            </>
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
          <span>Jogador & Desempenho</span>
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
                      <div className="text-xs font-mono flex items-center gap-1 mt-0.5 flex-wrap">
                        {room.settings.gameMode === 'forca' ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={answer.isValid || answer.forcaWon ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                              {answer.isValid || answer.forcaWon
                                ? `Salvou o boneco (${answer.forcaWrongCount || 0} erros)`
                                : `Enforcado (${answer.forcaWrongCount || 6}/6 erros)`}
                            </span>
                            {answer.isValid && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black border border-amber-500/30">
                                🏆 VENCEDOR
                              </span>
                            )}
                          </div>
                        ) : room.settings.gameMode === 'termo_multiplayer' ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={answer.isValid ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                              {answer.isValid
                                ? `Venceu na ${answer.termoGuesses?.length || 1}ª tentativa`
                                : `${answer.termoGuesses?.length || 0}/5 tentativas`}
                            </span>
                            {answer.isValid ? (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-black border border-amber-500/30">
                                🏆 VENCEDOR DA RODADA
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                0 pts
                              </span>
                            )}
                          </div>
                        ) : (
                          <>
                            <span className={answer.isValid ? 'text-emerald-300 font-bold' : 'text-rose-400 line-through'}>
                              {answer.rawAnswer.toUpperCase()}
                            </span>
                            {answer.isValid ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 inline shrink-0" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-rose-400 inline shrink-0" />
                            )}
                            {answer.isPartial && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold border border-amber-500/30 shrink-0">
                                ⚡ Meio Certa (50%)
                              </span>
                            )}
                            {answer.isUnique && answer.isValid && !answer.isPartial && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold ml-1 shrink-0">
                                Única
                              </span>
                            )}
                          </>
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
    </motion.div>
  );
};
