/**
 * Motor de Palavras e Gerador de Rodadas para STOP + TERMO
 * Garante 100% de rodadas matematicamente jogáveis, sem combinações impossíveis.
 */

import { CATEGORIES, WORD_CATALOG, normalizeWord } from '../data/words.ts';
import { CombinationStats, LetterStatus, RoundConfig, RoundRestrictions, TermoGuessResult, WordEntry } from '../types.ts';
import { isValidTermoWord, getRandomTermoTarget, getAlternatingTermoLength } from '../data/termoDictionary.ts';

export { isValidTermoWord, getRandomTermoTarget, getAlternatingTermoLength };

// Dynamic runtime user-contributed suggestions storage
export const userSuggestions: Array<{
  id: string;
  word: string;
  category: string;
  submittedBy: string;
  timestamp: number;
}> = [];

class WordEngine {
  // Index: categoryId -> letter -> length -> WordEntry[]
  private index: Map<string, Map<string, Map<number, WordEntry[]>>> = new Map();
  // Lookup by normalized word: normalized -> WordEntry[]
  private lookup: Map<string, WordEntry[]> = new Map();
  // Valid combinations list with word counts
  private validCombinations: CombinationStats[] = [];

  constructor() {
    this.buildIndexes();
  }

  public buildIndexes() {
    this.index.clear();
    this.lookup.clear();
    this.validCombinations = [];

    // Initialize all categories in index
    for (const cat of CATEGORIES) {
      this.index.set(cat.id, new Map());
    }

    for (const entry of WORD_CATALOG) {
      // Add to lookup
      if (!this.lookup.has(entry.normalized)) {
        this.lookup.set(entry.normalized, []);
      }
      this.lookup.get(entry.normalized)!.push(entry);

      const firstLetter = entry.normalized[0];
      const len = entry.length;

      for (const catId of entry.categories) {
        let catMap = this.index.get(catId);
        if (!catMap) {
          catMap = new Map();
          this.index.set(catId, catMap);
        }

        let letterMap = catMap.get(firstLetter);
        if (!letterMap) {
          letterMap = new Map();
          catMap.set(firstLetter, letterMap);
        }

        let wordsList = letterMap.get(len);
        if (!wordsList) {
          wordsList = [];
          letterMap.set(len, wordsList);
        }

        wordsList.push(entry);
      }
    }

    // Build combinations stats
    for (const [catId, letterMap] of this.index.entries()) {
      for (const [letter, lengthMap] of letterMap.entries()) {
        for (const [length, words] of lengthMap.entries()) {
          if (words.length > 0) {
            let difficultyTier: CombinationStats['difficultyTier'] = 'facil';
            if (words.length <= 2) difficultyTier = 'muito_dificil';
            else if (words.length <= 5) difficultyTier = 'dificil';
            else if (words.length <= 15) difficultyTier = 'medio';
            else difficultyTier = 'facil';

            this.validCombinations.push({
              category: catId,
              letter,
              length,
              wordCount: words.length,
              sampleWords: words.slice(0, 5).map(w => w.word),
              difficultyTier
            });
          }
        }
      }
    }
  }

  public getValidWords(categoryId: string, letter: string, length: number): WordEntry[] {
    const catMap = this.index.get(categoryId);
    if (!catMap) return [];
    const letterMap = catMap.get(letter.toUpperCase());
    if (!letterMap) return [];
    return letterMap.get(length) || [];
  }

  public getWordsForCombination(categoryId: string, letter: string, length: number): WordEntry[] {
    return this.getValidWords(categoryId, letter, length);
  }

  public getRandomCombination(
    options: { minLength?: number; maxLength?: number; selectedCategories?: string[] },
    usedCombinations?: Set<string>
  ): CombinationStats {
    const { minLength = 4, maxLength = 9, selectedCategories } = options;
    const filtered = this.validCombinations.filter(c => {
      if (selectedCategories && selectedCategories.length > 0 && !selectedCategories.includes(c.category)) {
        return false;
      }
      if (c.length < minLength || c.length > maxLength) return false;
      if (usedCombinations && usedCombinations.has(`${c.category}_${c.letter}_${c.length}`)) return false;
      return true;
    });

    if (filtered.length > 0) {
      return filtered[Math.floor(Math.random() * filtered.length)];
    }
    return this.validCombinations[Math.floor(Math.random() * this.validCombinations.length)];
  }

