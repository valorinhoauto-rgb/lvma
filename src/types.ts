/**
 * Types and Interfaces for STOP + TERMO + JUICE
 */

export type GameMode = 'stop_termo' | 'termo_multiplayer' | 'juice_photo' | 'forca';

export type WordDifficulty = 1 | 2 | 3 | 4; // 1: Fácil, 2: Médio, 3: Difícil, 4: Especialista

export interface WordEntry {
  word: string;             // Original com acentos (ex: "MACACO", "ÁRVORE")
  normalized: string;       // Maiúsculas A-Z sem acentos/hífens (ex: "MACACO", "ARVORE")
  length: number;           // Contagem de letras normalizadas
  categories: string[];     // Categorias (ex: ["animal", "natureza"])
  difficulty: WordDifficulty;
  hints?: string;           // Dica contextual
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface CombinationStats {
  category: string;
  letter: string;
  length: number;
  wordCount: number;
  sampleWords: string[];
  difficultyTier: 'muito_facil' | 'facil' | 'medio' | 'dificil' | 'muito_dificil';
}

export interface RoundRestrictions {
  mustContain?: string[];     // Letras que devem estar presentes
  mustNotContain?: string[];  // Letras proibidas
}

// Temas para o Modo Juice / Foto Desafio
export type JuiceThemeId =
  | 'brasil_geral'          // Especial Brasil (Lugares, Famosos, Músicas, Marcas e Comidas BR)
  | 'brasil_lugares'        // Lugares & Maravilhas do Brasil (Lençóis Maranhenses, Cristo, Cataratas, etc.)
  | 'brasil_musica'         // Música Brasileira (Cantores e Bandas BR)
  | 'brasil_famosos'        // Atores, Atrizes e Personalidades Brasileiras
  | 'brasil_marcas_comidas' // Marcas, Produtos e Culinária Típica do Brasil
  | 'mundo_cultura'         // Ícones Mundiais & Cultura Pop Internacional
  | 'todos';                // Todos os Temas Misturados

export interface JuiceThemeInfo {
  id: JuiceThemeId;
  name: string;
  emoji: string;
  description: string;
}

// Desafio no estilo JKLM / Juice (Adivinhe a Foto / Imagem)
export interface JuicePhotoChallenge {
  id: string;
  imageUrl: string;
  fallbackUrl?: string;
  category: string;
  targetName: string;
  normalizedTarget: string;
  aliases: string[];          // Nomes alternativos aceitos (ex: ["Freddie", "Farrokh", "Queen"])
  hint: string;
  letterCount: number;
  initialLetter: string;
  photoCredit?: string;       // Crédito da foto original
  themeId?: JuiceThemeId;     // Tema ao qual pertence
  isBrazilian?: boolean;      // Se é conteúdo de referência brasileira
}

export interface RoundConfig {
  roundNumber: number;
  totalRounds: number;
  letter: string;
  categoryId: string;
  categoryName: string;
  wordLength: number;
  timeLimit: number;          // Segundos (ex: 30)
  startedAt: number;          // Timestamp ms
  endsAt: number;             // Timestamp ms
  restrictions?: RoundRestrictions;
  targetWord?: string;        // Para modo Termo
  photoChallenge?: JuicePhotoChallenge; // Para modo Foto / Juice
  forcaChallenge?: {
    id: string;
    word: string;
    normalized: string;
    category: string;
    hint: string;
    difficulty?: 'facil' | 'medio' | 'dificil';
  };
}

export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface TermoGuessResult {
  guess: string;
  normalized: string;
  letterStatuses: LetterStatus[];
  isCorrect: boolean;
  timeMs?: number;
  inDictionary?: boolean;
}

export interface JuiceGuessResult {
  guess: string;
  isCorrect: boolean;
  isPartial?: boolean;              // Resposta meio certa (palavra parcial de termo composto)
  isClose: boolean;
  message: string;
  timeMs?: number;
  pointsAwarded?: number;
}

export interface AnswerVoteSummary {
  yes: number;
  no: number;
  voterIds: Record<string, boolean>; // voterId -> true (yes) / false (no)
}

export interface PlayerAnswer {
  playerId: string;
  playerName: string;
  rawAnswer: string;
  normalizedAnswer: string;
  isValid: boolean;
  isPartial?: boolean;              // Resposta meio certa (50% dos pontos no Juice)
  inDictionary: boolean;            // Indicador de se consta no dicionário
  isCommunityApproved: boolean;     // Aprovado pela votação dos jogadores (zoeiras/contexto)
  votes: AnswerVoteSummary;
  validationReason?: string;
  responseTimeMs: number;
  points: number;
  breakdown?: {
    base: number;
    speedBonus: number;
    rarityBonus: number;
    difficultyMultiplier: number;
  };
  isUnique?: boolean;
  termoGuesses?: TermoGuessResult[]; // Histórico de palpites no modo termo multiplayer
  juiceGuesses?: JuiceGuessResult[]; // Histórico de palpites no modo foto juice
  forcaGuesses?: string[];           // Letras tentadas no jogo da forca
  forcaWrongCount?: number;          // Quantidade de erros (0 a 6)
  forcaWon?: boolean;                // Se salvou o boneco / acertou
  forcaRevealedCount?: number;       // Quantas letras acertou
  guessedTarget?: boolean;
}

export interface Friend {
  id: string; // friend user ID
  nickname: string;
  name: string;
  avatar: string;
  avatarColor?: string;
  level?: number;
  addedAt: string;
}

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  avatar: string;
  avatarColor?: string;
  photoURL?: string;
  isHost: boolean;
  isBot?: boolean;
  score: number;
  roundScore: number;
  hasAnswered: boolean;
  isReady: boolean;
  consecutiveWins?: number;
  currentAnswer?: string;
}

