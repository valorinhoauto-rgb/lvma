/**
 * Avatar Categories, Color Themes and Nickname Helpers
 */

export interface AvatarColorTheme {
  id: string;
  name: string;
  bgGradient: string;
  borderClass: string;
  ringClass: string;
  previewColor: string;
}

export const AVATAR_COLOR_THEMES: AvatarColorTheme[] = [
  {
    id: 'emerald',
    name: 'Esmeralda',
    bgGradient: 'bg-gradient-to-tr from-emerald-600 to-teal-400',
    borderClass: 'border-emerald-400/50',
    ringClass: 'ring-emerald-400',
    previewColor: '#10b981'
  },
  {
    id: 'cyan',
    name: 'Ciano Oceano',
    bgGradient: 'bg-gradient-to-tr from-cyan-600 to-blue-500',
    borderClass: 'border-cyan-400/50',
    ringClass: 'ring-cyan-400',
    previewColor: '#06b6d4'
  },
  {
    id: 'purple',
    name: 'Púrpura Real',
    bgGradient: 'bg-gradient-to-tr from-purple-600 to-indigo-500',
    borderClass: 'border-purple-400/50',
    ringClass: 'ring-purple-400',
    previewColor: '#9333ea'
  },
  {
    id: 'pink',
    name: 'Rosa Neon',
    bgGradient: 'bg-gradient-to-tr from-pink-600 to-rose-400',
    borderClass: 'border-pink-400/50',
    ringClass: 'ring-pink-400',
    previewColor: '#ec4899'
  },
  {
    id: 'amber',
    name: 'Dourado Campeão',
    bgGradient: 'bg-gradient-to-tr from-amber-500 to-yellow-300',
    borderClass: 'border-amber-400/50',
    ringClass: 'ring-amber-400',
    previewColor: '#f59e0b'
  },
  {
    id: 'fire',
    name: 'Fogo Quente',
    bgGradient: 'bg-gradient-to-tr from-rose-600 to-orange-500',
    borderClass: 'border-rose-400/50',
    ringClass: 'ring-rose-400',
    previewColor: '#f43f5e'
  },
  {
    id: 'sunset',
    name: 'Pôr do Sol',
    bgGradient: 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600',
    borderClass: 'border-pink-400/50',
    ringClass: 'ring-pink-400',
    previewColor: '#d946ef'
  },
  {
    id: 'dark',
    name: 'Grafite Dark',
    bgGradient: 'bg-gradient-to-tr from-slate-800 to-slate-600',
    borderClass: 'border-slate-500/50',
    ringClass: 'ring-slate-400',
    previewColor: '#475569'
  }
];

export interface AvatarCategory {
  id: string;
  name: string;
  icon: string;
  avatars: string[];
}

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    id: 'animals',
    name: 'Bichos & Animais',
    icon: '🐾',
    avatars: [
      '🦊', '🐻', '🦁', '🐼', '🐯', '🦉', '🐺', '🐬',
      '🦄', '🐱', '🐶', '🐵', '🐧', '🦅', '🦈', '🐸',
      '🐨', '🐙', '🦖', '🐢'
    ]
  },
  {
    id: 'brasil',
    name: 'Brasil & Tropical',
    icon: '🇧🇷',
    avatars: [
      '🦜', '🦤', '🐊', '🐆', '⚽', '🌴', '🥥', '☕',
      '🎭', '☀️', '🌊', '🏄', '🦥', '🦩', '🍍', '🥁'
    ]
  },
  {
    id: 'gamer',
    name: 'Gamer & Ação',
    icon: '⚡',
    avatars: [
      '🚀', '⚡', '🎮', '👾', '🤖', '👑', '💎', '⚔️',
      '🛡️', '🏆', '🎯', '🔮', '🕹️', '🎲', '💣', '✨'
    ]
  },
  {
    id: 'characters',
    name: 'Personagens & Vibe',
    icon: '🎭',
    avatars: [
      '🧙', '🥷', '🤠', '🕵️', '👻', '👽', '🕶️', '🧑‍🚀',
      '🦸', '🦹', '🧜', '🧛', '🧟', '🎩', '🥳', '😎'
    ]
  },
  {
    id: 'objects',
    name: 'Lanches & Objetos',
    icon: '🍕',
    avatars: [
      '🔥', '⭐', '🍕', '🍩', '🌮', '🎸', '🎨', '🧩',
      '💡', '🌈', '🍀', '🥊', '🍔', '🍦', '🍿', '🎧'
    ]
  }
];

export function getAvatarColorTheme(colorId?: string): AvatarColorTheme {
  const found = AVATAR_COLOR_THEMES.find(t => t.id === colorId);
  return found || AVATAR_COLOR_THEMES[0];
}

// Fun preset nickname generator
const NICK_PREFIXES = [
  'Mestre', 'Capitão', 'Super', 'Veloz', 'Ninja', 'Doutor', 'Mega', 'Rei',
  'Fera', 'Astro', 'Lenda', 'Trovão', 'Chama', 'Detetive', 'Gênio'
];

const NICK_SUFFIXES = [
  'Stop', 'Termo', 'Palavras', 'Letras', 'Rápido', 'Esperto', 'Alpha', 'Pro',
  'Master', 'Flash', 'Fox', 'Star', 'Player', 'Gamer', 'BR'
];

export function generateRandomNickname(): string {
  const p = NICK_PREFIXES[Math.floor(Math.random() * NICK_PREFIXES.length)];
  const s = NICK_SUFFIXES[Math.floor(Math.random() * NICK_SUFFIXES.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${p}${s}${num}`;
}

export function getSuggestedNickname(fullNameOrEmail?: string): string {
  if (!fullNameOrEmail) return generateRandomNickname();

  const trimmed = fullNameOrEmail.trim();

  // If email, extract prefix before @
  if (trimmed.includes('@')) {
    const userPart = trimmed.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    if (userPart.length >= 3) {
      return userPart.slice(0, 14);
    }
  }

  // If name, take first name or two clean parts
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length > 0) {
    const first = parts[0].replace(/[^a-zA-Z0-9À-ÿ_]/g, '');
    if (first.length >= 3) {
      return first.slice(0, 14);
    }
  }

  return generateRandomNickname();
}
