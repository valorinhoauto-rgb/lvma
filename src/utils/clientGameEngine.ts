/**
 * Client-Side Game Engine with optional Firestore Synchronization
 * Permite que MALM funcione 100% no Netlify ou em ambientes estáticos
 * sem falhar com 404 em /api/rooms.
 */

import { doc, onSnapshot, setDoc, getDoc, Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { CATEGORIES } from '../data/words.ts';
import { getRandomJuicePhoto, validateJuiceGuessDetailed } from '../data/juicePhotos.ts';
import { wordEngine } from '../server/wordEngine.ts';
import {
  JuiceGuessResult,
  Player,
  PlayerAnswer,
  RoomSettings,
  RoomState,
  RoundConfig,
  TermoGuessResult,
  WordEntry
} from '../types.ts';

export type GameEventListener = (event: string, payload: any) => void;

class ClientGameEngine {
  private activeRoom: RoomState | null = null;
  private listeners: Set<(room: RoomState) => void> = new Set();
  private eventListeners: Set<GameEventListener> = new Set();
  private firestoreUnsub: Unsubscribe | null = null;
  private timerHandle: any = null;
  private botTimers: any[] = [];
  private possibleCurrentWords: WordEntry[] = [];
  private usedCombinations: Set<string> = new Set();
  private usedPhotoIds: Set<string> = new Set();
  private isHost: boolean = false;

  public subscribe(cb: (room: RoomState) => void) {
    this.listeners.add(cb);
    if (this.activeRoom) cb(this.activeRoom);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public onEvent(listener: GameEventListener) {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  private notify(event?: string, payload?: any) {
    if (this.activeRoom) {
      for (const cb of this.listeners) {
        cb({ ...this.activeRoom });
      }
    }
    if (event) {
      for (const el of this.eventListeners) {
        el(event, payload);
      }
    }
  }

  private async syncToFirestore(roomState: RoomState) {
    try {
      if (!roomState.roomId) return;
      const roomRef = doc(db, 'rooms', roomState.roomId);
      // Clean undefined fields for Firestore
      const cleanState = JSON.parse(JSON.stringify(roomState));
      await setDoc(roomRef, cleanState, { merge: true });
    } catch (err) {
      // Offline fallback: keep running in local memory
      console.warn('Firestore room sync skipped (offline or permission):', err);
    }
  }

  public listenToFirestoreRoom(roomId: string) {
    if (this.firestoreUnsub) {
      this.firestoreUnsub();
      this.firestoreUnsub = null;
    }
    try {
      const roomRef = doc(db, 'rooms', roomId);
      this.firestoreUnsub = onSnapshot(roomRef, (snap) => {
        if (snap.exists()) {
          const remoteState = snap.data() as RoomState;
          if (remoteState) {
            this.activeRoom = remoteState;
            this.notify('room:update', { room: remoteState });
          }
        }
      });
    } catch (err) {
      console.warn('Could not subscribe to Firestore room:', err);
    }
  }

  public async createRoom(hostPlayer: Player, settings?: Partial<RoomSettings>): Promise<RoomState> {
    this.clearTimers();
    this.isHost = true;

    // Generate readable 5-character room code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const defaultSettings: RoomSettings = {
      totalRounds: 5,
      timeLimit: 30,
      minLength: 4,
      maxLength: 9,
      selectedCategories: CATEGORIES.map(c => c.id),
      allowRestrictions: false,
      gameMode: 'stop_termo',
      scoringStyle: 'dynamic',
      votingTimeSeconds: 20
    };

    const roomState: RoomState = {
      roomId: code,
      status: 'lobby',
      hostId: hostPlayer.id,
      settings: { ...defaultSettings, ...settings },
      players: [{ ...hostPlayer, isHost: true, score: 0, roundScore: 0, hasAnswered: false, isReady: true }],
      currentRoundIndex: 0,
      currentRound: null,
      roundAnswers: {},
      history: []
    };

    this.activeRoom = roomState;
    this.notify('room:update', { room: roomState });
    await this.syncToFirestore(roomState);
    this.listenToFirestoreRoom(code);
    return roomState;
  }

  public async joinRoom(roomId: string, player: Player): Promise<RoomState | null> {
    this.clearTimers();
    const cleanCode = roomId.toUpperCase().trim();

    try {
      const roomRef = doc(db, 'rooms', cleanCode);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const remoteState = snap.data() as RoomState;
        const exists = remoteState.players.some(p => p.id === player.id);
        if (!exists) {
          remoteState.players.push({
            ...player,
            isHost: false,
            score: 0,
            roundScore: 0,
            hasAnswered: false,
            isReady: true
          });
          await setDoc(roomRef, remoteState, { merge: true });
        }
        this.activeRoom = remoteState;
        this.isHost = remoteState.hostId === player.id;
        this.notify('room:update', { room: remoteState });
        this.listenToFirestoreRoom(cleanCode);
        return remoteState;
      }
    } catch (err) {
      console.warn('Firestore join error:', err);
    }

    // If active in local memory
    if (this.activeRoom && this.activeRoom.roomId === cleanCode) {
      const exists = this.activeRoom.players.some(p => p.id === player.id);
      if (!exists) {
        this.activeRoom.players.push({
          ...player,
          isHost: false,
          score: 0,
          roundScore: 0,
          hasAnswered: false,
          isReady: true
        });
      }
      this.notify('room:update', { room: this.activeRoom });
      return this.activeRoom;
    }

    return null;
  }

  public addBot(): RoomState | null {
    if (!this.activeRoom) return null;
    const botNames = ['Capivara Esperta', 'Mestre Aurélio', 'Zeca Pagodinho', 'Carmen Miranda', 'Gabi Palavreira', 'Professor Pasquale'];
    const botAvatars = ['🤖', '🦊', '🦁', '🦉', '⚡', '☕'];
    const usedNames = new Set(this.activeRoom.players.map(p => p.name));
    const available = botNames.filter(n => !usedNames.has(n));
    const name = available[Math.floor(Math.random() * available.length)] || `Bot ${this.activeRoom.players.length}`;
    const avatar = botAvatars[Math.floor(Math.random() * botAvatars.length)];

    const botId = 'bot_' + Math.random().toString(36).substring(2, 7);
    const bot: Player = {
      id: botId,
      name,
      avatar,
      isHost: false,
      isBot: true,
      score: 0,
      roundScore: 0,
      hasAnswered: false,
      isReady: true
    };

    this.activeRoom.players.push(bot);
    this.notify('room:update', { room: this.activeRoom });
    this.syncToFirestore(this.activeRoom);
    return this.activeRoom;
  }

  public updateSettings(newSettings: Partial<RoomSettings>): RoomState | null {
    if (!this.activeRoom) return null;
    this.activeRoom.settings = { ...this.activeRoom.settings, ...newSettings };
    this.notify('room:update', { room: this.activeRoom });
    this.syncToFirestore(this.activeRoom);
    return this.activeRoom;
  }

  public startRound(): RoomState | null {
    if (!this.activeRoom) return null;
    this.clearTimers();

    const roundNumber = this.activeRoom.currentRoundIndex + 1;
    const { minLength, maxLength, selectedCategories, timeLimit, gameMode } = this.activeRoom.settings;

    let round: RoundConfig;

    if (gameMode === 'juice_photo') {
      const challenge = getRandomJuicePhoto(
        Array.from(this.usedPhotoIds),
        this.activeRoom.settings.juiceTheme || 'brasil_geral'
      );
      this.usedPhotoIds.add(challenge.id);

      const now = Date.now();
      const juiceTime = Math.min(35, Math.max(20, timeLimit));
      round = {
        roundNumber,
        totalRounds: this.activeRoom.settings.totalRounds,
        letter: challenge.initialLetter,
        categoryId: 'juice_photo',
        categoryName: challenge.category,
        wordLength: challenge.letterCount,
        timeLimit: juiceTime,
        startedAt: now,
        endsAt: now + (juiceTime * 1000),
        photoChallenge: challenge
      };
      this.possibleCurrentWords = [];
    } else if (gameMode === 'termo_multiplayer') {
      const targetLength = Math.random() < 0.6 ? 5 : 6;
      const comb = wordEngine.getRandomCombination({
        minLength: targetLength,
        maxLength: targetLength,
        selectedCategories
      }, this.usedCombinations);

      const possibleWords = wordEngine.getWordsForCombination(comb.category, comb.letter, comb.length);
      const chosenWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
      this.possibleCurrentWords = possibleWords;

      const cat = CATEGORIES.find(c => c.id === comb.category);
      const now = Date.now();
      round = {
        roundNumber,
        totalRounds: this.activeRoom.settings.totalRounds,
        letter: comb.letter,
        categoryId: comb.category,
        categoryName: cat ? cat.name : comb.category,
        wordLength: chosenWord.length,
        timeLimit: Math.max(45, timeLimit),
        startedAt: now,
        endsAt: now + (Math.max(45, timeLimit) * 1000),
        targetWord: chosenWord.normalized
      };
    } else {
      const comb = wordEngine.getRandomCombination({
        minLength,
        maxLength,
        selectedCategories
      }, this.usedCombinations);

      this.usedCombinations.add(`${comb.category}_${comb.letter}_${comb.length}`);
      const possibleWords = wordEngine.getWordsForCombination(comb.category, comb.letter, comb.length);
      this.possibleCurrentWords = possibleWords;

      const cat = CATEGORIES.find(c => c.id === comb.category);
      const now = Date.now();
      round = {
        roundNumber,
        totalRounds: this.activeRoom.settings.totalRounds,
        letter: comb.letter,
        categoryId: comb.category,
        categoryName: cat ? cat.name : comb.category,
        wordLength: comb.length,
        timeLimit,
        startedAt: now,
        endsAt: now + (timeLimit * 1000),
        targetWord: possibleWords[0]?.normalized
      };
    }

    this.activeRoom.currentRound = round;
    this.activeRoom.status = 'round_active';
    this.activeRoom.roundAnswers = {};
    this.activeRoom.possibleAnswersCount = this.possibleCurrentWords.length;

    for (const p of this.activeRoom.players) {
      p.hasAnswered = false;
      p.roundScore = 0;
      p.currentAnswer = undefined;
    }

    this.notify('round:start', { round, possibleCount: this.possibleCurrentWords.length });
    this.notify('room:update', { room: this.activeRoom });
    this.syncToFirestore(this.activeRoom);

    // Schedule bots answers
    this.scheduleBotAnswers(round);

    // Round timer
    const durationMs = (round.timeLimit * 1000) + 500;
    this.timerHandle = setTimeout(() => {
      this.handleRoundTimeUp();
    }, durationMs);

    return this.activeRoom;
  }

  private scheduleBotAnswers(round: RoundConfig) {
    if (!this.activeRoom) return;
    const bots = this.activeRoom.players.filter(p => p.isBot);

    for (const bot of bots) {
      const willAnswer = Math.random() < 0.90;
      if (!willAnswer) continue;

      let chosenText = '';
      if (round.photoChallenge) {
        chosenText = round.photoChallenge.targetName;
      } else if (this.possibleCurrentWords.length > 0) {
        const picked = this.possibleCurrentWords[Math.floor(Math.random() * this.possibleCurrentWords.length)];
        chosenText = picked.word;
      } else {
        chosenText = `${round.letter}PALAVRA`;
      }

      const delaySec = Math.floor(Math.random() * (round.timeLimit * 0.65)) + 3;
      const t = setTimeout(() => {
        if (this.activeRoom && this.activeRoom.status === 'round_active') {
          this.submitAnswer(bot.id, chosenText);
        }
      }, delaySec * 1000);
      this.botTimers.push(t);
    }
  }

  public submitAnswer(playerId: string, rawAnswer: string) {
    if (!this.activeRoom || this.activeRoom.status !== 'round_active' || !this.activeRoom.currentRound) {
      return null;
    }

    const player = this.activeRoom.players.find(p => p.id === playerId);
    if (!player) return null;

    const round = this.activeRoom.currentRound;
    const now = Date.now();
    const responseTimeMs = Math.max(500, now - round.startedAt);

    if (round.photoChallenge) {
      const validation = validateJuiceGuessDetailed(rawAnswer, round.photoChallenge);
      const isCorrect = validation.isCorrect;
      const existingRecord = this.activeRoom.roundAnswers[playerId];
      const previousGuesses: JuiceGuessResult[] = existingRecord?.juiceGuesses || [];

      const guessObj: JuiceGuessResult = {
        guess: rawAnswer,
        isCorrect,
        isClose: validation.isClose,
        message: validation.message,
        timeMs: responseTimeMs
      };

      const updatedGuesses = [...previousGuesses, guessObj];
      const points = isCorrect ? Math.max(50, Math.round(150 - (responseTimeMs / 1000) * 3)) : (existingRecord?.points || 0);

      const answerRecord: PlayerAnswer = {
        playerId,
        playerName: player.name,
        rawAnswer,
        normalizedAnswer: validation.normalizedGuess,
        isValid: isCorrect || (existingRecord?.isValid ?? false),
        inDictionary: true,
        isCommunityApproved: isCorrect || (existingRecord?.isCommunityApproved ?? false),
        votes: { yes: 0, no: 0, voterIds: {} },
        responseTimeMs,
        points,
        validationReason: isCorrect ? 'Acertou o desafio!' : validation.message,
        guessedTarget: isCorrect || (existingRecord?.guessedTarget ?? false),
        juiceGuesses: updatedGuesses
      };

      this.activeRoom.roundAnswers[playerId] = answerRecord;
      if (isCorrect) {
        player.hasAnswered = true;
        player.currentAnswer = rawAnswer;
      }

      this.notify('juice:guess_result', {
        playerId,
        playerName: player.name,
        guessResult: guessObj,
        hasAnswered: player.hasAnswered,
        isCorrect,
        isClose: validation.isClose
      });

      const allAnswered = this.activeRoom.players.every(p => p.hasAnswered);
      if (allAnswered) {
        this.clearTimers();
        setTimeout(() => this.handleRoundTimeUp(), 1000);
      } else {
        this.notify('room:update', { room: this.activeRoom });
        this.syncToFirestore(this.activeRoom);
      }

      return {
        room: this.activeRoom,
        validation: {
          isValid: isCorrect,
          isClose: validation.isClose,
          message: validation.message,
          guessObj
        }
      };
    }

    if (this.activeRoom.settings.gameMode === 'termo_multiplayer') {
      const target = round.targetWord || '';
      const cleanGuess = rawAnswer.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (cleanGuess.length !== round.wordLength) {
        return null;
      }

      const evaluated = wordEngine.evaluateTermoGuess(cleanGuess, target);
      const isCorrect = evaluated.isCorrect;
      const existingRecord = this.activeRoom.roundAnswers[playerId];
      const previousGuesses = existingRecord?.termoGuesses || [];

      const guessObj: TermoGuessResult = {
        guess: rawAnswer,
        normalized: cleanGuess,
        letterStatuses: evaluated.letterStatuses,
        isCorrect,
        timeMs: responseTimeMs
      };

      const updatedGuesses = [...previousGuesses, guessObj];
      const hasWon = isCorrect;
      const isOutOfTries = updatedGuesses.length >= 6;

      const answerRecord: PlayerAnswer = {
        playerId,
        playerName: player.name,
        rawAnswer,
        normalizedAnswer: cleanGuess,
        isValid: hasWon,
        inDictionary: true,
        isCommunityApproved: hasWon,
        votes: { yes: 0, no: 0, voterIds: {} },
        responseTimeMs,
        points: hasWon ? Math.max(40, (7 - updatedGuesses.length) * 25) : 0,
        validationReason: hasWon ? `Acertou na tentativa ${updatedGuesses.length}/6!` : (isOutOfTries ? 'Esgotou as 6 tentativas.' : `Tentativa ${updatedGuesses.length}/6`),
        termoGuesses: updatedGuesses
      };

      this.activeRoom.roundAnswers[playerId] = answerRecord;
      if (hasWon || isOutOfTries) {
        player.hasAnswered = true;
        player.currentAnswer = rawAnswer;
      }

      const allAnswered = this.activeRoom.players.every(p => p.hasAnswered);
      if (allAnswered) {
        this.clearTimers();
        setTimeout(() => this.handleRoundTimeUp(), 1000);
      } else {
        this.notify('room:update', { room: this.activeRoom });
        this.syncToFirestore(this.activeRoom);
      }

      return {
        room: this.activeRoom,
        validation: {
          isValid: isCorrect,
          evaluated,
          guessObj
        }
      };
    }

    // Modo STOP + TERMO Clássico
    const validation = wordEngine.validateAnswer(rawAnswer, round);
    const answerRecord: PlayerAnswer = {
      playerId,
      playerName: player.name,
      rawAnswer,
      normalizedAnswer: validation.normalized,
      isValid: validation.isValid,
      inDictionary: validation.isValid,
      isCommunityApproved: false,
      votes: { yes: 0, no: 0, voterIds: {} },
      validationReason: validation.reason,
      responseTimeMs,
      points: 0
    };

    this.activeRoom.roundAnswers[playerId] = answerRecord;
    player.hasAnswered = true;
    player.currentAnswer = rawAnswer;

    this.notify('round:player_answered', { playerId, playerName: player.name, hasAnswered: true });

    const allAnswered = this.activeRoom.players.every(p => p.hasAnswered);
    if (allAnswered) {
      this.clearTimers();
      setTimeout(() => this.handleRoundTimeUp(), 1000);
    } else {
      this.notify('room:update', { room: this.activeRoom });
      this.syncToFirestore(this.activeRoom);
    }

    return { room: this.activeRoom, validation };
  }

  public handleRoundTimeUp() {
    this.clearTimers();
    if (!this.activeRoom) return;

    if (this.activeRoom.settings.gameMode === 'stop_termo') {
      const answers = Object.values(this.activeRoom.roundAnswers).filter(a => a.rawAnswer.trim().length > 0);
      if (answers.length > 0) {
        this.startVotingPhase();
        return;
      }
    }

    this.endRound();
  }

  public startVotingPhase() {
    if (!this.activeRoom) return;
    this.activeRoom.status = 'round_voting';
    const votingSecs = this.activeRoom.settings.votingTimeSeconds || 20;
    this.activeRoom.votingEndsAt = Date.now() + (votingSecs * 1000);

    // Initial bot automated votes
    const bots = this.activeRoom.players.filter(p => p.isBot);
    for (const ans of Object.values(this.activeRoom.roundAnswers)) {
      ans.votes = { yes: 0, no: 0, voterIds: {} };
      for (const bot of bots) {
        if (bot.id !== ans.playerId) {
          const approves = ans.inDictionary || (ans.rawAnswer.length >= 3 && Math.random() < 0.85);
          ans.votes.voterIds[bot.id] = approves;
          if (approves) ans.votes.yes++;
          else ans.votes.no++;
        }
      }
    }

    this.notify('round:voting_start', {
      votingEndsAt: this.activeRoom.votingEndsAt,
      answers: this.activeRoom.roundAnswers
    });
    this.notify('room:update', { room: this.activeRoom });
    this.syncToFirestore(this.activeRoom);

    this.timerHandle = setTimeout(() => {
      this.concludeVoting();
    }, (votingSecs * 1000) + 500);
  }

  public castVote(voterId: string, targetPlayerId: string, approve: boolean) {
    if (!this.activeRoom || this.activeRoom.status !== 'round_voting') return null;
    const ans = this.activeRoom.roundAnswers[targetPlayerId];
    if (!ans) return null;

    if (!ans.votes) {
      ans.votes = { yes: 0, no: 0, voterIds: {} };
    }

    const prev = ans.votes.voterIds[voterId];
    if (prev !== undefined) {
      if (prev) ans.votes.yes--;
      else ans.votes.no--;
    }

    ans.votes.voterIds[voterId] = approve;
    if (approve) ans.votes.yes++;
    else ans.votes.no++;

    this.notify('round:vote_cast', { voterId, targetPlayerId, approve, votes: ans.votes });
    this.notify('room:update', { room: this.activeRoom });
    this.syncToFirestore(this.activeRoom);
    return this.activeRoom;
  }

  public concludeVoting() {
    this.clearTimers();
    if (!this.activeRoom || this.activeRoom.status !== 'round_voting') return;

    for (const ans of Object.values(this.activeRoom.roundAnswers)) {
      const votes = ans.votes || { yes: 0, no: 0, voterIds: {} };
      const approved = votes.yes >= votes.no;
      ans.isCommunityApproved = approved;
      ans.isValid = approved;
      if (!approved) {
        ans.validationReason = 'Rejeitado na votação da galera.';
      } else if (!ans.inDictionary) {
        ans.validationReason = 'Aprovado pelos jogadores!';
      }
    }

    this.endRound();
  }

  public endRound() {
    this.clearTimers();
    if (!this.activeRoom) return;

    this.activeRoom.status = 'round_results';
    const answers = Object.values(this.activeRoom.roundAnswers);
    const validAnswers = answers.filter(a => a.isValid);

    const wordCounts: Record<string, number> = {};
    for (const ans of validAnswers) {
      const norm = ans.normalizedAnswer;
      wordCounts[norm] = (wordCounts[norm] || 0) + 1;
    }

    for (const ans of answers) {
      let pts = 0;
      if (this.activeRoom.settings.gameMode === 'juice_photo' || this.activeRoom.settings.gameMode === 'termo_multiplayer') {
        pts = ans.points;
      } else {
        if (ans.isValid) {
          const count = wordCounts[ans.normalizedAnswer] || 1;
          const base = count === 1 ? 100 : 50;
          const timeBonus = Math.max(0, Math.round(30 - (ans.responseTimeMs / 1000) * 1.5));
          pts = base + timeBonus;
        }
        ans.points = pts;
      }

      const player = this.activeRoom.players.find(p => p.id === ans.playerId);
      if (player) {
        player.roundScore = pts;
        player.score += pts;
      }
    }

    this.activeRoom.players.sort((a, b) => b.score - a.score);

    // Provide sample valid answers
    if (this.possibleCurrentWords.length > 0) {
      this.activeRoom.sampleValidAnswers = this.possibleCurrentWords.slice(0, 8).map(w => w.word);
    }

    this.notify('round:end', { answers: this.activeRoom.roundAnswers, players: this.activeRoom.players });
    this.notify('room:update', { room: this.activeRoom });
    this.syncToFirestore(this.activeRoom);
  }

  public nextRound() {
    if (!this.activeRoom) return null;
    this.activeRoom.currentRoundIndex++;

    if (this.activeRoom.currentRoundIndex >= this.activeRoom.settings.totalRounds) {
      this.activeRoom.status = 'game_over';
      this.notify('game:end', { players: this.activeRoom.players });
      this.notify('room:update', { room: this.activeRoom });
      this.syncToFirestore(this.activeRoom);
      return this.activeRoom;
    }

    return this.startRound();
  }

  public resetToLobby() {
    if (!this.activeRoom) return null;
    this.clearTimers();
    this.activeRoom.status = 'lobby';
    this.activeRoom.currentRoundIndex = 0;
    this.activeRoom.currentRound = null;
    this.activeRoom.roundAnswers = {};
    for (const p of this.activeRoom.players) {
      p.score = 0;
      p.roundScore = 0;
      p.hasAnswered = false;
      p.currentAnswer = undefined;
    }
    this.notify('room:update', { room: this.activeRoom });
    this.syncToFirestore(this.activeRoom);
    return this.activeRoom;
  }

  public clearTimers() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
    for (const t of this.botTimers) {
      clearTimeout(t);
    }
    this.botTimers = [];
  }

  public leaveRoom() {
    this.clearTimers();
    if (this.firestoreUnsub) {
      this.firestoreUnsub();
      this.firestoreUnsub = null;
    }
    this.activeRoom = null;
    this.isHost = false;
  }
}

export const clientGameEngine = new ClientGameEngine();
