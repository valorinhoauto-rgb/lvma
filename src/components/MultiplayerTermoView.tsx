/**
 * Modo TERMO Coletivo / Multiplayer
 * Todos os jogadores na sala competem simultaneamente para adivinhar a mesma palavra secreta
 * com dicas de tema e letra inicial antes que o tempo ou as tentativas se esgotem.
 */

import React, { useState, useEffect } from 'react';
import { Clock, HelpCircle, Trophy, Users, CheckCircle2 } from 'lucide-react';
import { LetterStatus, Player, RoundConfig, TermoGuessResult } from '../types.ts';
import { sound } from '../utils/audio.ts';

interface MultiplayerTermoViewProps {
  round: RoundConfig;
  players: Player[];
  currentUserId: string;
  hasAnswered: boolean;
  onSubmitGuess: (guess: string) => void;
  guesses: TermoGuessResult[];
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
  guesses
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(round.timeLimit);
  const wordLength = round.wordLength || 5;
  const maxTries = 6;

  const hasWon = guesses.some(g => g.isCorrect);
  const isGameOver = hasWon || guesses.length >= maxTries;

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((round.endsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 5 && remaining > 0) {
        sound.playTick();
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [round.endsAt]);

  // Key status mapping
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
    if (isGameOver || hasAnswered) return;

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
  }, [currentInput, isGameOver, hasAnswered, wordLength]);

  return (
    <div id="multiplayer-termo-view" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
            <Trophy className="w-5 h-5" />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">TERMO Multiplayer</div>
            <div className="text-sm font-bold text-slate-300">
              Tema: <span className="text-white">{round.categoryName}</span> • Começa com <span className="text-amber-400 font-mono font-bold text-base">{round.letter}</span>
            </div>
          </div>
        </div>

        {/* Cronômetro */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-lg border transition-all ${
          timeLeft <= 5
            ? 'bg-red-950/80 border-red-500/50 text-red-400 animate-pulse'
            : 'bg-slate-800 border-slate-700 text-white'
        }`}>
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Grid de Palpites do Jogador */}
      <div className="flex flex-col items-center justify-center gap-2 py-4">
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

                let colorClasses = 'bg-slate-950/80 border-slate-800 text-white';
                if (status === 'correct') {
                  colorClasses = 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30';
                } else if (status === 'present') {
                  colorClasses = 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/30';
                } else if (status === 'absent') {
                  colorClasses = 'bg-slate-800 border-slate-700 text-slate-400';
                } else if (isCurrentRow && char) {
                  colorClasses = 'bg-slate-900 border-amber-500/80 text-white scale-105';
                }

                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-14 sm:w-14 sm:h-16 border-2 rounded-xl flex items-center justify-center font-black text-2xl font-mono uppercase transition-all select-none ${colorClasses}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Teclado Virtual */}
      <div className="max-w-xl mx-auto space-y-2 select-none">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1.5 sm:gap-2">
            {row.map((key) => {
              const status = letterStatuses[key];
              let btnColor = 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700';

              if (status === 'correct') {
                btnColor = 'bg-emerald-600 text-white border-emerald-500';
              } else if (status === 'present') {
                btnColor = 'bg-amber-500 text-slate-950 font-black border-amber-400';
              } else if (status === 'absent') {
                btnColor = 'bg-slate-900 text-slate-600 border-slate-800 opacity-60';
              }

              const isWide = key === 'ENTER' || key === 'DEL';

              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`h-11 sm:h-12 rounded-lg font-bold border text-xs sm:text-sm transition-all flex items-center justify-center ${
                    isWide ? 'px-3 sm:px-4 font-mono font-black' : 'w-8 sm:w-10'
                  } ${btnColor}`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Painel dos Outros Jogadores na Sala */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          <Users className="w-4 h-4" />
          Competidores na Sala
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map((p) => {
            const isSelf = p.id === currentUserId;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                  p.hasAnswered
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-xl">{p.avatar}</span>
                <div className="truncate text-xs font-bold text-white flex-1">
                  {p.name} {isSelf && '(Você)'}
                </div>
                {p.hasAnswered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
