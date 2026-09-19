/**
 * Game Final Screen for STOP + TERMO
 * Pódio final, pontuação acumulada, XP conquistado e conquistas.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Trophy, Medal, RotateCcw, Home, Sparkles, Award } from 'lucide-react';
import { RoomState, UserProfile } from '../types.ts';
import { sound } from '../utils/audio.ts';
import { addXpToProfile, unlockAchievement } from '../utils/profile.ts';
import { PlayerAvatar } from './PlayerAvatar.tsx';

interface GameFinalScreenProps {
  room: RoomState;
  currentUserId: string;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const GameFinalScreen: React.FC<GameFinalScreenProps> = ({
  room,
  currentUserId,
  onPlayAgain,
  onReturnHome
}) => {
  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  // Sort players by total score
  const sortedPlayers = useMemo(() => {
    return [...room.players].sort((a, b) => b.score - a.score);
  }, [room.players]);

  const winner = sortedPlayers[0];
  const isWinner = winner && winner.id === currentUserId;
  const myRank = sortedPlayers.findIndex(p => p.id === currentUserId) + 1;

  useEffect(() => {
    sound.playVictory();

    // Calculate XP reward
    let xp = 60; // completion bonus
    if (isWinner) {
      xp += 100;
      const res = unlockAchievement('first_win');
      if (res.unlocked && res.achievement) {
        setNewAchievement(res.achievement.title);
      }
    }

    const { leveledUp: didLevelUp } = addXpToProfile(xp);
    setXpGained(xp);
    setLeveledUp(didLevelUp);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Top Victory Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
          <Trophy className="w-4 h-4" /> Fim de Jogo!
        </div>
        <h1 className="text-4xl font-black text-white font-['Outfit']">PÓDIO DA PARTIDA</h1>
        <p className="text-slate-400 text-sm">
          {room.settings.totalRounds} rodadas concluídas com sucesso!
        </p>
      </div>

      {/* Visual Podium Top 3 */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 pt-6 pb-2">
        {/* 2nd Place */}
        {sortedPlayers[1] && (
          <div className="flex flex-col items-center flex-1 max-w-[130px]">
            <div className="mb-2">
              <PlayerAvatar
                avatar={sortedPlayers[1].avatar}
                avatarColor={sortedPlayers[1].avatarColor}
                size="lg"
              />
            </div>
            <div className="text-xs font-bold text-white truncate max-w-full">{sortedPlayers[1].name}</div>
            <div className="text-[11px] text-slate-400 font-mono mb-2">{sortedPlayers[1].score} pts</div>
            <div className="w-full bg-slate-800 border-t-2 border-slate-400 rounded-t-2xl h-24 flex items-center justify-center font-black text-slate-400 text-xl shadow-lg">
              2º
            </div>
          </div>
        )}

        {/* 1st Place */}
        {sortedPlayers[0] && (
          <div className="flex flex-col items-center flex-1 max-w-[150px]">
            <span className="text-3xl mb-1 animate-bounce">👑</span>
            <div className="mb-2">
              <PlayerAvatar
                avatar={sortedPlayers[0].avatar}
                avatarColor={sortedPlayers[0].avatarColor}
                size="xl"
              />
            </div>
            <div className="text-sm font-extrabold text-amber-300 truncate max-w-full">{sortedPlayers[0].name}</div>
            <div className="text-xs text-amber-400/90 font-mono font-bold mb-2">{sortedPlayers[0].score} pts</div>
            <div className="w-full bg-gradient-to-t from-amber-600/30 to-amber-500/20 border-t-2 border-amber-400 rounded-t-2xl h-36 flex items-center justify-center font-black text-amber-400 text-3xl shadow-xl shadow-amber-500/20">
              1º
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {sortedPlayers[2] && (
          <div className="flex flex-col items-center flex-1 max-w-[130px]">
            <div className="mb-2">
              <PlayerAvatar
                avatar={sortedPlayers[2].avatar}
                avatarColor={sortedPlayers[2].avatarColor}
                size="md"
              />
            </div>
            <div className="text-xs font-bold text-white truncate max-w-full">{sortedPlayers[2].name}</div>
            <div className="text-[11px] text-slate-400 font-mono mb-2">{sortedPlayers[2].score} pts</div>
            <div className="w-full bg-slate-800 border-t-2 border-amber-700/60 rounded-t-2xl h-16 flex items-center justify-center font-black text-amber-700 text-xl shadow-lg">
              3º
            </div>
          </div>
        )}
      </div>

      {/* Rewards Toast */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Recompensa da Partida</div>
            <div className="text-xs text-slate-400">
              Você ganhou <strong className="text-emerald-400">+{xpGained} XP</strong>!
              {leveledUp && <span className="text-amber-300 ml-1 font-bold">🎉 Subiu de Nível!</span>}
            </div>
          </div>
        </div>

        {newAchievement && (
          <div className="text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Conquista Desbloqueada!
          </div>
        )}
      </div>

      {/* Full Final Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Classificação Geral
        </div>
        <div className="divide-y divide-slate-800/60">
          {sortedPlayers.map((p, idx) => (
            <div
              key={p.id}
              className={`p-3.5 flex items-center justify-between ${
                p.id === currentUserId ? 'bg-emerald-500/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-500 w-5 text-center text-sm">
                  #{idx + 1}
                </span>
                <PlayerAvatar
                  avatar={p.avatar}
                  avatarColor={p.avatarColor}
                  size="sm"
                />
                <span className="font-bold text-sm text-white">{p.name}</span>
              </div>
              <div className="font-mono font-black text-base text-emerald-400">
                {p.score} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid sm:grid-cols-2 gap-3 pt-2">
        <button
          id="btn-play-again"
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="py-3.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>JOGAR NOVAMENTE</span>
        </button>

        <button
          id="btn-return-home"
          onClick={() => {
            sound.playClick();
            onReturnHome();
          }}
          className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>VOLTAR AO INÍCIO</span>
        </button>
      </div>
    </div>
  );
};