  public getCombinations(categoryId?: string, minLength = 4, maxLength = 9): CombinationStats[] {
    return this.validCombinations.filter(c => {
      if (categoryId && c.category !== categoryId) return false;
      if (c.length < minLength || c.length > maxLength) return false;
      return true;
    });
  }

  /**
   * Generates a guaranteed-valid round that satisfies all constraints
   */
  public generateRound(options: {
    roundNumber: number;
    totalRounds: number;
    categories?: string[];
    minLength?: number;
    maxLength?: number;
    timeLimit?: number;
    usedCombinations?: Set<string>;
    allowRestrictions?: boolean;
    gameMode?: 'stop_classic' | 'stop_restrictions' | 'termo_guess';
  }): { round: RoundConfig; possibleWords: WordEntry[] } {
    const {
      roundNumber,
      totalRounds,
      categories = CATEGORIES.map(c => c.id),
      minLength = 4,
      maxLength = 9,
      timeLimit = 30,
      usedCombinations = new Set(),
      allowRestrictions = false,
      gameMode = 'stop_classic'
    } = options;

    // Filter available combinations
    const available = this.validCombinations.filter(c =>
      categories.includes(c.category) &&
      c.length >= minLength &&
      c.length <= maxLength &&
      !usedCombinations.has(`${c.category}:${c.letter}:${c.length}`)
    );

    const pool = available.length > 0 ? available : this.validCombinations.filter(c =>
      categories.includes(c.category) && c.length >= minLength && c.length <= maxLength
    );

    if (pool.length === 0) {
      // Fallback safe combination: Animal + M + 6 (Macaco)
      const fallback = this.validCombinations.find(c => c.category === 'animal' && c.letter === 'M') || this.validCombinations[0];
      const words = this.getValidWords(fallback.category, fallback.letter, fallback.length);
      const catInfo = CATEGORIES.find(c => c.id === fallback.category)!;
      const now = Date.now();
      return {
        round: {
          roundNumber,
          totalRounds,
          letter: fallback.letter,
          categoryId: fallback.category,
          categoryName: catInfo.name,
          wordLength: fallback.length,
          timeLimit,
          startedAt: now,
          endsAt: now + timeLimit * 1000,
          targetWord: words[0]?.normalized
        },
        possibleWords: words
      };
    }

    // Pick random combination from pool
    const selected = pool[Math.floor(Math.random() * pool.length)];
    const words = this.getValidWords(selected.category, selected.letter, selected.length);
    const catInfo = CATEGORIES.find(c => c.id === selected.category) || { name: selected.category };
    const now = Date.now();

    // Pick target word (especially for Termo mode)
    const targetWordEntry = words[Math.floor(Math.random() * words.length)];

    let restrictions: RoundRestrictions | undefined = undefined;
    if (allowRestrictions || gameMode === 'stop_restrictions') {
      // Find common and rare letters in matching words to create a fair restriction
      const targetLetters = targetWordEntry.normalized.split('').slice(1); // skip first letter
      const uniqueLetters = Array.from(new Set(targetLetters));
      if (uniqueLetters.length > 0) {
        const mustContainLetter = uniqueLetters[Math.floor(Math.random() * uniqueLetters.length)];
        // Find a letter not in targetWord
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const notInWord = alphabet.split('').filter(ch => !targetWordEntry.normalized.includes(ch));
        const mustNotContainLetter = notInWord[Math.floor(Math.random() * notInWord.length)];

        restrictions = {
          mustContain: [mustContainLetter],
          mustNotContain: [mustNotContainLetter]
        };
      }
    }

    const round: RoundConfig = {
      roundNumber,
      totalRounds,
      letter: selected.letter,
      categoryId: selected.category,
      categoryName: catInfo.name,
      wordLength: selected.length,
      timeLimit,
      startedAt: now,
      endsAt: now + timeLimit * 1000,
      restrictions,
      targetWord: targetWordEntry.normalized
    };

    return { round, possibleWords: words };
  }

