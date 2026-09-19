/**
 * Gerenciamento de Perfil do Jogador, XP, Níveis e Conquistas
 */

import { Achievement, UserProfile } from '../types.ts';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_win',
    title: 'Primeira Vitória',
    description: 'Vença sua primeira partida no STOP + TERMO.',
    icon: 'Trophy',
    xpReward: 150
  },
  {
    id: 'speedster',
    title: 'Velocista',
    description: 'Responda corretamente em menos de 5 segundos.',
    icon: 'Zap',
    xpReward: 100
  },
  {
    id: 'rarity',
    title: 'Raridade Pura',
    description: 'Dê uma resposta válida e única que ninguém mais usou na rodada.',
    icon: 'Sparkles',
    xpReward: 120
  },
  {
    id: 'encyclopedia',
    title: 'Enciclopédia',
    description: 'Acerte 20 palavras válidas em qualquer modo de jogo.',
    icon: 'BookOpen',
    xpReward: 200
  },
  {
    id: 'termo_master',
    title: 'Mestre do TERMO',
    description: 'Adivinhe a palavra secreta no modo TERMO em 4 tentativas ou menos.',
    icon: 'Target',
    xpReward: 180
  },
  {
    id: 'flawless',
    title: 'Perfeccionista',
    description: 'Conclua uma partida completa acertando todas as rodadas.',
    icon: 'Crown',
    xpReward: 250
  }
];

const AVATARS = ['🦊', '🐻', '🦁', '🐼', '🐯', '🦉', '🐺', '🐬', '🦄', '🚀', '⚡', '👑'];

export function getOrCreateUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      id: 'usr_guest',
      name: 'Jogador',
      avatar: '🦊',
      level: 1,
      xp: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      totalCorrectWords: 0,
      fastestResponseMs: 999999,
      achievements: []
    };
  }

  const stored = localStorage.getItem('stop_termo_profile');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (!parsed.avatarColor) parsed.avatarColor = 'emerald';
      if (!parsed.nickname) parsed.nickname = parsed.name;
      return parsed;
    } catch {}
  }

  const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const defaultName = `Jogador${randomSuffix}`;
  const newProfile: UserProfile = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: defaultName,
    nickname: defaultName,
    avatar: randomAvatar,
    avatarColor: 'emerald',
    hasConfiguredProfile: false,
    level: 1,
    xp: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    totalCorrectWords: 0,
    fastestResponseMs: 999999,
    achievements: []
  };

  localStorage.setItem('stop_termo_profile', JSON.stringify(newProfile));
  return newProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('stop_termo_profile', JSON.stringify(profile));
}

export function calculateLevel(xp: number): { level: number; currentLevelXp: number; nextLevelXp: number; progressPercent: number } {
  // 200 XP per level scaling gently
  const xpPerLevel = 250;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const currentLevelXp = xp % xpPerLevel;
  const nextLevelXp = xpPerLevel;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

  return { level, currentLevelXp, nextLevelXp, progressPercent };
}

export function addXpToProfile(amount: number): { profile: UserProfile; leveledUp: boolean } {
  const profile = getOrCreateUserProfile();
  const oldLevel = calculateLevel(profile.xp).level;
  profile.xp += amount;
  const newLevel = calculateLevel(profile.xp).level;
  profile.level = newLevel;
  saveUserProfile(profile);

  return { profile, leveledUp: newLevel > oldLevel };
}

export function unlockAchievement(achievementId: string): { unlocked: boolean; achievement?: Achievement } {
  const profile = getOrCreateUserProfile();
  if (profile.achievements.includes(achievementId)) {
    return { unlocked: false };
  }

  const found = ACHIEVEMENTS_LIST.find(a => a.id === achievementId);
  if (!found) return { unlocked: false };

  profile.achievements.push(achievementId);
  profile.xp += found.xpReward;
  profile.level = calculateLevel(profile.xp).level;
  saveUserProfile(profile);

  return { unlocked: true, achievement: found };
}