export interface RoomSettings {
  totalRounds: number;
  timeLimit: number;          // 15, 20, 30, 45, 60
  minLength: number;          // 4
  maxLength: number;          // 9
  selectedCategories: string[];
  allowRestrictions: boolean; // Híbrido STOP + TERMO (letras obrigatórias/proibidas)
  gameMode: GameMode;
  scoringStyle: 'dynamic' | 'classic_stop'; // dynamic: 100 base + speed + rarity; classic: 10 (único) / 5 (repetido)
  votingTimeSeconds: number;  // Tempo para a fase de votação (ex: 20 segundos)
  juiceTheme?: JuiceThemeId;  // Tema selecionado para o modo Juice / Foto
  forcaCategory?: string;     // Categoria selecionada para o Jogo da Forca (ex: "Animais", "Infância & Brinquedos", "todas")
}

export type RoomStatus = 'lobby' | 'countdown' | 'round_active' | 'round_voting' | 'round_results' | 'game_over' | 'closed';

export interface ChatMessage {
  senderName: string;
  avatar: string;
  avatarColor?: string;
  text: string;
  timestamp: number;
}

export interface RoomState {
  roomId: string;
  status: RoomStatus;
  hostId: string;
  hostLeft?: boolean;
  closedReason?: string;
  kickedPlayerIds?: string[];
  settings: RoomSettings;
  players: Player[];
  currentRoundIndex: number;
  currentRound: RoundConfig | null;
  roundAnswers: Record<string, PlayerAnswer>; // playerId -> PlayerAnswer
  votingEndsAt?: number;
  possibleAnswersCount?: number;
  sampleValidAnswers?: string[];
  chatMessages?: ChatMessage[];
  history: {
    roundNumber: number;
    letter: string;
    categoryName: string;
    wordLength: number;
    answers: Record<string, PlayerAnswer>;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  nickname?: string;
  avatar: string;
  avatarColor?: string;
  photoURL?: string;
  hasConfiguredProfile?: boolean;
  nicknameLocked?: boolean;
  level: number;
  xp: number;
  gamesPlayed: number;
  gamesWon: number;
  totalCorrectWords: number;
  fastestResponseMs: number;
  achievements: string[];
  friends?: Friend[];
  email?: string;
  isGoogleAuth?: boolean;
}

export interface GameHistoryEntry {
  id?: string;
  userId?: string;
  roomId?: string;
  gameMode: GameMode;
  totalRounds?: number;
  score: number;
  rank: number;
  totalPlayers: number;
  playedAt?: string;
  xpGained?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
}

export interface WordSuggestion {
  id: string;
  word: string;
  category: string;
  submittedBy: string;
  timestamp: number;
}
