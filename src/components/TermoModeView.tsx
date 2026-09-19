/**
 * Termo Mode View for STOP + TERMO
 * Modo dedutivo com palavra-alvo secreta e pistas de STOP (Letra e Categoria)
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw, Target, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import { LetterStatus, TermoGuessResult, WordEntry } from '../types.ts';
import { sound } from '../utils/audio.ts';
import { addXpToProfile, unlockAchievement } from '../utils/profile.ts';

interface TermoModeViewProps {
  onBack: () => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const TermoModeView: React.FC<TermoModeViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [targetWord, setTargetWord] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [wordLength, setWordLength] = useState(6);
  const [initialLetter, setInitialLetter] = useState('M');
  const [maxTries] = useState(6);

  const [guesses, setGuesses] = useState<TermoGuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState('');
  const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({});

  // Fetch or generate a fresh Termo target word
  const initNewGame = async () => {
    setLoading(true);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setMessage('');
    setLetterStatuses({});

    try {
      // Pick random category and length
      const categories = ['animal', 'comida', 'objeto', 'lugar', 'natureza', 'transporte'];
      const randomCat = categories[Math.floor(Math.random() * categories.length)];
      const res = await fetch(`/api/words/combinations?category=${randomCat}&minLength=5&maxLength=7`);
      const data = await res.json();
      const combList = data.combinations || [];

      if (combList.length > 0) {
        const comb = combList[Math.floor(Math.random() * combList.length)];
        const wordRes = await fetch(`/api/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answer: comb.sampleWords[0],
            round: {
              letter: comb.letter,
              categoryId: comb.category,
              categoryName: comb.category,
              wordLength: comb.length
            }
          })
        });

        // Use sample word
        const word = comb.sampleWords[Math.floor(Math.random() * comb.sampleWords.length)].toUpperCase();
        setTargetWord(word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/Ç/g, 'C'));
        setCategoryName(comb.category.toUpperCase());
        setWordLength(comb.length);
        setInitialLetter(comb.letter.toUpperCase());
      } else {
        // Fallback
        setTargetWord('MACACO');
        setCategoryName('ANIMAIS');
        setWordLength(6);
        setInitialLetter('M');
      }
    } catch {
      setTargetWord('MACACO');
      setCategoryName('ANIMAIS');
      setWordLength(6);
      setInitialLetter('M');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initNewGame();
  }, []);

  const handleInputChar = (char: string) => {
    if (gameStatus !== 'playing') return;
    if (currentGuess.length < wordLength) {
      sound.playClick();
      setCurrentGuess(prev => prev + char);
      setMessage('');
    }
  };

  const handleBackspace = () => {
    if (gameStatus !== 'playing') return;
    if (currentGuess.length > 0) {
      sound.playClick();
      setCurrentGuess(prev => prev.slice(0, -1));
    }
  };

  const handleGuessSubmit = async () => {
    if (gameStatus !== 'playing') return;
    if (currentGuess.length !== wordLength) {
      setMessage(`A palavra deve ter ${wordLength} letras.`);
      sound.playError();
      return;
    }

    try {
      const res = await fetch('/api/termo/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guess: currentGuess,
          target: targetWord
        })
      });
      const evalResult: TermoGuessResult = await res.json();

      sound.playFlip(evalResult.isCorrect);

      // Update letter statuses map
      const nextLetterStatuses = { ...letterStatuses };
      evalResult.guess.split('').forEach((ch, idx) => {
        const st = evalResult.letterStatuses[idx];
        if (st === 'correct') {
          nextLetterStatuses[ch] = 'correct';
        } else if (st === 'present' && nextLetterStatuses[ch] !== 'correct') {
          nextLetterStatuses[ch] = 'present';
        } else if (!nextLetterStatuses[ch]) {
          nextLetterStatuses[ch] = 'absent';
        }
      });
      setLetterStatuses(nextLetterStatuses);

      const nextGuesses = [...guesses, evalResult];
      setGuesses(nextGuesses);
      setCurrentGuess('');

      if (evalResult.isCorrect) {
        setGameStatus('won');
        sound.playVictory();
        addXpToProfile(120);
        if (nextGuesses.length <= 4) {
          unlockAchievement('termo_master');
        }
      } else if (nextGuesses.length >= maxTries) {
        setGameStatus('lost');
        sound.playError();
      }
    } catch {
      setMessage('Erro na validação do palpite.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
          <Target className="w-3.5 h-3.5" /> Modo TERMO
        </div>

        <button
          onClick={initNewGame}
          title="Nova Palavra"
          className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Clues Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center shadow-lg">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
          Pistas do STOP
        </div>
        <div className="flex justify-center items-center gap-6">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Letra Inicial</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{initialLetter}</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-xs text-slate-400 block font-medium">Tema</span>
            <span className="text-sm font-extrabold text-white">{categoryName}</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-xs text-slate-400 block font-medium">Tamanho</span>
            <span className="text-sm font-extrabold text-amber-300 font-mono">{wordLength} letras</span>
          </div>
        </div>
      </div>

      {/* Grid of Guesses */}
      <div className="space-y-2 flex flex-col items-center">
        {Array.from({ length: maxTries }).map((_, rowIdx) => {
          const guessData = guesses[rowIdx];
          const isCurrentRow = rowIdx === guesses.length && gameStatus === 'playing';

          return (
            <div key={rowIdx} className="flex gap-1.5">
              {Array.from({ length: wordLength }).map((_, colIdx) => {
                let char = '';
                let status: LetterStatus = 'empty';

                if (guessData) {
                  char = guessData.guess[colIdx] || '';
                  status = guessData.letterStatuses[colIdx] || 'absent';
                } else if (isCurrentRow) {
                  char = currentGuess[colIdx] || '';
                }

                // Styling based on status
                let tileClass = 'bg-slate-950 border-slate-800 text-slate-400';
                if (status === 'correct') {
                  tileClass = 'bg-emerald-600 border-emerald-500 text-white font-black shadow-md shadow-emerald-500/20';
                } else if (status === 'present') {
                  tileClass = 'bg-amber-600 border-amber-500 text-white font-black shadow-md shadow-amber-500/20';
                } else if (status === 'absent') {
                  tileClass = 'bg-slate-800/80 border-slate-700 text-slate-500';
                } else if (char) {
                  tileClass = 'bg-slate-900 border-slate-600 text-white font-black scale-105';
                }

                return (
                  <div
                    key={colIdx}
                    className={`w-11 h-12 sm:w-12 sm:h-13 rounded-xl flex items-center justify-center font-mono font-bold text-xl border-2 transition-all duration-200 ${tileClass}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Status or Toast Message */}
      {message && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center rounded-xl font-medium">
          {message}
        </div>
      )}

      {/* Won / Lost Card */}
      {gameStatus !== 'playing' && (
        <div
          className={`p-5 rounded-2xl border text-center space-y-3 shadow-2xl ${
            gameStatus === 'won'
              ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
              : 'bg-rose-950/40 border-rose-500/60 text-white'
          }`}
        >
          <div className="text-2xl font-black font-['Outfit']">
            {gameStatus === 'won' ? '🎉 Parabéns! Você acertou!' : '💔 Fim das Tentativas!'}
          </div>
          <p className="text-sm">
            A palavra secreta era: <strong className="font-mono text-amber-300 text-lg">{targetWord}</strong>
          </p>
          <button
            onClick={initNewGame}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition-all"
          >
            Jogar Outra Palavra
          </button>
        </div>
      )}

      {/* On-screen Keyboard */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 space-y-1.5">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((ch) => {
              const st = letterStatuses[ch];
              let keyColor = 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800';
              if (st === 'correct') {
                keyColor = 'bg-emerald-600 border-emerald-500 text-white';
              } else if (st === 'present') {
                keyColor = 'bg-amber-600 border-amber-500 text-white';
              } else if (st === 'absent') {
                keyColor = 'bg-slate-800/60 border-slate-800 text-slate-600 opacity-60';
              }

              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => handleInputChar(ch)}
                  className={`h-11 flex-1 max-w-[40px] rounded-lg font-mono font-bold text-sm border transition-all active:scale-95 ${keyColor}`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        ))}

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
            onClick={handleGuessSubmit}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs"
          >
            Confirmar ↵
          </button>
        </div>
      </div>
    </div>
  );
};
