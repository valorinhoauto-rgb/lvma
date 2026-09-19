/**
 * Round Screen for STOP + TERMO
 * A tela central e mais importante do jogo.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Send, Sparkles, AlertCircle, CheckCircle, Flame, ShieldAlert } from 'lucide-react';
import { Player, RoundConfig } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface RoundScreenProps {
  round: RoundConfig;
  players: Player[];
  currentUserId: string;
  hasAnswered: boolean;
  userAnswer?: string;
  lastValidation?: any;
  onSubmitAnswer: (answer: string) => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const RoundScreen: React.FC<RoundScreenProps> = ({
  round,
  players,
  currentUserId,
  hasAnswered,
  userAnswer,
  lastValidation,
  onSubmitAnswer
}) => {
  const [inputText, setInputText] = useState('');
  const [timeLeftMs, setTimeLeftMs] = useState(round.endsAt - Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const warnedBeepSecondsRef = useRef<Set<number>>(new Set());

  // Focus input automatically on mount
  useEffect(() => {
    if (!hasAnswered && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasAnswered, round]);

  // Synchronized countdown based on server endsAt timestamp
  useEffect(() => {
    warnedBeepSecondsRef.current.clear();

    const interval = setInterval(() => {
      const remaining = Math.max(0, round.endsAt - Date.now());
      setTimeLeftMs(remaining);

      const secondsLeft = Math.ceil(remaining / 1000);
      if (secondsLeft <= 5 && secondsLeft > 0 && !warnedBeepSecondsRef.current.has(secondsLeft)) {
        warnedBeepSecondsRef.current.add(secondsLeft);
        sound.playCountdownBeep(secondsLeft <= 3);
      }

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [round.endsAt]);

  const totalTimeMs = round.timeLimit * 1000;
  const progressRatio = Math.max(0, Math.min(1, timeLeftMs / totalTimeMs));
  const secondsDisplay = Math.ceil(timeLeftMs / 1000);

  // Auto uppercase & sanitize input
  const handleInputChange = (val: string) => {
    if (hasAnswered) return;
    const clean = val.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean.length <= round.wordLength) {
      setInputText(clean);
      sound.playClick();
    }
  };

  const handleKeyClick = (letter: string) => {
    if (hasAnswered) return;
    if (inputText.length < round.wordLength) {
      handleInputChange(inputText + letter);
    }
  };

  const handleBackspace = () => {
    if (hasAnswered) return;
    if (inputText.length > 0) {
      sound.playClick();
      setInputText(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (hasAnswered || !inputText.trim()) return;
    onSubmitAnswer(inputText.trim());
  };

  // Build letter slots array
  const slots = useMemo(() => {
    const letters = inputText.split('');
    const arr: string[] = [];
    for (let i = 0; i < round.wordLength; i++) {
      arr.push(letters[i] || '');
    }
    return arr;
  }, [inputText, round.wordLength]);

  // Live client-side hint
  const clientHint = useMemo(() => {
    if (inputText.length === 0) {
      return `Digite uma palavra começando com "${round.letter.toUpperCase()}"`;
    }
    if (inputText[0] !== round.letter.toUpperCase()) {
      return `A palavra deve começar com a letra ${round.letter.toUpperCase()}`;
    }
    const remaining = round.wordLength - inputText.length;
    if (remaining > 0) {
      return `Faltam ${remaining} ${remaining === 1 ? 'letra' : 'letras'}`;
    }
    return `Tamanho completo (${round.wordLength} letras). Pronto para enviar!`;
  }, [inputText, round]);

  const answeredCount = players.filter(p => p.hasAnswered).length;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Header Bar: Round & Timer */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Rodada {round.roundNumber} de {round.totalRounds}
          </span>
          <div className="text-xs text-slate-500 font-medium">
            {answeredCount} de {players.length} responderam
          </div>
        </div>

        {/* Big Synced Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-black text-xl transition-all shadow-lg ${
            secondsDisplay <= 5
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse shadow-rose-500/20'
              : secondsDisplay <= 10
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-amber-500/10'
              : 'bg-slate-900 border-slate-700 text-white shadow-black/40'
          }`}
        >
          <Clock className={`w-5 h-5 ${secondsDisplay <= 5 ? 'text-rose-400 animate-spin' : 'text-emerald-400'}`} />
          <span>00:{String(secondsDisplay).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Timer Progress Line */}
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            secondsDisplay <= 5 ? 'bg-rose-500' : secondsDisplay <= 10 ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* Main Challenge Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Triad of Round Rules */}
        <div className="grid grid-cols-3 gap-3">
          {/* Initial Letter */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Letra Inicial</span>
            <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-['Outfit'] mt-1 drop-shadow-md">
              {round.letter.toUpperCase()}
            </span>
          </div>

          {/* Category */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tema / Categoria</span>
            <span className="text-sm sm:text-base font-extrabold text-white mt-1 text-center line-clamp-2">
              {round.categoryName}
            </span>
          </div>

          {/* Word Length */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tamanho Exato</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1">
              {round.wordLength} <span className="text-xs font-semibold text-slate-400">letras</span>
            </span>
          </div>
        </div>

        {/* Restrictions Banner if applicable */}
        {round.restrictions && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs flex items-center justify-center gap-4 flex-wrap">
            {round.restrictions.mustContain && round.restrictions.mustContain.length > 0 && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Deve conter: {round.restrictions.mustContain.join(', ')}
              </span>
            )}
            {round.restrictions.mustNotContain && round.restrictions.mustNotContain.length > 0 && (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Não pode conter: {round.restrictions.mustNotContain.join(', ')}
              </span>
            )}
          </div>
        )}

        {/* Word Letter Slots Display */}
        <div className="py-2">
          <div className="flex justify-center gap-1.5 sm:gap-2.5 flex-wrap">
            {slots.map((char, index) => {
              const isFirst = index === 0;
              const isFilled = Boolean(char);
              return (
                <div
                  key={index}
                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl flex items-center justify-center font-black font-mono text-xl sm:text-2xl border-2 transition-all duration-150 ${
                    isFilled
                      ? 'bg-slate-900 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                      : isFirst
                      ? 'bg-slate-950 border-emerald-500/40 text-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  {char || (isFirst ? round.letter.toUpperCase() : '')}
                </div>
              );
            })}
          </div>

          <div className="text-xs text-slate-400 mt-3 font-medium flex items-center justify-center gap-1.5">
            {inputText.length === round.wordLength && inputText[0] === round.letter.toUpperCase() ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Pronto para enviar!
              </span>
            ) : (
              <span>{clientHint}</span>
            )}
          </div>
        </div>

        {/* Real Answer Input / Submission state */}
        {!hasAnswered ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden / Focused native input */}
            <div className="relative">
              <input
                ref={inputRef}
                id="input-round-answer"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                maxLength={round.wordLength}
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={`Digite ${round.wordLength} letras...`}
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-2xl px-5 py-3.5 text-center font-mono text-xl font-bold tracking-widest text-white uppercase placeholder:text-slate-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Big Mobile-Friendly Submit CTA */}
            <button
              id="btn-submit-answer"
              type="submit"
              disabled={inputText.length !== round.wordLength || inputText[0] !== round.letter.toUpperCase()}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              <span>ENVIAR RESPOSTA</span>
            </button>
          </form>
        ) : (
          /* Waiting Banner once answered */
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-center space-y-2">
            <div className="text-emerald-400 font-black text-lg flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Resposta Enviada: {userAnswer || inputText}</span>
            </div>
            <p className="text-xs text-slate-400">
              Aguardando os outros jogadores ou o cronômetro zerar para a revelação...
            </p>
          </div>
        )}
      </div>

      {/* On-Screen Virtual Keyboard (Great for mobile and quick single-hand play) */}
      {!hasAnswered && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 space-y-1.5">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5">
              {row.map((letter) => {
                const isInitial = letter === round.letter.toUpperCase();
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleKeyClick(letter)}
                    className={`h-11 flex-1 max-w-[42px] rounded-lg font-bold text-sm sm:text-base border transition-all active:scale-95 ${
                      isInitial
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Special action bottom row */}
          <div className="flex justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleBackspace}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs border border-slate-700"
            >
              Apagar ⌫
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={inputText.length !== round.wordLength || inputText[0] !== round.letter.toUpperCase()}
              className="px-6 py-2 bg-emerald-500 disabled:opacity-40 text-slate-950 font-black rounded-lg text-xs"
            >
              Enviar ↵
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
