/**
 * Modo Duelo Local em Dupla (2 Jogadores no Mesmo Dispositivo)
 * Revive a brincadeira de infância no caderno:
 * Um amigo escreve a palavra secreta e a dica escondido, e o outro tenta adivinhar na forca!
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Heart,
  Eye,
  EyeOff,
  Lightbulb,
  Users,
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { normalizeForcaString } from '../data/forcaWords.ts';
import { sound } from '../utils/audio.ts';
import { triggerWinnerConfetti } from '../utils/confetti.ts';

interface ForcaDuoLocalModalProps {
  isOpen?: boolean;
  onClose: () => void;
  player1Name?: string;
  player2Name?: string;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const ForcaDuoLocalModal: React.FC<ForcaDuoLocalModalProps> = ({
  isOpen = true,
  onClose,
  player1Name: initialP1 = 'Jogador 1',
  player2Name: initialP2 = 'Jogador 2'
}) => {
  if (!isOpen) return null;

  // Game Setup State
  const [player1Name, setPlayer1Name] = useState(initialP1);
  const [player2Name, setPlayer2Name] = useState(initialP2);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [currentCreator, setCurrentCreator] = useState<'p1' | 'p2'>('p1'); // Quem cria a palavra nesta rodada

  // Phase: 'create_word' | 'guessing' | 'round_end'
  const [phase, setPhase] = useState<'create_word' | 'guessing' | 'round_end'>('create_word');

  // Creator Form
  const [secretWordInput, setSecretWordInput] = useState('');
  const [hintInput, setHintInput] = useState('');
  const [hideSecretWord, setHideSecretWord] = useState(true);

  // Active Game State
  const [activeWord, setActiveWord] = useState('');
  const [activeNormalized, setActiveNormalized] = useState('');
  const [activeHint, setActiveHint] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Quick word chute
  const [chuteInput, setChuteInput] = useState('');
  const [showChuteModal, setShowChuteModal] = useState(false);

  const guesser = currentCreator === 'p1' ? 'p2' : 'p1';
  const creatorName = currentCreator === 'p1' ? player1Name : player2Name;
  const guesserName = guesser === 'p1' ? player1Name : player2Name;

  const isWon = activeNormalized.length > 0 && Array.from(new Set(activeNormalized.split(''))).every(l => guessedLetters.includes(l));
  const isHanged = wrongCount >= 6;
  const isRoundOver = isWon || isHanged;

  // Handle Start Guessing
  const handleStartGuessing = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = secretWordInput.trim().toUpperCase();
    const norm = normalizeForcaString(cleanWord);
    if (norm.length < 2) return;

    setActiveWord(cleanWord);
    setActiveNormalized(norm);
    setActiveHint(hintInput.trim());
    setGuessedLetters([]);
    setWrongCount(0);
    setFeedback(null);
    setPhase('guessing');
  };

  // Guess Letter
  const handleGuessLetter = (letter: string) => {
    if (isRoundOver || guessedLetters.includes(letter)) return;

    const norm = normalizeForcaString(letter);
    const newGuessed = [...guessedLetters, norm];
    setGuessedLetters(newGuessed);

    const isHit = activeNormalized.includes(norm);
    if (isHit) {
      sound.playSuccess();
      setFeedback(`Boa! Tem a letra "${norm}"!`);

      // Check if word completed
      const distinct = Array.from(new Set(activeNormalized.split('')));
      if (distinct.every(l => newGuessed.includes(l))) {
        sound.playVictory();
        triggerWinnerConfetti();
        // Guesser gets point!
        setScores(prev => ({
          ...prev,
          [guesser]: prev[guesser] + 1
        }));
        setPhase('round_end');
      }
    } else {
      sound.playError();
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setFeedback(`Não tem "${norm}"! ${6 - newWrong} vidas restantes.`);

      if (newWrong >= 6) {
        sound.playError();
        // Creator gets point because guesser got hanged!
        setScores(prev => ({
          ...prev,
          [currentCreator]: prev[currentCreator] + 1
        }));
        setPhase('round_end');
      }
    }
  };

  // Guess Full Word
  const handleChuteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chuteInput.trim() || isRoundOver) return;

    const clean = normalizeForcaString(chuteInput);
    setShowChuteModal(false);
    setChuteInput('');

    if (clean === activeNormalized) {
      sound.playVictory();
      triggerWinnerConfetti();
      setFeedback(`🎉 ACERTOU! A palavra inteira era ${activeWord}!`);
      setGuessedLetters(Array.from(new Set(activeNormalized.split(''))));
      setScores(prev => ({
        ...prev,
        [guesser]: prev[guesser] + 1
      }));
      setPhase('round_end');
    } else {
      sound.playError();
      const newWrong = Math.min(6, wrongCount + 2);
      setWrongCount(newWrong);
      setFeedback(`❌ Errou a palavra inteira! Perdeu 2 vidas!`);
      if (newWrong >= 6) {
        setScores(prev => ({
          ...prev,
          [currentCreator]: prev[currentCreator] + 1
        }));
        setPhase('round_end');
      }
    }
  };

  // Next Round: Swap roles!
  const handleNextRound = () => {
    setCurrentCreator(prev => (prev === 'p1' ? 'p2' : 'p1'));
    setSecretWordInput('');
    setHintInput('');
    setHideSecretWord(true);
    setPhase('create_word');
  };

  // Keyboard listener
  useEffect(() => {
    if (!isOpen || phase !== 'guessing' || showChuteModal) return;

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (/^[A-ZÇ]$/.test(k)) {
        handleGuessLetter(k);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, phase, showChuteModal, guessedLetters, wrongCount, activeNormalized]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl flex flex-col gap-5 relative max-h-[95vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Forca em Dupla (2 Jogadores)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O clássico do caderno: um escolhe a palavra e o outro tenta adivinhar!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scoreboard Bar */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div
            className={`p-3 rounded-xl border text-center transition-all ${
              currentCreator === 'p1'
                ? 'bg-amber-500/15 border-amber-500/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {player1Name} {currentCreator === 'p1' ? '✍️ (Criador)' : '🔍 (Adivinhador)'}
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {scores.p1} <span className="text-xs font-normal text-slate-500">vitórias</span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border text-center transition-all ${
              currentCreator === 'p2'
                ? 'bg-amber-500/15 border-amber-500/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {player2Name} {currentCreator === 'p2' ? '✍️ (Criador)' : '🔍 (Adivinhador)'}
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {scores.p2} <span className="text-xs font-normal text-slate-500">vitórias</span>
            </div>
          </div>
        </div>

        {/* PHASE 1: CREATE SECRET WORD */}
        {phase === 'create_word' && (
          <form onSubmit={handleStartGuessing} className="flex flex-col gap-4">
            <div className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                Vez de {creatorName} criar a palavra!
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Peça para {guesserName} não olhar para a tela enquanto você digita a palavra secreta e a dica!
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Palavra Secreta:
                </label>
                <button
                  type="button"
                  onClick={() => setHideSecretWord(!hideSecretWord)}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {hideSecretWord ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {hideSecretWord ? 'Oculto (Seguro)' : 'Revelar'}
                </button>
              </div>

              <input
                type={hideSecretWord ? 'password' : 'text'}
                autoFocus
                required
                placeholder="Ex: BRIGADEIRO, GIRAFA, ASTRONAUTA..."
                value={secretWordInput}
                onChange={e => setSecretWordInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 text-lg font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Dica Especial (Opcional, para ajudar o amigo):
              </label>
              <input
                type="text"
                placeholder="Ex: Doce típico brasileiro de festa infantil..."
                value={hintInput}
                onChange={e => setHintInput(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={secretWordInput.trim().length < 2}
              className="mt-2 w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Pronto! Passar para {guesserName} Jogar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* PHASE 2 & 3: GUESSING / ROUND OVER */}
        {(phase === 'guessing' || phase === 'round_end') && (
          <div className="flex flex-col gap-4">
            {/* Turn Banner */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Adivinhando:
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-white">
                  {guesserName}
                </span>
              </div>

              <div className="flex items-center gap-1 text-rose-500">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 ${
                      i < 6 - wrongCount ? 'fill-rose-500 text-rose-500' : 'text-slate-400 fill-transparent'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold ml-1 text-slate-600 dark:text-slate-300">
                  {6 - wrongCount}/6
                </span>
              </div>
            </div>

            {/* Hint if provided */}
            {activeHint && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  <strong className="text-amber-700 dark:text-amber-400">Dica de {creatorName}:</strong> {activeHint}
                </span>
              </div>
            )}

            {/* Small Gallows SVG */}
            <div className="w-full flex items-center justify-center py-2">
              <svg viewBox="0 0 200 210" className="w-36 h-40 drop-shadow-sm">
                <line x1="20" y1="190" x2="110" y2="190" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
                <line x1="50" y1="190" x2="50" y2="20" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
                <line x1="46" y1="24" x2="140" y2="24" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
                <line x1="50" y1="60" x2="85" y2="24" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
                <line x1="135" y1="24" x2="135" y2="50" stroke="#d97706" strokeWidth="3.5" />
                <circle cx="135" cy="52" r="3.5" fill="none" stroke="#b45309" strokeWidth="2.5" />

                {wrongCount >= 1 && (
                  <circle
                    cx="135"
                    cy="72"
                    r="18"
                    fill={isWon ? '#10b981' : isHanged ? '#f43f5e' : '#f59e0b'}
                    stroke={isWon ? '#047857' : isHanged ? '#be123c' : '#b45309'}
                    strokeWidth="3"
                  />
                )}
                {wrongCount >= 2 && <line x1="135" y1="90" x2="135" y2="140" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />}
                {wrongCount >= 3 && <line x1="135" y1="105" x2="112" y2="125" stroke="#334155" strokeWidth="4" strokeLinecap="round" />}
                {wrongCount >= 4 && <line x1="135" y1="105" x2="158" y2="125" stroke="#334155" strokeWidth="4" strokeLinecap="round" />}
                {wrongCount >= 5 && <line x1="135" y1="140" x2="117" y2="175" stroke="#334155" strokeWidth="4" strokeLinecap="round" />}
                {wrongCount >= 6 && <line x1="135" y1="140" x2="153" y2="175" stroke="#334155" strokeWidth="4" strokeLinecap="round" />}
              </svg>
            </div>

            {/* Secret Word Tiles */}
            <div className="flex flex-wrap items-center justify-center gap-2 py-2">
              {activeNormalized.split('').map((letter, idx) => {
                const isRevealed = guessedLetters.includes(letter) || isRoundOver;
                const isMissed = isHanged && !guessedLetters.includes(letter);

                return (
                  <div
                    key={idx}
                    className={`w-9 h-12 sm:w-11 sm:h-14 rounded-xl border-b-4 flex items-center justify-center font-black text-xl transition-all ${
                      isRevealed
                        ? isWon
                          ? 'bg-emerald-500 text-white border-emerald-700'
                          : isMissed
                          ? 'bg-rose-500/20 text-rose-600 border-rose-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {isRevealed ? letter : <span className="w-3 h-1 bg-slate-400 rounded-full" />}
                  </div>
                );
              })}
            </div>

            {/* Feedback / Result Banner */}
            {phase === 'round_end' ? (
              <div
                className={`p-4 rounded-2xl text-center font-bold text-sm ${
                  isWon
                    ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                }`}
              >
                {isWon ? (
                  <div>
                    🎉 {guesserName} salvou o boneco e ganhou a rodada! (+1 ponto)
                  </div>
                ) : (
                  <div>
                    💀 {guesserName} foi enforcado! Ponto para {creatorName}!
                    <div className="text-xs font-normal mt-1 text-slate-600 dark:text-slate-300">
                      A palavra era: <strong>{activeWord}</strong>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleNextRound}
                  className="mt-3 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Próxima Rodada (Trocar de Vez)</span>
                </button>
              </div>
            ) : (
              feedback && (
                <div className="text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {feedback}
                </div>
              )
            )}

            {/* Virtual Keyboard */}
            {phase === 'guessing' && (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowChuteModal(true)}
                    className="px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-500" />
                    <span>Arriscar Palavra Inteira</span>
                  </button>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-2xl flex flex-col items-center gap-1">
                  {KEYBOARD_ROWS.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex items-center justify-center gap-1 w-full max-w-lg">
                      {row.map(letter => {
                        const isTried = guessedLetters.includes(letter);
                        const isHit = isTried && activeNormalized.includes(letter);
                        const isMiss = isTried && !activeNormalized.includes(letter);

                        let cls = 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700';
                        if (isHit) cls = 'bg-emerald-500 text-white border-emerald-600';
                        else if (isMiss) cls = 'bg-slate-300 dark:bg-slate-700 text-slate-400 line-through opacity-40';

                        return (
                          <button
                            key={letter}
                            disabled={isTried || isRoundOver}
                            onClick={() => handleGuessLetter(letter)}
                            className={`h-9 flex-1 max-w-[36px] rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer disabled:cursor-not-allowed ${cls}`}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Modal Chute Palavra Inteira */}
        {showChuteModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                Arriscar Palavra Inteira
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Se acertar, ganha a rodada agora! Se errar, perde 2 vidas na forca.
              </p>
              <form onSubmit={handleChuteSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  autoFocus
                  placeholder="Palavra..."
                  value={chuteInput}
                  onChange={e => setChuteInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-center text-base font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChuteModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
