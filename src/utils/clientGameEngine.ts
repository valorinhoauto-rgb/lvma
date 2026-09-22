/**
 * Client-Side Game Engine with optional Firestore Synchronization
 * Permite que MALM funcione 100% no Netlify ou em ambientes estáticos
 * sem falhar com 404 em /api/rooms.
 */

import { doc, onSnapshot, setDoc, getDoc, runTransaction, updateDoc, Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { CATEGORIES } from '../data/words.ts';
import { getRandomJuicePhoto, validateJuiceGuessDetailed } from '../data/juicePhotos.ts';
import { getRandomForcaChallenge, normalizeForcaString, ForcaChallenge } from '../data/forcaWords.ts';
import { wordEngine } from '../server/wordEngine.ts';
import { isValidTermoWord, getRandomTermoTarget, getAlternatingTermoLength } from '../data/termoDictionary.ts';
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
  private possibleCurrentWords: WordEntry[] = [];
  private usedCombinations: Set<string> = new Set();
  private usedPhotoIds: Set<string> = new Set();
  private usedForcaIds: Set<string> = new Set();
  private isHost: boolean = false;
  private myPlayerId: string | null = null;
  private isAdvancingRound: boolean = false;

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

  public async syncToFirestore(roomState: RoomState) {
    try {
      if (!roomState.roomId) return;
      const roomRef = doc(db, 'rooms', roomState.roomId);
      // Clean undefined fields for Firestore
      const cleanState = JSON.parse(JSON.stringify(roomState));
      await setDoc(roomRef, cleanState, { merge: true });
    } catch (err) {
      console.warn('Firestore room sync error:', err);
    }
  }

  /**
   * Atualização atômica concorrente de respostas de jogadores no Firestore.
   * Garante que quando dois ou mais jogadores clicarem em confirmar exatamente no mesmo milissegundo,
   * nenhuma resposta seja sobrescrita e ambos os acertos sejam computados!
   */
  public async submitAnswerToFirestore(
    roomId: string,
    playerId: string,
    answerRecord: PlayerAnswer,
    playerUpdates: Partial<Player>
  ) {
    if (!roomId) return;
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(roomRef);
        if (!snap.exists()) return;
        const currentData = snap.data() as RoomState;
        if (!currentData || currentData.status !== 'round_active') return;

        const remotePlayers = (currentData.players || []).map(p => {
          if (p.id === playerId) {
            return {
              ...p,
              ...playerUpdates,
              hasAnswered: playerUpdates.hasAnswered !== undefined ? playerUpdates.hasAnswered : p.hasAnswered,
              currentAnswer: playerUpdates.currentAnswer !== undefined ? playerUpdates.currentAnswer : p.currentAnswer,
              roundScore: playerUpdates.roundScore !== undefined ? playerUpdates.roundScore : p.roundScore
            };
          }
          return p;
        });

        // No modo termo_multiplayer, só pode ter um único vencedor por rodada
        if (currentData.settings?.gameMode === 'termo_multiplayer' && answerRecord.isValid) {
          const existingWinner = Object.values(currentData.roundAnswers || {}).find(a => a.isValid && a.playerId !== playerId);
          if (existingWinner) {
            answerRecord.isValid = false;
            answerRecord.points = 0;
            answerRecord.validationReason = 'Acertou, mas outro jogador venceu primeiro!';
            const myPlayerObj = remotePlayers.find(p => p.id === playerId);
            if (myPlayerObj) myPlayerObj.roundScore = 0;
          }
        }

        transaction.update(roomRef, {
          [`roundAnswers.${playerId}`]: answerRecord,
          players: remotePlayers
        });
      });
    } catch (err) {
      console.warn('Firestore transaction error on submitAnswer, using fallback updateDoc:', err);
      try {
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          [`roundAnswers.${playerId}`]: answerRecord
        });
      } catch (fallbackErr) {
        console.warn('Fallback updateDoc failed:', fallbackErr);
      }
    }
  }

  public listenToFirestoreRoom(roomId: string) {
    if (this.firestoreUnsub) {
      this.firestoreUnsub();
      this.firestoreUnsub = null;
    }
    try {
      const roomRef = doc(db, 'rooms', roomId);
      let prevStatus: string | null = null;
      let prevRoundIndex: number = -1;

      this.firestoreUnsub = onSnapshot(roomRef, (snap) => {
        if (!snap.exists()) {
          this.notify('room:host_left', { reason: 'A sala foi encerrada pelo anfitrião.' });
          this.leaveRoom();
          return;
        }

        const remoteState = snap.data() as RoomState;
        if (remoteState) {
          if (remoteState.status === 'closed' || remoteState.hostLeft) {
            this.notify('room:host_left', { reason: remoteState.closedReason || 'O anfitrião saiu da sala.' });
            this.leaveRoom();
            return;
          }

          const statusChanged = prevStatus !== remoteState.status;
          const roundChanged = prevRoundIndex !== remoteState.currentRoundIndex;
          prevStatus = remoteState.status;
          prevRoundIndex = remoteState.currentRoundIndex;

          this.activeRoom = remoteState;
          if (this.myPlayerId) {
            this.isHost = remoteState.hostId === this.myPlayerId;
          }
          this.notify('room:update', { room: remoteState });

          if (statusChanged || roundChanged) {
            this.isAdvancingRound = false;
            if (remoteState.status === 'round_active' && remoteState.currentRound) {
              this.notify('round:start', { round: remoteState.currentRound });
            } else if (remoteState.status === 'round_voting') {
              this.notify('round:voting_start', { answers: remoteState.roundAnswers });
            } else if (remoteState.status === 'round_results') {
              this.notify('round:end', { answers: remoteState.roundAnswers, players: remoteState.players });
            } else if (remoteState.status === 'game_over') {
              this.notify('game:end', { players: remoteState.players });
            }
          }

          // Se eu sou o Host, checar autoritativamente se alguém venceu (Termo) ou se todos responderam para encerrar a rodada sem travar
          if (this.isHost && remoteState.status === 'round_active' && remoteState.players && remoteState.players.length > 0) {
            const isTermo = remoteState.settings?.gameMode === 'termo_multiplayer';
            const hasTermoWinner = isTermo && Object.values(remoteState.roundAnswers || {}).some(a => a.isValid);
            const allAnswered = remoteState.players.every(p => p.hasAnswered);

            if ((hasTermoWinner || allAnswered) && !this.isAdvancingRound) {
              this.isAdvancingRound = true;
              this.clearTimers();
              this.timerHandle = setTimeout(() => {
                this.handleRoundTimeUp();
                this.isAdvancingRound = false;
              }, 1200);
            }
          }
        }
      });
    } catch (err) {
      console.warn('Could not subscribe to Firestore room:', err);
    }
  }

  public async sendChatMessage(message: { senderName: string; avatar: string; text: string; timestamp: number }) {
    if (!this.activeRoom) return;
    const currentMessages = this.activeRoom.chatMessages || [];
    this.activeRoom.chatMessages = [...currentMessages.slice(-49), message];
    this.notify('chat:message', message);
    this.notify('room:update', { room: this.activeRoom });
    await this.syncToFirestore(this.activeRoom);
  }

  public async createRoom(hostPlayer: Player, settings?: Partial<RoomSettings>): Promise<RoomState> {
    this.clearTimers();
    this.isHost = true;
    this.myPlayerId = hostPlayer.id;

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
      chatMessages: [],
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
    this.myPlayerId = player.id;

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
          const cleanState = JSON.parse(JSON.stringify(remoteState));
          await setDoc(roomRef, cleanState, { merge: true });
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
        await this.syncToFirestore(this.activeRoom);
      }
      this.notify('room:update', { room: this.activeRoom });
      this.listenToFirestoreRoom(cleanCode);
      return this.activeRoom;
    }

    return null;
  }

  public kickPlayer(targetPlayerId: string): RoomState | null {
    if (!this.activeRoom) return null;
    // Host cannot be kicked
    if (targetPlayerId === this.activeRoom.hostId) return null;

    this.activeRoom.players = this.activeRoom.players.filter(p => p.id !== targetPlayerId);
    if (!this.activeRoom.kickedPlayerIds) {
      this.activeRoom.kickedPlayerIds = [];
    }
    if (!this.activeRoom.kickedPlayerIds.includes(targetPlayerId)) {
      this.activeRoom.kickedPlayerIds.push(targetPlayerId);
    }

    this.notify('room:update', { room: this.activeRoom });
    this.notify('player:kicked', { playerId: targetPlayerId });
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
      // Modo TERMO Coletivo: Alternar tamanho das palavras (5, 6 e 7 letras) sem revelar tema ou letra inicial
      const targetLength = getAlternatingTermoLength(roundNumber);
      const chosenWordNorm = getRandomTermoTarget(targetLength);
      this.possibleCurrentWords = [];

      const now = Date.now();
      round = {
        roundNumber,
        totalRounds: this.activeRoom.settings.totalRounds,
        letter: '?', // Sem dica de letra inicial
        categoryId: 'termo',
        categoryName: 'Palavra Secreta', // Sem tema que entregue a resposta
        wordLength: targetLength,
        timeLimit: 0, // Sem limite de tempo!
        startedAt: now,
        endsAt: 0,
        targetWord: chosenWordNorm
      };
    } else if (gameMode === 'forca') {
      // Modo JOGO DA FORCA (Infância & Clássico)
      const challenge = getRandomForcaChallenge(
        Array.from(this.usedForcaIds),
        this.activeRoom.settings.forcaCategory || 'todas'
      );
      this.usedForcaIds.add(challenge.id);

      const now = Date.now();
      round = {
        roundNumber,
        totalRounds: this.activeRoom.settings.totalRounds,
        letter: challenge.normalized[0] || '?',
        categoryId: 'forca',
        categoryName: challenge.category,
        wordLength: challenge.normalized.length,
        timeLimit: 0, // Sem limite de tempo estrito, para curtir a dedução!
        startedAt: now,
        endsAt: 0,
        targetWord: challenge.normalized,
        forcaChallenge: challenge
      };
      this.possibleCurrentWords = [];
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

    // Round timer (exceto no modo termo_multiplayer ou forca com tempo livre)
    if (this.activeRoom.settings.gameMode !== 'termo_multiplayer' && this.activeRoom.settings.gameMode !== 'forca' && round.timeLimit > 0) {
      const durationMs = (round.timeLimit * 1000) + 500;
      this.timerHandle = setTimeout(() => {
        this.handleRoundTimeUp();
      }, durationMs);
    }

    return this.activeRoom;
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
      const isPartial = Boolean(validation.isPartial);
      const existingRecord = this.activeRoom.roundAnswers[playerId];
      const previousGuesses: JuiceGuessResult[] = existingRecord?.juiceGuesses || [];

      // Cálculo de pontuação: resposta completa ganha pontos normais baseados na rapidez (50 a 150 pts).
      // Resposta "meio certa" (palavra parcial em termo composto, ex: "Cristo" em vez de "Cristo Redentor")
      // ganha 50% dos pontos, evitando qualquer vantagem injusta de velocidade sobre os outros.
      const baseSpeedPoints = Math.max(50, Math.round(150 - (responseTimeMs / 1000) * 3));
      const pointsMultiplier = validation.pointsMultiplier || (isPartial ? 0.5 : 1.0);
      const currentEarnedPoints = Math.max(25, Math.round(baseSpeedPoints * pointsMultiplier));

      const wasAlreadyFull = Boolean(existingRecord?.isValid && !existingRecord?.isPartial);
      let finalPoints = existingRecord?.points || 0;
      let finalIsPartial = existingRecord?.isPartial ?? isPartial;

      if (isCorrect) {
        if (!wasAlreadyFull) {
          if (!isPartial) {
            // Acertou a resposta completa (ou fez upgrade de meio certa para completa!)
            finalPoints = Math.max(finalPoints, currentEarnedPoints);
            finalIsPartial = false;
          } else {
            // Resposta meio certa
            finalPoints = Math.max(finalPoints, currentEarnedPoints);
            finalIsPartial = true;
          }
        }
      }

      const guessObj: JuiceGuessResult = {
        guess: rawAnswer,
        isCorrect,
        isPartial,
        isClose: validation.isClose,
        message: validation.message,
        timeMs: responseTimeMs,
        pointsAwarded: isCorrect ? currentEarnedPoints : 0
      };

      const updatedGuesses = [...previousGuesses, guessObj];

      const answerRecord: PlayerAnswer = {
        playerId,
        playerName: player.name,
        rawAnswer: isCorrect && !isPartial ? rawAnswer : (existingRecord?.rawAnswer || rawAnswer),
        normalizedAnswer: isCorrect && !isPartial ? validation.normalizedGuess : (existingRecord?.normalizedAnswer || validation.normalizedGuess),
        isValid: isCorrect || (existingRecord?.isValid ?? false),
        isPartial: finalIsPartial,
        inDictionary: true,
        isCommunityApproved: isCorrect || (existingRecord?.isCommunityApproved ?? false),
        votes: { yes: 0, no: 0, voterIds: {} },
        responseTimeMs,
        points: finalPoints,
        validationReason: isCorrect
          ? (finalIsPartial ? '⚡ Resposta Meio Certa (50% dos pontos)' : '🎉 Acertou o desafio completo!')
          : validation.message,
        guessedTarget: isCorrect || (existingRecord?.guessedTarget ?? false),
        juiceGuesses: updatedGuesses
      };

      this.activeRoom.roundAnswers[playerId] = answerRecord;
      if (isCorrect) {
        player.hasAnswered = true;
        player.currentAnswer = answerRecord.rawAnswer;
        player.roundScore = finalPoints;
      }

      this.notify('juice:guess_result', {
        playerId,
        playerName: player.name,
        guessResult: guessObj,
        hasAnswered: player.hasAnswered,
        isCorrect,
        isPartial: finalIsPartial,
        points: finalPoints,
        isClose: validation.isClose
      });

      this.notify('room:update', { room: this.activeRoom });
      this.submitAnswerToFirestore(this.activeRoom.roomId, playerId, answerRecord, {
        hasAnswered: player.hasAnswered,
        currentAnswer: player.currentAnswer,
        roundScore: player.roundScore
      });

      if (this.isHost) {
        const allAnswered = this.activeRoom.players.every(p => p.hasAnswered);
        if (allAnswered && !this.isAdvancingRound) {
          this.isAdvancingRound = true;
          this.clearTimers();
          this.timerHandle = setTimeout(() => {
            this.handleRoundTimeUp();
            this.isAdvancingRound = false;
          }, 1000);
        }
      }

      return {
        room: this.activeRoom,
        validation: {
          isValid: isCorrect,
          isPartial: finalIsPartial,
          points: finalPoints,
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

      if (!isValidTermoWord(cleanGuess)) {
        return {
          room: this.activeRoom,
          validation: {
            isValid: false,
            inDictionary: false,
            message: 'Essa palavra não existe no dicionário!'
          }
        };
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
      const existingWinner = Object.values(this.activeRoom.roundAnswers).find(a => a.isValid && a.playerId !== playerId);
      const isFirstWinner = isCorrect && !existingWinner;
      const isOutOfTries = updatedGuesses.length >= 5;
      const triesCount = updatedGuesses.length;

      // Escala de pontuação: 1ª tent = 100, 2ª = 80, 3ª = 60, 4ª = 40, 5ª = 20 pts
      const pointsScale: Record<number, number> = {
        1: 100,
        2: 80,
        3: 60,
        4: 40,
        5: 20
      };
      const wonPoints = isFirstWinner ? (pointsScale[triesCount] || 20) : 0;

      const answerRecord: PlayerAnswer = {
        playerId,
        playerName: player.name,
        rawAnswer,
        normalizedAnswer: cleanGuess,
        isValid: isFirstWinner,
        inDictionary: true,
        isCommunityApproved: isFirstWinner,
        votes: { yes: 0, no: 0, voterIds: {} },
        responseTimeMs,
        points: wonPoints,
        validationReason: isFirstWinner
          ? `Venceu a rodada! Acertou na ${triesCount}ª tentativa (+${wonPoints} pts)!`
          : (existingWinner && isCorrect
            ? 'Acertou, mas outro jogador venceu primeiro!'
            : (isOutOfTries ? 'Esgotou as 5 tentativas.' : `Tentativa ${triesCount}/5`)),
        termoGuesses: updatedGuesses,
        guessedTarget: isFirstWinner
      };

      this.activeRoom.roundAnswers[playerId] = answerRecord;
      if (isFirstWinner || isOutOfTries) {
        player.hasAnswered = true;
        player.currentAnswer = rawAnswer;
        player.roundScore = wonPoints;
      }

      this.notify('room:update', { room: this.activeRoom });
      this.submitAnswerToFirestore(this.activeRoom.roomId, playerId, answerRecord, {
        hasAnswered: player.hasAnswered,
        currentAnswer: player.currentAnswer,
        roundScore: player.roundScore
      });

      if (this.isHost) {
        if (isFirstWinner) {
          // Encerrar a rodada imediatamente quando o primeiro jogador acertar!
          this.clearTimers();
          this.isAdvancingRound = true;
          this.timerHandle = setTimeout(() => {
            this.handleRoundTimeUp();
            this.isAdvancingRound = false;
          }, 1200);
        } else {
          const allAnswered = this.activeRoom.players.every(p => p.hasAnswered);
          if (allAnswered && !this.isAdvancingRound) {
            this.isAdvancingRound = true;
            this.clearTimers();
            this.timerHandle = setTimeout(() => {
              this.handleRoundTimeUp();
              this.isAdvancingRound = false;
            }, 1000);
          }
        }
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

    // Modo JOGO DA FORCA (Multiplayer e Dupla)
    if (this.activeRoom.settings.gameMode === 'forca') {
      const challenge = round.forcaChallenge;
      const targetNormalized = challenge?.normalized || round.targetWord || '';
      const cleanInput = normalizeForcaString(rawAnswer);
      if (!cleanInput) return null;

      const existingRecord = this.activeRoom.roundAnswers[playerId];
      const previousGuesses: string[] = existingRecord?.forcaGuesses || [];
      let wrongCount = existingRecord?.forcaWrongCount || 0;
      let isWon = existingRecord?.forcaWon || false;

      if (isWon || wrongCount >= 6) {
        return {
          room: this.activeRoom,
          validation: {
            isValid: isWon,
            message: isWon ? 'Você já desvendou a palavra!' : 'Você já foi enforcado nesta rodada!'
          }
        };
      }

      let newGuesses = [...previousGuesses];
      let hit = false;
      let message = '';

      if (cleanInput.length === 1) {
        // Palpite de letra individual
        if (previousGuesses.includes(cleanInput)) {
          return {
            room: this.activeRoom,
            validation: {
              isValid: false,
              message: `A letra "${cleanInput}" já foi tentada!`
            }
          };
        }
        newGuesses.push(cleanInput);
        hit = targetNormalized.includes(cleanInput);
        if (!hit) {
          wrongCount = Math.min(6, wrongCount + 1);
          message = `A palavra não tem "${cleanInput}"! (${6 - wrongCount} vidas restantes)`;
        } else {
          message = `Boa! A palavra contém a letra "${cleanInput}"!`;
        }

        // Verificar se completou todas as letras
        const distinctLetters = Array.from(new Set(targetNormalized.split('')));
        const allRevealed = distinctLetters.every(l => newGuesses.includes(l));
        if (allRevealed) {
          isWon = true;
        }
      } else {
        // Tentativa de chutar a palavra completa
        if (cleanInput === targetNormalized) {
          isWon = true;
          hit = true;
          message = `🎉 Sensacional! Você acertou a palavra inteira: ${challenge?.word || targetNormalized}!`;
        } else {
          wrongCount = Math.min(6, wrongCount + 2); // Chute errado de palavra custa 2 vidas!
          message = `Ops! "${rawAnswer}" não é a palavra correta! Perdeu 2 vidas! (${6 - wrongCount} restantes)`;
        }
      }

      const isHanged = wrongCount >= 6;
      const isFinished = isWon || isHanged;

      // Verificar se já existe um primeiro vencedor nesta rodada
      const existingWinner = Object.values(this.activeRoom.roundAnswers).find(a => a.isValid && a.playerId !== playerId);
      const isFirstWinner = isWon && !existingWinner;

      // Pontuação da Forca: 100 base - (erros * 12). Vencedor ganha pontos cheios!
      const wonPoints = isFirstWinner
        ? Math.max(30, 100 - (wrongCount * 12))
        : (isWon ? Math.max(15, 60 - (wrongCount * 10)) : 0);

      const answerRecord: PlayerAnswer = {
        playerId,
        playerName: player.name,
        rawAnswer: isWon ? (challenge?.word || targetNormalized) : (existingRecord?.rawAnswer || cleanInput),
        normalizedAnswer: isWon ? targetNormalized : (existingRecord?.normalizedAnswer || cleanInput),
        isValid: isFirstWinner,
        inDictionary: true,
        isCommunityApproved: isFirstWinner,
        votes: { yes: 0, no: 0, voterIds: {} },
        responseTimeMs,
        points: wonPoints,
        validationReason: isFirstWinner
          ? `Salvou o boneco da Forca e venceu a rodada (+${wonPoints} pts)!`
          : (isWon ? 'Completou a palavra secreta!' : (isHanged ? 'O boneco foi enforcado!' : message)),
        forcaGuesses: newGuesses,
        forcaWrongCount: wrongCount,
        forcaWon: isWon,
        forcaRevealedCount: newGuesses.filter(l => targetNormalized.includes(l)).length,
        guessedTarget: isFirstWinner
      };

      this.activeRoom.roundAnswers[playerId] = answerRecord;

      if (isFinished) {
        player.hasAnswered = true;
        player.currentAnswer = isWon ? (challenge?.word || targetNormalized) : 'Enforcado';
        player.roundScore = wonPoints;
      }

      this.notify('forca:guess_result', {
        playerId,
        playerName: player.name,
        guess: cleanInput,
        hit,
        wrongCount,
        isWon,
        isHanged,
        hasWonRound: isFirstWinner
      });

      this.notify('room:update', { room: this.activeRoom });
      this.submitAnswerToFirestore(this.activeRoom.roomId, playerId, answerRecord, {
        hasAnswered: player.hasAnswered,
        currentAnswer: player.currentAnswer,
        roundScore: player.roundScore
      });

      if (this.isHost) {
        if (isFirstWinner) {
          this.clearTimers();
          this.isAdvancingRound = true;
          this.timerHandle = setTimeout(() => {
            this.handleRoundTimeUp();
            this.isAdvancingRound = false;
          }, 1400);
        } else {
          const allFinished = this.activeRoom.players.every(p => {
            const ans = this.activeRoom!.roundAnswers[p.id];
            return p.hasAnswered || (ans && (ans.forcaWon || (ans.forcaWrongCount || 0) >= 6));
          });
          if (allFinished && !this.isAdvancingRound) {
            this.isAdvancingRound = true;
            this.clearTimers();
            this.timerHandle = setTimeout(() => {
              this.handleRoundTimeUp();
              this.isAdvancingRound = false;
            }, 1000);
          }
        }
      }

      return {
        room: this.activeRoom,
        validation: {
          isValid: isWon,
          hit,
          wrongCount,
          isWon,
          isHanged,
          message
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
    this.notify('room:update', { room: this.activeRoom });
    this.submitAnswerToFirestore(this.activeRoom.roomId, playerId, answerRecord, {
      hasAnswered: player.hasAnswered,
      currentAnswer: player.currentAnswer,
      roundScore: player.roundScore
    });

    if (this.isHost) {
      const allAnswered = this.activeRoom.players.every(p => p.hasAnswered);
      if (allAnswered && !this.isAdvancingRound) {
        this.isAdvancingRound = true;
        this.clearTimers();
        this.timerHandle = setTimeout(() => {
          this.handleRoundTimeUp();
          this.isAdvancingRound = false;
        }, 1000);
      }
    }

    return { room: this.activeRoom, validation };
  }

  public handleRoundTimeUp() {
    if (!this.isHost) return;
    this.clearTimers();
    this.isAdvancingRound = false;
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

    // Initialize round answers voting structure
    for (const ans of Object.values(this.activeRoom.roundAnswers)) {
      ans.votes = { yes: 0, no: 0, voterIds: {} };
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

    // Atomic update in Firestore
    try {
      const roomRef = doc(db, 'rooms', this.activeRoom.roomId);
      updateDoc(roomRef, {
        [`roundAnswers.${targetPlayerId}.votes`]: ans.votes
      }).catch(() => {
        if (this.activeRoom) this.syncToFirestore(this.activeRoom);
      });
    } catch {
      if (this.activeRoom) this.syncToFirestore(this.activeRoom);
    }

    return this.activeRoom;
  }

  public concludeVoting() {
    if (!this.isHost) return;
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
    if (!this.isHost) return;
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
      if (this.activeRoom.settings.gameMode === 'termo_multiplayer' || this.activeRoom.settings.gameMode === 'forca') {
        pts = ans.isValid ? ans.points : 0;
      } else if (this.activeRoom.settings.gameMode === 'juice_photo') {
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

    for (const player of this.activeRoom.players) {
      if (!this.activeRoom.roundAnswers[player.id]) {
        player.roundScore = 0;
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
    if (!this.activeRoom || !this.isHost) return null;
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
    if (!this.activeRoom || !this.isHost) return null;
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
  }

  public async leaveRoom() {
    this.clearTimers();
    const currentRoom = this.activeRoom;
    const currentId = this.myPlayerId;

    if (this.firestoreUnsub) {
      this.firestoreUnsub();
      this.firestoreUnsub = null;
    }

    if (currentRoom && currentId) {
      if (currentRoom.hostId === currentId) {
        // O anfitrião saiu da sala: encerra a sala e notifica todos os outros jogadores
        const closedState: RoomState = {
          ...currentRoom,
          status: 'closed',
          hostLeft: true,
          closedReason: 'O anfitrião saiu da sala. A partida foi encerrada.'
        };
        await this.syncToFirestore(closedState);
        this.notify('room:host_left', { reason: 'O anfitrião saiu da sala. A partida foi encerrada.' });
      } else {
        // Jogador comum saindo: remove da lista da sala
        currentRoom.players = currentRoom.players.filter(p => p.id !== currentId);
        await this.syncToFirestore(currentRoom);
      }
    }

    this.activeRoom = null;
    this.isHost = false;
  }
}

export const clientGameEngine = new ClientGameEngine();
