/**
 * Modo TERMO Coletivo / Multiplayer
 * 5 chances para adivinhar a palavra secreta (como no original).
 * Sem limite de tempo.
 * Visualização lado a lado das tentativas dos adversários em tempo real (apenas cores: verde, amarelo ou vermelho).
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Users, CheckCircle2, XCircle, EyeOff, Sparkles, Timer } from 'lucide-react';
import { LetterStatus, Player, PlayerAnswer, RoundConfig, TermoGuessResult } from '../types.ts';
import { sound } from '../utils/audio.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';

interface MultiplayerTermoViewProps {
  round: RoundConfig;
  players: Player[];
  currentUserId: string;
  hasAnswered: boolean;
  onSubmitGuess: (guess: string) => void;
  guesses: TermoGuessResult[];
  roundAnswers?: Record<string, PlayerAnswer>;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
];

export const MultiplayerTermoView: React.FC<MultiplayerTermoViewProps> = ({
  round,
  players,
  currentUserId,
  hasAnswered,
  onSubmitGuess,
  guesses,
  roundAnswers = {}
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const wordLength = round.wordLength || 5;
  const maxTries = 5; // 5 chances de acertar como é no original

  const hasWon = guesses.some(g => g.isCorrect);
  const isOutOfTries = guesses.length >= maxTries;
  const isGameOver = hasWon || isOutOfTries || hasAnswered;

  // Cronômetro progressivo de tempo decorrido (sem limite estrito de tempo)
  useEffect(() => {
    const start = round.startedAt || Date.now();
    const tick = () => {
      const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
      setElapsedSeconds(diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [round.startedAt]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  };

  // Mapeamento de status das letras para o teclado virtual do jogador
  const letterStatuses: Record<string, LetterStatus> = {};
  for (const g of guesses) {
    g.normalized.split('').forEach((char, idx) => {
      const current = letterStatuses[char];
      const status = g.letterStatuses[idx];
      if (status === 'correct') {
        letterStatuses[char] = 'correct';
      } else if (status === 'present' && current !== 'correct') {
        letterStatuses[char] = 'present';
      } else if (status === 'absent' && !current) {
        letterStatuses[char] = 'absent';
      }
    });
  }

  const handleKeyPress = (key: string) => {
    if (isGameOver) return;

    if (key === 'ENTER') {
      if (currentInput.length === wordLength) {
        sound.playClick();
        onSubmitGuess(currentInput);
        setCurrentInput('');
      } else {
        sound.playError();
      }
    } else if (key === 'DEL' || key === 'BACKSPACE') {
      sound.playKeypress();
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentInput.length < wordLength) {
      sound.playKeypress();
      setCurrentInput(prev => prev + key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        handleKeyPress('DEL');
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInput, isGameOver, wordLength]);

  const opponents = players.filter(p => p.id !== currentUserId);
  const myPlayer = players.find(p => p.id === currentUserId);

  return (
    <div id="multiplayer-termo-view" className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-5">
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Trophy className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">TERMO Multiplayer</span>
              <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium border border-slate-700">
                5 Tentativas
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">
              Tema: <span className="text-white font-bold">{round.categoryName}</span>
              <span className="text-slate-500 mx-2">•</span>
              Começa com <span className="text-amber-400 font-mono font-black text-base">{round.letter}</span>
              <span className="text-slate-500 mx-2">•</span>
              <span className="text-slate-300 font-mono">{wordLength} Letras</span>
            </div>
          </div>
        </div>

        {/* Sem limite de tempo + Relógio progressivo */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sem limite de tempo</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-sm text-slate-300">
            <Timer className="w-4 h-4 text-emerald-400" />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Side-by-Side Arena */}
      <div className={`grid grid-cols-1 ${opponents.length > 0 ? 'lg:grid-cols-12' : ''} gap-6 items-start`}>
        
        {/* COLUNA ESQUERDA: Seu Tabuleiro (Jogador Atual) */}
        <div className={`${opponents.length > 0 ? 'lg:col-span-7' : 'max-w-xl mx-auto w-full'} bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl`}>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <PlayerAvatar
                avatar={myPlayer?.avatar || '👤'}
                avatarColor={myPlayer?.avatarColor}
                size="md"
              />
              <div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>Seu Tabuleiro (Você)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    Você
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Tentativa {Math.min(guesses.length + (isGameOver ? 0 : 1), maxTries)} de {maxTries}
                </div>
              </div>
            </div>

            {hasWon ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Acertou! (+{roundAnswers[currentUserId]?.points || 0} pts)</span>
              </div>
            ) : isOutOfTries ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 px-3 py-1 rounded-xl">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>5 tentativas esgotadas</span>
              </div>
            ) : null}
          </div>

          {/* Grid das 5 tentativas do jogador */}
          <div className="flex flex-col items-center justify-center gap-2 py-2 select-none">
            {Array.from({ length: maxTries }).map((_, rowIndex) => {
              const guess = guesses[rowIndex];
              const isCurrentRow = rowIndex === guesses.length && !isGameOver;

              return (
                <div key={rowIndex} className="flex gap-2">
                  {Array.from({ length: wordLength }).map((_, colIndex) => {
                    let char = '';
                    let status: LetterStatus = 'empty';

                    if (guess) {
                      char = guess.normalized[colIndex] || '';
                      status = guess.letterStatuses[colIndex] || 'empty';
                    } else if (isCurrentRow) {
                      char = currentInput[colIndex] || '';
                    }

                    let colorClasses = 'bg-slate-950/90 border-slate-800 text-slate-300';
                    if (status === 'correct') {
                      // VERDE
                      colorClasses = 'bg-emerald-600 border-emerald-500 text-white font-black shadow-md shadow-emerald-600/30 scale-100';
                    } else if (status === 'present') {
                      // AMARELO
                      colorClasses = 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-100';
                    } else if (status === 'absent') {
                      // VERMELHO (conforme solicitado: verde, amarelo ou vermelho)
                      colorClasses = 'bg-rose-600 border-rose-500 text-white font-bold shadow-md shadow-rose-600/20 scale-100';
                    } else if (isCurrentRow && char) {
                      colorClasses = 'bg-slate-900 border-amber-400 text-white font-black scale-105 shadow-md shadow-amber-500/10';
                    }

                    return (
                      <div
                        key={colIndex}
                        className={`w-11 h-12 sm:w-13 sm:h-14 md:w-14 md:h-16 border-2 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl font-mono uppercase transition-all select-none ${colorClasses}`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Banner de status quando finalizou o próprio jogo */}
          {isGameOver && (
            <div className={`p-3 rounded-xl border text-center text-xs sm:text-sm font-bold animate-fade-in ${
              hasWon
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
            }`}>
              {hasWon
                ? `🎉 Parabéns! Você acertou na ${guesses.length}ª tentativa!`
                : 'Você esgotou as 5 tentativas.'}
              <div className="text-xs text-slate-400 font-normal mt-0.5">
                Acompanhe o tabuleiro dos outros jogadores ao lado em tempo real.
              </div>
            </div>
          )}

          {/* Teclado Virtual para digitação rápida */}
          <div className="pt-2 max-w-lg mx-auto space-y-1.5 sm:space-y-2 select-none">
            {KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
                {row.map((key) => {
                  const status = letterStatuses[key];
                  let btnColor = 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700';

                  if (status === 'correct') {
                    // VERDE
                    btnColor = 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/30';
                  } else if (status === 'present') {
                    // AMARELO
                    btnColor = 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-sm shadow-amber-500/30';
                  } else if (status === 'absent') {
                    // VERMELHO
                    btnColor = 'bg-rose-700 text-white border-rose-600 shadow-sm shadow-rose-700/20';
                  }

                  const isWide = key === 'ENTER' || key === 'DEL';

                  return (
                    <button
                      key={key}
                      disabled={isGameOver}
                      onClick={() => handleKeyPress(key)}
                      className={`h-10 sm:h-11 rounded-lg font-bold border text-xs sm:text-sm transition-all flex items-center justify-center select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
                        isWide ? 'px-2.5 sm:px-4 font-mono font-black' : 'w-7 sm:w-9'
                      } ${btnColor}`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="text-center text-[11px] text-slate-500">
            Você também pode digitar diretamente pelo seu teclado físico e pressionar Enter.
          </div>
        </div>

        {/* COLUNA DIREITA: Tabuleiros dos Adversários LADO A LADO */}
        {opponents.length > 0 ? (
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Tentativas dos Adversários</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Apenas cores (palavras ocultas)</span>
                </div>
              </div>

              {/* Lista dos tabuleiros dos oponentes */}
              <div className="space-y-4">
                {opponents.map((opponent) => {
                  const oppAnswer = roundAnswers[opponent.id];
                  const oppGuesses: TermoGuessResult[] = oppAnswer?.termoGuesses || [];
                  const oppWon = oppGuesses.some(g => g.isCorrect) || Boolean(oppAnswer?.isValid);
                  const oppOutOfTries = oppGuesses.length >= maxTries;
                  const oppFinished = opponent.hasAnswered || oppWon || oppOutOfTries;

                  return (
                    <div
                      key={opponent.id}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-2.5 transition-all hover:border-slate-700"
                    >
                      {/* Header do Adversário */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlayerAvatar
                            avatar={opponent.avatar}
                            avatarColor={opponent.avatarColor}
                            size="sm"
                          />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{opponent.name}</span>
                              {opponent.isBot && (
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                                  BOT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {oppWon ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Acertou em {oppGuesses.length} tentativa{oppGuesses.length > 1 ? 's' : ''}!
                                </span>
                              ) : oppOutOfTries ? (
                                <span className="text-rose-400 font-medium">Esgotou as 5 tentativas</span>
                              ) : oppGuesses.length > 0 ? (
                                <span className="text-amber-400 font-medium">Tentativa {oppGuesses.length}/{maxTries}</span>
                              ) : (
                                <span className="text-slate-500">Pensando no 1º palpite...</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status pill do adversário */}
                        <div>
                          {oppWon ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              +{oppAnswer?.points || 0} pts
                            </span>
                          ) : oppFinished ? (
                            <span className="text-[11px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
                              Concluído
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Jogando
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mini-Grid 5x5 do Adversário: MOSTRA APENAS AS CORES (VERDE, AMARELO, VERMELHO) */}
                      <div className="flex flex-col items-center justify-center gap-1.5 py-1 select-none">
                        {Array.from({ length: maxTries }).map((_, rowIndex) => {
                          const guess = oppGuesses[rowIndex];
                          const hasGuess = Boolean(guess);

                          return (
                            <div key={rowIndex} className="flex gap-1.5">
                              {Array.from({ length: wordLength }).map((_, colIndex) => {
                                const status: LetterStatus = guess ? (guess.letterStatuses[colIndex] || 'empty') : 'empty';

                                let tileColor = 'bg-slate-900/40 border-slate-800/80';
                                if (status === 'correct') {
                                  // VERDE: acertou letra e posição
                                  tileColor = 'bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-600/30';
                                } else if (status === 'present') {
                                  // AMARELO: letra existe na palavra em outra posição
                                  tileColor = 'bg-amber-500 border-amber-400 shadow-sm shadow-amber-500/30';
                                } else if (status === 'absent') {
                                  // VERMELHO: letra não existe na palavra (conforme solicitado pelo usuário)
                                  tileColor = 'bg-rose-600 border-rose-500 shadow-sm shadow-rose-600/20';
                                }

                                return (
                                  <div
                                    key={colIndex}
                                    title={hasGuess ? `Letra ${colIndex + 1}: ${status}` : 'Aguardando palpite'}
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center transition-all ${tileColor}`}
                                  >
                                    {/* Palavra do adversário é mantida oculta para não revelar o segredo */}
                                    {hasGuess && status === 'correct' && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legenda explicativa */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Legenda dos Quadrados do Adversário:
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-500" /> Verde = Letra correta
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-500 border border-amber-400" /> Amarelo = Posição errada
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-rose-600 border border-rose-500" /> Vermelho = Não tem
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs max-w-xl mx-auto space-y-2">
            <div className="text-slate-300 font-bold">Você está jogando em modo solo.</div>
            <div>Convide amigos ou adicione bots no lobby para ver as tentativas lado a lado em tempo real!</div>
          </div>
        )}
      </div>
    </div>
  );
};
