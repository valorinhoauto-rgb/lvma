/**
 * Visualizador do Modo Juice / Foto Desafio (estilo JKLM.fun / Juice)
 * Apresenta uma imagem fotográfica e os jogadores competem para acertar
 * o que ela representa (cantor, flor, animal, monumento, prato típico).
 *
 * Permite tentativas ilimitadas dentro do tempo limite, feedback de proximidade
 * ("Está próximo / Quase lá!") e tolerância a acentuação e pequenas variações de digitação.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Clock, CheckCircle2, HelpCircle, Send, Users, Flame, XCircle, Sparkles, Award, ShieldCheck } from 'lucide-react';
import { JuiceGuessResult, Player, RoundConfig } from '../types.ts';
import { sound } from '../utils/audio.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';

interface JuicePhotoModeViewProps {
  round: RoundConfig;
  players: Player[];
  currentUserId: string;
  hasAnswered: boolean;
  userAnswer?: string;
  guesses?: JuiceGuessResult[];
  onSubmitAnswer: (answer: string) => Promise<any> | void;
}

export const JuicePhotoModeView: React.FC<JuicePhotoModeViewProps> = ({
  round,
  players,
  currentUserId,
  hasAnswered,
  userAnswer,
  guesses = [],
  onSubmitAnswer
}) => {
  const [inputVal, setInputVal] = useState('');
  const [timeLeft, setTimeLeft] = useState(round.timeLimit);
  const [localGuesses, setLocalGuesses] = useState<JuiceGuessResult[]>(guesses);
  const [latestFeedback, setLatestFeedback] = useState<{
    isClose: boolean;
    isCorrect: boolean;
    isPartial?: boolean;
    points?: number;
    message: string;
    guess: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const challenge = round.photoChallenge;
  const [imageSrc, setImageSrc] = useState(challenge?.imageUrl || '');

  // Keep imageSrc updated on round/challenge change
  useEffect(() => {
    if (challenge?.imageUrl) {
      setImageSrc(challenge.imageUrl);
    }
  }, [challenge?.imageUrl]);

  // Sync server guesses into local list
  useEffect(() => {
    if (guesses.length > localGuesses.length) {
      setLocalGuesses(guesses);
    }
  }, [guesses]);

  const hasFullAnswer = localGuesses.some(g => g.isCorrect && !g.isPartial);
  const hasPartialAnswer = !hasFullAnswer && localGuesses.some(g => g.isCorrect && g.isPartial);

  // Focus input automatically on mount or round change
  useEffect(() => {
    if (!hasFullAnswer) {
      inputRef.current?.focus();
    }
  }, [hasFullAnswer, round.roundNumber]);

  // Round countdown timer
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputVal.trim();
    if (!clean || hasFullAnswer || isSubmitting) return;

    sound.playClick();
    setIsSubmitting(true);
    setInputVal('');

    try {
      const res: any = await onSubmitAnswer(clean);
      if (res && res.validation) {
        const val = res.validation;
        const isPartial = Boolean(val.isPartial);
        const isValid = Boolean(val.isValid);

        setLatestFeedback({
          isClose: Boolean(val.isClose),
          isCorrect: isValid,
          isPartial,
          points: val.points,
          message: val.message || (isValid ? 'Acertou!' : 'Incorreto'),
          guess: clean
        });

        const newGuessObj: JuiceGuessResult = {
          guess: clean,
          isCorrect: isValid,
          isPartial,
          isClose: Boolean(val.isClose),
          message: val.message,
          timeMs: Date.now() - round.startedAt,
          pointsAwarded: val.points
        };

        setLocalGuesses(prev => {
          // Avoid duplicate entries
          if (prev.some(g => g.guess.toUpperCase() === clean.toUpperCase())) {
            return prev;
          }
          return [...prev, newGuessObj];
        });

        if (isValid) {
          sound.playSuccess();
        } else if (val.isClose) {
          sound.playTick();
        } else {
          sound.playError();
        }
      }
    } catch (err) {
      console.error('Error submitting juice guess:', err);
    } finally {
      setIsSubmitting(false);
      // Keep input focused for instant continuous typing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const myPlayer = players.find(p => p.id === currentUserId);
  const correctCount = players.filter(p => p.hasAnswered).length;

  return (
    <div id="juice-photo-mode-view" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Barra de Status */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-pink-500/20 text-pink-300 rounded-xl border border-pink-500/30">
            <Camera className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Modo Juice / Foto Desafio</span>
              <span className="text-[10px] bg-pink-500/10 border border-pink-500/30 text-pink-300 px-2 py-0.5 rounded-full font-semibold">
                Tentativas Ilimitadas
              </span>
            </div>
            <div className="text-base font-black text-white">Rodada {round.roundNumber} de {round.totalRounds}</div>
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

      {/* Card da Imagem Fotográfica */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
        {challenge && (
          <div className="relative aspect-[16/10] w-full bg-slate-950 flex items-center justify-center overflow-hidden group">
            <img
              src={imageSrc || challenge.imageUrl}
              alt={challenge.category}
              className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
              onError={() => {
                if (imageSrc !== `/api/image-proxy?url=${encodeURIComponent(challenge.imageUrl)}`) {
                  setImageSrc(`/api/image-proxy?url=${encodeURIComponent(challenge.imageUrl)}`);
                }
              }}
            />

            {/* Categoria Badge */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              {challenge.category}
            </div>

            {/* Dica de Letra Inicial */}
            <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 shadow-xl flex items-center gap-1.5">
              <span>Começa com:</span>
              <span className="text-white text-base font-black font-mono bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded-md">
                {challenge.initialLetter}
              </span>
            </div>

            {/* Marca d'água / Selo de Autenticidade Registrado (Sem spoilers de local ou país) */}
            <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-300 shadow-xl flex items-center gap-1.5 select-none pointer-events-none">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="font-semibold text-slate-200 tracking-wide">
                ® Acervo Registrado • Fotografia Autêntica
              </span>
            </div>
          </div>
        )}

        {/* Dica Contextual e Contagem de Letras */}
        {challenge && (
          <div className="p-6 pt-2 space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dica da Imagem</div>
                <div className="text-sm text-slate-200">{challenge.hint}</div>
              </div>
            </div>

            {/* Banner Dinâmico de Proximidade ("Está Próximo") ou Feedback */}
            {latestFeedback && !hasFullAnswer && !hasPartialAnswer && (
              <div
                className={`p-3.5 rounded-2xl border transition-all animate-in fade-in flex items-center gap-3 ${
                  latestFeedback.isClose
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-2 ring-amber-500/20'
                    : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                }`}
              >
                {latestFeedback.isClose ? (
                  <Flame className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div className="flex-1 text-xs">
                  <span className="font-black uppercase tracking-wider mr-1.5">
                    {latestFeedback.isClose ? '🔥 O JOGO AVISA:' : 'Ainda não:'}
                  </span>
                  <span className="font-semibold">{latestFeedback.message}</span>
                </div>
              </div>
            )}

            {/* Banner Especial de Resposta Meio Certa (50% dos pontos) */}
            {hasPartialAnswer && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-2 text-amber-300 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-xl">
                      <Sparkles className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <span>⚡ Resposta Meio Certa (50% dos pontos)</span>
                      </div>
                      <div className="text-base font-black text-white font-mono">
                        {userAnswer || latestFeedback?.guess}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-amber-900/50 border border-amber-500/30 px-3 py-1.5 rounded-xl shrink-0">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>+{myPlayer?.roundScore || latestFeedback?.points || 50} pts</span>
                  </div>
                </div>
                <div className="text-xs text-amber-200/90 bg-amber-900/30 border border-amber-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span>💡</span>
                  <span>O termo é composto! Envie o nome completo abaixo para garantir a pontuação máxima (100%):</span>
                </div>
              </div>
            )}

            {/* Input de Resposta Ilimitado (disponível enquanto não enviar a resposta completa) */}
            {!hasFullAnswer ? (
              <div className="space-y-2">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    id="input-juice-guess"
                    type="text"
                    autoFocus
                    placeholder={hasPartialAnswer ? "Envie o nome completo para 100%..." : "Quem ou o que é isso? Digite e aperte Enter..."}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-white rounded-2xl px-5 py-3.5 text-base font-semibold outline-none transition-all placeholder:text-slate-500 uppercase"
                  />
                  <button
                    id="btn-submit-juice-guess"
                    type="submit"
                    disabled={!inputVal.trim() || isSubmitting}
                    className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    Enviar
                  </button>
                </form>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    {hasPartialAnswer ? 'Você já garantiu metade dos pontos!' : 'Sem se preocupar com acentos ou pequenas variações de letras!'}
                  </span>
                  <span>Tente quantas vezes quiser!</span>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between text-emerald-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span>🎉 Resposta Completa (100%)</span>
                    </div>
                    <div className="text-base font-black text-white font-mono">{userAnswer || latestFeedback?.guess}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-900/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>+{myPlayer?.roundScore || 100} pts</span>
                </div>
              </div>
            )}

            {/* Histórico de Tentativas Recentes do Jogador */}
            {localGuesses.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Suas Tentativas ({localGuesses.length}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {localGuesses.slice(-8).reverse().map((g, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        g.isCorrect
                          ? g.isPartial
                            ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                            : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : g.isClose
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-sm animate-pulse'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 line-through'
                      }`}
                    >
                      {g.isCorrect && !g.isPartial && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {g.isCorrect && g.isPartial && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                      {g.isClose && !g.isCorrect && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{g.guess}</span>
                      {g.isCorrect && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                          g.isPartial
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {g.isPartial ? 'Meio Certa (50%)' : 'Completa (100%)'}
                        </span>
                      )}
                      {g.isClose && !g.isCorrect && (
                        <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-normal">
                          Perto!
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status dos Jogadores na Rodada */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Jogadores na Sala ({players.length})
          </div>
          <span className="text-emerald-400">{correctCount} acertaram</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                p.hasAnswered
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
              }`}
            >
              <PlayerAvatar
                avatar={p.avatar}
                avatarColor={p.avatarColor}
                size="xs"
              />
              <div className="truncate text-xs font-bold text-white flex-1">{p.name}</div>
              {p.hasAnswered ? (
                <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Acertou</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">Tentando...</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
