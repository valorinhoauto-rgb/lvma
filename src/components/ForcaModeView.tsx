/**
 * Jogo da Forca (Hangman) - Clássico Nostálgico em Dupla & Multiplayer
 * Suporta modo sala multiplayer com duelo simultâneo entre duplas/jogadores,
 * e modo local "Desafio do Amigo" (um escolhe a palavra e o outro adivinha).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  HelpCircle,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Users,
  Eye,
  EyeOff,
  Lightbulb,
  PartyPopper
} from 'lucide-react';
import { Player, PlayerAnswer, RoundConfig } from '../types.ts';
import { normalizeForcaString, ForcaChallenge } from '../data/forcaWords.ts';
import { sound } from '../utils/audio.ts';
import { triggerWinnerConfetti } from '../utils/confetti.ts';

interface ForcaModeViewProps {
  round: RoundConfig;
  players: Player[];
  currentUserId: string;
  hasAnswered: boolean;
  roundAnswers: Record<string, PlayerAnswer>;
  onSubmitGuess: (guess: string) => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const ForcaModeView: React.FC<ForcaModeViewProps> = ({
  round,
  players,
  currentUserId,
  hasAnswered,
  roundAnswers,
  onSubmitGuess
}) => {
  const challenge = round.forcaChallenge;
  const targetWord = challenge?.word || round.targetWord || 'FORCA';
  const targetNormalized = challenge?.normalized || normalizeForcaString(targetWord);
  const targetLength = targetNormalized.length;

  const myAnswer = roundAnswers[currentUserId];
  const myGuesses = myAnswer?.forcaGuesses || [];
  const wrongCount = Math.min(6, myAnswer?.forcaWrongCount || 0);
  const isWon = Boolean(myAnswer?.forcaWon || myAnswer?.guessedTarget);
  const isHanged = wrongCount >= 6;
  const isFinished = isWon || isHanged || hasAnswered;

  const [showFullWordModal, setShowFullWordModal] = useState(false);
  const [fullWordInput, setFullWordInput] = useState('');
  const [showHint, setShowHint] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [lastGuessedLetter, setLastGuessedLetter] = useState<string | null>(null);

  // Trigger celebration on winning
  useEffect(() => {
    if (isWon) {
      sound.playVictory();
      triggerWinnerConfetti();
    } else if (isHanged) {
      sound.playError();
    }
  }, [isWon, isHanged]);

  // Handle letter guess
  const handleLetterClick = useCallback(
    (letter: string) => {
      if (isFinished || myGuesses.includes(letter)) return;

      const normLetter = normalizeForcaString(letter);
      setLastGuessedLetter(normLetter);

      const isHit = targetNormalized.includes(normLetter);
      if (isHit) {
        sound.playSuccess();
        setFeedbackMessage(`A letra "${normLetter}" existe na palavra!`);
      } else {
        sound.playError();
        setFeedbackMessage(`Ops! Não tem a letra "${normLetter}". Perdeu 1 vida!`);
      }

      onSubmitGuess(normLetter);
    },
    [isFinished, myGuesses, targetNormalized, onSubmitGuess]
  );

  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || showFullWordModal) return;

      // Check if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toUpperCase();
      if (/^[A-ZÇ]$/.test(key)) {
        handleLetterClick(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLetterClick, isFinished, showFullWordModal]);

  // Submit full word guess
  const handleFullWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullWordInput.trim() || isFinished) return;

    const clean = normalizeForcaString(fullWordInput);
    if (clean.length < 2) return;

    if (clean === targetNormalized) {
      sound.playVictory();
      triggerWinnerConfetti();
      setFeedbackMessage(`🎉 ACERTOU! A palavra inteira era ${targetWord}!`);
    } else {
      sound.playError();
      setFeedbackMessage(`❌ Errou o chute! Perdeu 2 vidas!`);
    }

    onSubmitGuess(clean);
    setShowFullWordModal(false);
    setFullWordInput('');
  };

  // Remaining lives (out of 6)
  const remainingLives = Math.max(0, 6 - wrongCount);

  // Opponents list in the room
  const opponents = players.filter(p => p.id !== currentUserId);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 p-4 sm:p-6 select-none">
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-bold rounded-full border border-amber-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rodada {round.roundNumber} de {round.totalRounds}</span>
          </div>

          <div className="px-3 py-1 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold rounded-full border border-blue-500/30">
            {challenge?.category || round.categoryName || 'Jogo da Forca'}
          </div>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            {targetLength} letras
          </span>
        </div>

        {/* Lives / Chances Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 mr-1 hidden sm:inline">
            Vidas:
          </span>
          {Array.from({ length: 6 }).map((_, idx) => {
            const isAlive = idx < remainingLives;
            return (
              <motion.div
                key={idx}
                initial={false}
                animate={{ scale: isAlive ? 1 : 0.8, opacity: isAlive ? 1 : 0.25 }}
                className="text-rose-500"
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isAlive ? 'fill-rose-500 text-rose-500' : 'text-slate-400 fill-transparent'
                  }`}
                />
              </motion.div>
            );
          })}
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-1">
            {remainingLives}/6
          </span>
        </div>
      </div>

      {/* Main Game Stage: Gallows + Secret Word */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Gallows SVG Graphic (4 cols on desktop) */}
        <div className="md:col-span-4 bg-gradient-to-b from-amber-50/50 to-orange-50/30 dark:from-slate-900 dark:to-slate-900/50 p-4 rounded-3xl border border-amber-200/60 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden min-h-[260px]">
          {/* Hangman SVG */}
          <div className="w-48 h-56 relative flex items-center justify-center">
            <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-sm">
              {/* Gallows Wood Beam Structures */}
              {/* Ground beam */}
              <line x1="20" y1="220" x2="110" y2="220" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
              {/* Vertical pole */}
              <line x1="50" y1="220" x2="50" y2="20" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
              {/* Top horizontal arm */}
              <line x1="46" y1="24" x2="145" y2="24" stroke="#78350f" strokeWidth="8" strokeLinecap="round" />
              {/* Diagonal support beam */}
              <line x1="50" y1="65" x2="90" y2="24" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
              {/* Rope hanging down */}
              <line x1="140" y1="24" x2="140" y2="55" stroke="#d97706" strokeWidth="4" strokeDasharray="2 1" />
              {/* Noose Loop */}
              <circle cx="140" cy="58" r="4" fill="none" stroke="#b45309" strokeWidth="3" />

              {/* STICKMAN BODY PARTS (Rendered based on wrongCount) */}
              {/* Part 1: Head */}
              {wrongCount >= 1 && (
                <g className="transition-all duration-300">
                  <circle
                    cx="140"
                    cy="80"
                    r="20"
                    fill={isWon ? '#10b981' : isHanged ? '#f43f5e' : '#f59e0b'}
                    stroke={isWon ? '#047857' : isHanged ? '#be123c' : '#b45309'}
                    strokeWidth="3.5"
                  />
                  {/* Eyes & Mouth Expression */}
                  {isWon ? (
                    // Happy face!
                    <>
                      <path d="M 133 76 Q 135 72 137 76" stroke="#ffffff" strokeWidth="2.5" fill="none" />
                      <path d="M 143 76 Q 145 72 147 76" stroke="#ffffff" strokeWidth="2.5" fill="none" />
                      <path d="M 133 86 Q 140 94 147 86" stroke="#ffffff" strokeWidth="2.5" fill="none" />
                    </>
                  ) : isHanged ? (
                    // X_X Eyes (Hanged)
                    <>
                      <line x1="132" y1="74" x2="137" y2="79" stroke="#ffffff" strokeWidth="2" />
                      <line x1="137" y1="74" x2="132" y2="79" stroke="#ffffff" strokeWidth="2" />
                      <line x1="143" y1="74" x2="148" y2="79" stroke="#ffffff" strokeWidth="2" />
                      <line x1="148" y1="74" x2="143" y2="79" stroke="#ffffff" strokeWidth="2" />
                      <line x1="134" y1="89" x2="146" y2="89" stroke="#ffffff" strokeWidth="2.5" />
                    </>
                  ) : (
                    // Normal / Worried Face
                    <>
                      <circle cx="134" cy="76" r="2.5" fill="#1e293b" />
                      <circle cx="146" cy="76" r="2.5" fill="#1e293b" />
                      <path
                        d={wrongCount >= 4 ? 'M 134 89 Q 140 83 146 89' : 'M 135 88 Q 140 91 145 88'}
                        stroke="#1e293b"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    </>
                  )}
                </g>
              )}

              {/* Part 2: Torso */}
              {wrongCount >= 2 && (
                <line
                  x1="140"
                  y1="100"
                  x2="140"
                  y2="155"
                  stroke={isWon ? '#10b981' : isHanged ? '#f43f5e' : '#334155'}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              )}

              {/* Part 3: Left Arm */}
              {wrongCount >= 3 && (
                <line
                  x1="140"
                  y1="115"
                  x2="115"
                  y2="135"
                  stroke={isWon ? '#10b981' : isHanged ? '#f43f5e' : '#334155'}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              )}

              {/* Part 4: Right Arm */}
              {wrongCount >= 4 && (
                <line
                  x1="140"
                  y1="115"
                  x2="165"
                  y2="135"
                  stroke={isWon ? '#10b981' : isHanged ? '#f43f5e' : '#334155'}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              )}

              {/* Part 5: Left Leg */}
              {wrongCount >= 5 && (
                <line
                  x1="140"
                  y1="155"
                  x2="120"
                  y2="195"
                  stroke={isWon ? '#10b981' : isHanged ? '#f43f5e' : '#334155'}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              )}

              {/* Part 6: Right Leg */}
              {wrongCount >= 6 && (
                <line
                  x1="140"
                  y1="155"
                  x2="160"
                  y2="195"
                  stroke={isWon ? '#10b981' : isHanged ? '#f43f5e' : '#334155'}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>

          {/* Status Badge Under Gallows */}
          <div className="mt-2 text-center">
            {isWon ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Boneco Salvo! 🎉
              </span>
            ) : isHanged ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-full border border-rose-500/30">
                <XCircle className="w-3.5 h-3.5" />
                Enforcado! 💀
              </span>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {wrongCount === 0 ? 'Nenhum erro ainda. Mantenha o foco!' : `${wrongCount} de 6 erros cometidos`}
              </span>
            )}
          </div>
        </div>

        {/* Secret Word & Hint Arena (8 cols on desktop) */}
        <div className="md:col-span-8 flex flex-col justify-between gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* Hint Card */}
          {challenge?.hint && (
            <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Dica Especial:
                  </span>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    {showHint ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showHint ? 'Ocultar' : 'Ver dica'}
                  </button>
                </div>
                {showHint ? (
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium mt-0.5">
                    {challenge.hint}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic mt-0.5">Dica oculta para maior desafio.</p>
                )}
              </div>
            </div>
          )}

          {/* Secret Word Slots Display */}
          <div className="py-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {targetNormalized.split('').map((letter, idx) => {
              const isRevealed = myGuesses.includes(letter) || isFinished;
              const isMissingAtEnd = isHanged && !myGuesses.includes(letter);

              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`w-10 h-14 sm:w-12 sm:h-16 rounded-xl border-b-4 flex items-center justify-center font-black text-xl sm:text-2xl transition-all shadow-sm ${
                    isRevealed
                      ? isWon
                        ? 'bg-emerald-500 text-white border-emerald-700 shadow-emerald-500/20'
                        : isMissingAtEnd
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600'
                      : 'bg-slate-50 dark:bg-slate-900 text-transparent border-slate-400 dark:border-slate-700'
                  }`}
                >
                  {isRevealed ? (
                    <motion.span
                      initial={{ scale: 0.5, y: -5 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      {letter}
                    </motion.span>
                  ) : (
                    <span className="w-4 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Feedback message banner */}
          {feedbackMessage && (
            <div className="text-center text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 min-h-[20px]">
              {feedbackMessage}
            </div>
          )}

          {/* Action Bar: "Arriscar Palavra" and Celebration button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              💡 Digite no teclado físico ou clique nas letras abaixo
            </div>

            <div className="flex items-center gap-2">
              {!isFinished && (
                <button
                  type="button"
                  onClick={() => setShowFullWordModal(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Arriscar Palavra Completa</span>
                </button>
              )}

              {isWon && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playVictory();
                    triggerWinnerConfetti();
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PartyPopper className="w-3.5 h-3.5" />
                  <span>Celebrar Vitória!</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Opponents Live Status (Duelo de Dupla / Multiplayer) */}
      {opponents.length > 0 && (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span>Placar do Duelo com a Dupla / Adversários:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {opponents.map(opp => {
              const oppAns = roundAnswers[opp.id];
              const oppWrong = Math.min(6, oppAns?.forcaWrongCount || 0);
              const oppWon = Boolean(oppAns?.forcaWon || oppAns?.guessedTarget);
              const oppHanged = oppWrong >= 6;

              return (
                <div
                  key={opp.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                      {opp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                        {opp.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {oppWon ? '🎉 Acertou!' : oppHanged ? '💀 Enforcado' : `${oppWrong}/6 erros`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {oppWon ? (
                      <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-md">
                        Venceu!
                      </span>
                    ) : oppHanged ? (
                      <span className="px-2 py-0.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[11px] font-bold rounded-md">
                        0 pts
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {oppAns?.forcaRevealedCount || 0} letras
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Virtual Keyboard */}
      <div className="bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-1.5 sm:gap-2">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-center gap-1 sm:gap-1.5 w-full max-w-2xl">
            {row.map(letter => {
              const isTried = myGuesses.includes(letter);
              const isCorrect = isTried && targetNormalized.includes(letter);
              const isWrong = isTried && !targetNormalized.includes(letter);

              let keyClasses =
                'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700';

              if (isCorrect) {
                keyClasses = 'bg-emerald-500 text-white border-emerald-600 opacity-90 shadow-emerald-500/20';
              } else if (isWrong) {
                keyClasses =
                  'bg-slate-300 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 line-through opacity-40 border-transparent';
              }

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={isTried || isFinished}
                  onClick={() => handleLetterClick(letter)}
                  className={`h-10 sm:h-12 flex-1 max-w-[44px] rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95 select-none ${keyClasses}`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Modal: Chutar a Palavra Completa */}
      <AnimatePresence>
        {showFullWordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-600 rounded-xl">
                    <Zap className="w-5 h-5 fill-amber-500" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Arriscar Palavra Inteira
                  </h3>
                </div>
                <button
                  onClick={() => setShowFullWordModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4">
                Tem certeza de qual é a palavra? Se acertar, você ganha a rodada imediatamente!
                <span className="block mt-1 font-bold text-rose-500">
                  ⚠️ Atenção: Se errar, você perde 2 vidas na forca!
                </span>
              </p>

              <form onSubmit={handleFullWordSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  autoFocus
                  placeholder={`Palavra com ${targetLength} letras...`}
                  value={fullWordInput}
                  onChange={e => setFullWordInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 text-center text-lg font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowFullWordModal(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!fullWordInput.trim()}
                    className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md disabled:opacity-50"
                  >
                    Confirmar Chute!
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