  /**
   * Server-side validation of player's answer
   */
  public validateAnswer(
    rawAnswer: string,
    round: RoundConfig
  ): { isValid: boolean; normalized: string; reason?: string; wordEntry?: WordEntry } {
    const normalized = normalizeWord(rawAnswer);

    if (!normalized) {
      return { isValid: false, normalized: '', reason: 'Resposta vazia.' };
    }

    // 1. Initial letter check
    if (normalized[0] !== round.letter.toUpperCase()) {
      return {
        isValid: false,
        normalized,
        reason: `Deve começar com a letra ${round.letter.toUpperCase()}.`
      };
    }

    // 2. Exact length check
    if (normalized.length !== round.wordLength) {
      return {
        isValid: false,
        normalized,
        reason: `Deve ter exatamente ${round.wordLength} letras (digitou ${normalized.length}).`
      };
    }

    // 3. Restrictions check (STOP + TERMO hybrid)
    if (round.restrictions) {
      if (round.restrictions.mustContain) {
        for (const req of round.restrictions.mustContain) {
          if (!normalized.includes(req.toUpperCase())) {
            return {
              isValid: false,
              normalized,
              reason: `Deve conter a letra ${req.toUpperCase()}.`
            };
          }
        }
      }
      if (round.restrictions.mustNotContain) {
        for (const ban of round.restrictions.mustNotContain) {
          if (normalized.includes(ban.toUpperCase())) {
            return {
              isValid: false,
              normalized,
              reason: `Não pode conter a letra proibida ${ban.toUpperCase()}.`
            };
          }
        }
      }
    }

    // 4. Word bank existence & Category check
    const matches = this.lookup.get(normalized);
    if (!matches || matches.length === 0) {
      return {
        isValid: false,
        normalized,
        reason: 'Palavra não encontrada no dicionário do jogo.'
      };
    }

    // Check if any matching entry belongs to the round category
    const catMatch = matches.find(m => m.categories.includes(round.categoryId));
    if (!catMatch) {
      return {
        isValid: false,
        normalized,
        reason: `A palavra "${normalized}" não pertence à categoria ${round.categoryName}.`
      };
    }

    return {
      isValid: true,
      normalized,
      wordEntry: catMatch
    };
  }

  /**
   * Evaluates guess letters for Termo mode (green, yellow, gray)
   */
  public evaluateTermoGuess(guess: string, target: string): TermoGuessResult {
    const normGuess = normalizeWord(guess);
    const normTarget = normalizeWord(target);
    const len = normTarget.length;

    const statuses: LetterStatus[] = new Array(len).fill('absent');
    const targetLetterCounts: Record<string, number> = {};

    for (let i = 0; i < len; i++) {
      const ch = normTarget[i];
      targetLetterCounts[ch] = (targetLetterCounts[ch] || 0) + 1;
    }

    // Pass 1: exact matches (Green)
    for (let i = 0; i < len; i++) {
      if (normGuess[i] === normTarget[i]) {
        statuses[i] = 'correct';
        targetLetterCounts[normGuess[i]]--;
      }
    }

    // Pass 2: misplaced matches (Yellow)
    for (let i = 0; i < len; i++) {
      if (statuses[i] !== 'correct') {
        const ch = normGuess[i];
        if (targetLetterCounts[ch] && targetLetterCounts[ch] > 0) {
          statuses[i] = 'present';
          targetLetterCounts[ch]--;
        }
      }
    }

    const isValid = isValidTermoWord(normGuess);

    return {
      guess: normGuess,
      normalized: normGuess,
      letterStatuses: statuses,
      isCorrect: normGuess === normTarget,
      inDictionary: isValid
    };
  }

  public addSuggestion(word: string, category: string, submittedBy: string) {
    const id = 'sug_' + Math.random().toString(36).substring(2, 9);
    userSuggestions.unshift({
      id,
      word: word.trim(),
      category,
      submittedBy,
      timestamp: Date.now()
    });
    return id;
  }

  public getStats() {
    return {
      totalWords: WORD_CATALOG.length,
      totalCategories: CATEGORIES.length,
      totalCombinations: this.validCombinations.length,
      pendingSuggestions: userSuggestions.length
    };
  }
}

export const wordEngine = new WordEngine();
