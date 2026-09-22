/**
 * Gerenciador de Salas e Partidas Multi-jogador para STOP + TERMO + JUICE
 * Controla o estado com autoridade do servidor, votação comunitária de respostas,
 * modos STOP+TERMO, TERMO Coletivo e Foto Desafio (Juice).
 */

import { WebSocket } from 'ws';
import { CATEGORIES } from '../data/words.ts';
import { getRandomJuicePhoto, validateJuiceGuess, validateJuiceGuessDetailed } from '../data/juicePhotos.ts';
import { getAlternatingTermoLength, getRandomTermoTarget, isValidTermoWord } from '../data/termoDictionary.ts';
import {
  GameMode,
  JuiceGuessResult,
  Player,
  PlayerAnswer,
  RoomSettings,
  RoomState,
  RoundConfig,
  TermoGuessResult,
  WordEntry
} from '../types.ts';
import { wordEngine } from './wordEngine.ts';

export class Room {
  public id: string;
  public state: RoomState;
  public clients: Map<string, WebSocket> = new Map(); // playerId -> WebSocket
  public timerHandle: NodeJS.Timeout | null = null;
  public usedCombinations: Set<string> = new Set();
  public usedPhotoIds: Set<string> = new Set();
  public possibleCurrentWords: WordEntry[] = [];

  constructor(id: string, hostPlayer: Player, settings?: Partial<RoomSettings>) {
    this.id = id;

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

    this.state = {
      roomId: id,
      status: 'lobby',
      hostId: hostPlayer.id,
      settings: { ...defaultSettings, ...settings },
      players: [hostPlayer],
      currentRoundIndex: 0,
      currentRound: null,
      roundAnswers: {},
      history: []
    };
  }

  public addClient(playerId: string, ws: WebSocket) {
    this.clients.set(playerId, ws);
  }

  public removeClient(playerId: string) {
    this.clients.delete(playerId);
  }

  public broadcast(event: string, payload: any) {
    const message = JSON.stringify({ event, ...payload });
    for (const client of this.clients.values()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  public broadcastState() {
    this.broadcast('room:update', { room: this.state });
  }

  public kickPlayer(targetPlayerId: string) {
    if (this.state.hostId === targetPlayerId) return;
    this.state.players = this.state.players.filter(p => p.id !== targetPlayerId);
    if (!this.state.kickedPlayerIds) {
      this.state.kickedPlayerIds = [];
    }
    if (!this.state.kickedPlayerIds.includes(targetPlayerId)) {
      this.state.kickedPlayerIds.push(targetPlayerId);
    }
    const client = this.clients.get(targetPlayerId);
    if (client) {
      try {
        client.send(JSON.stringify({ event: 'player:kicked', playerId: targetPlayerId }));
        client.close();
      } catch {}
      this.clients.delete(targetPlayerId);
    }
    this.broadcastState();
  }

  public removePlayer(playerId: string) {
    if (this.state.hostId === playerId) {
      // O anfitrião saiu da sala: encerra a sala e chuta os outros jogadores para o menu principal
      this.state.status = 'closed';
      this.broadcast('room:host_left', { reason: 'O anfitrião saiu da sala. A partida foi encerrada.' });
      this.broadcast('room:closed', { reason: 'O anfitrião saiu da sala. A partida foi encerrada.' });
      this.clearAllTimers();
      for (const client of this.clients.values()) {
        try {
          client.close();
        } catch {}
      }
      this.clients.clear();
      gameManager.removeRoom(this.state.roomId);
      return;
    }

    this.state.players = this.state.players.filter(p => p.id !== playerId);
    this.clients.delete(playerId);
    this.broadcastState();
  }

  public updateSettings(newSettings: Partial<RoomSettings>) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.broadcastState();
  }

  public startGame() {
    if (this.state.status !== 'lobby' && this.state.status !== 'game_over') return;
    this.state.currentRoundIndex = 0;
    this.state.history = [];
    for (const p of this.state.players) {
      p.score = 0;
      p.roundScore = 0;
      p.hasAnswered = false;
    }
    this.startRound(1);
  }

  public startRound(roundNumber: number) {
    this.clearAllTimers();
    this.state.currentRoundIndex = roundNumber;
    const { minLength, maxLength, selectedCategories, timeLimit, gameMode } = this.state.settings;

    let round: RoundConfig;

    if (gameMode === 'juice_photo') {
      // Modo Juice / Foto Desafio com suporte a temas temáticos (Especial Brasil, Lugares, Músicas, etc.)
      const challenge = getRandomJuicePhoto(
        Array.from(this.usedPhotoIds),
        this.state.settings.juiceTheme || 'brasil_geral'
      );
      this.usedPhotoIds.add(challenge.id);

      const now = Date.now();
      round = {
        roundNumber,
        totalRounds: this.state.settings.totalRounds,
        letter: challenge.initialLetter,
        categoryId: 'juice_photo',
        categoryName: challenge.category,
        wordLength: challenge.letterCount,
        timeLimit: Math.min(35, Math.max(20, timeLimit)),
        startedAt: now,
        endsAt: now + (timeLimit * 1000),
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
        totalRounds: this.state.settings.totalRounds,
        letter: '?', // Sem dica de letra inicial
        categoryId: 'termo',
        categoryName: 'Palavra Secreta', // Sem tema que entregue a resposta
        wordLength: targetLength,
        timeLimit: 0, // Sem limite de tempo!
        startedAt: now,
        endsAt: 0,
        targetWord: chosenWordNorm
      };
    } else {
      // Modo STOP + TERMO Clássico com garantia de palavras válidas
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
        totalRounds: this.state.settings.totalRounds,
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

    this.state.currentRound = round;
    this.state.status = 'round_active';
    this.state.roundAnswers = {};
    this.state.possibleAnswersCount = this.possibleCurrentWords.length;
    this.state.sampleValidAnswers = undefined;

    for (const p of this.state.players) {
      p.hasAnswered = false;
      p.roundScore = 0;
      p.currentAnswer = undefined;
    }

    this.broadcast('round:start', {
      round,
      possibleCount: this.possibleCurrentWords.length
    });
    this.broadcastState();

    // Schedule authoritative round end (exceto no modo termo_multiplayer, que não tem limite de tempo)
    if (this.state.settings.gameMode !== 'termo_multiplayer') {
      const durationMs = (round.timeLimit * 1000) + 500;
      this.timerHandle = setTimeout(() => {
        this.handleRoundTimeUp();
      }, durationMs);
    }
  }

  public submitAnswer(playerId: string, rawAnswer: string) {
    if (this.state.status !== 'round_active' || !this.state.currentRound) {
      return { success: false, reason: 'Rodada não está ativa.' };
    }

    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return { success: false, reason: 'Jogador não encontrado.' };

    const round = this.state.currentRound;
    const now = Date.now();
    const responseTimeMs = Math.max(500, now - round.startedAt);

    if (round.photoChallenge) {
      // Modo Juice: Validação detalhada com detecção de resposta "meio certa" e pontuação reduzida
      const validation = validateJuiceGuessDetailed(rawAnswer, round.photoChallenge);
      const isCorrect = validation.isCorrect;
      const isPartial = Boolean(validation.isPartial);

      const existingRecord = this.state.roundAnswers[playerId];
      const previousGuesses: JuiceGuessResult[] = existingRecord?.juiceGuesses || [];

      const baseSpeedPoints = Math.max(50, Math.round(150 - (responseTimeMs / 1000) * 3));
      const pointsMultiplier = validation.pointsMultiplier || (isPartial ? 0.5 : 1.0);
      const currentEarnedPoints = Math.max(25, Math.round(baseSpeedPoints * pointsMultiplier));

      const wasAlreadyFull = Boolean(existingRecord?.isValid && !existingRecord?.isPartial);
      let finalPoints = existingRecord?.points || 0;
      let finalIsPartial = existingRecord?.isPartial ?? isPartial;

      if (isCorrect) {
        if (!wasAlreadyFull) {
          if (!isPartial) {
            finalPoints = Math.max(finalPoints, currentEarnedPoints);
            finalIsPartial = false;
          } else {
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

      this.state.roundAnswers[playerId] = answerRecord;

      if (isCorrect) {
        player.hasAnswered = true;
        player.currentAnswer = answerRecord.rawAnswer;
        player.roundScore = finalPoints;
      }

      this.broadcast('juice:guess_result', {
        playerId,
        playerName: player.name,
        guessResult: guessObj,
        hasAnswered: player.hasAnswered,
        isCorrect,
        isPartial: finalIsPartial,
        points: finalPoints,
        isClose: validation.isClose
      });

      const allAnswered = this.state.players.every(p => p.hasAnswered);
      if (allAnswered) {
        this.clearAllTimers();
        setTimeout(() => this.handleRoundTimeUp(), 1000);
      } else {
        this.broadcastState();
      }

      return {
        success: true,
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

    if (this.state.settings.gameMode === 'termo_multiplayer') {
      // Modo Termo Multiplayer: Avalia a tentativa
      const target = round.targetWord || '';
      const cleanGuess = rawAnswer.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (cleanGuess.length !== round.wordLength) {
        return { success: false, reason: `Palavra deve ter ${round.wordLength} letras.` };
      }

      if (!isValidTermoWord(cleanGuess)) {
        return { success: false, reason: 'Essa palavra não existe no dicionário oficial.' };
      }

      const evaluated = wordEngine.evaluateTermoGuess(cleanGuess, target);
      const isCorrect = evaluated.isCorrect;

      const existingRecord = this.state.roundAnswers[playerId];
      const previousGuesses = existingRecord?.termoGuesses || [];

      const guessObj: TermoGuessResult = {
        guess: rawAnswer,
        normalized: cleanGuess,
        letterStatuses: evaluated.letterStatuses,
        isCorrect,
        timeMs: responseTimeMs
      };

      const updatedGuesses = [...previousGuesses, guessObj];
      const existingWinner = Object.values(this.state.roundAnswers).find(a => a.isValid && a.playerId !== playerId);
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

      this.state.roundAnswers[playerId] = answerRecord;

      if (isFirstWinner || isOutOfTries) {
        player.hasAnswered = true;
      }

      this.broadcast('termo:guess_result', {
        playerId,
        guessResult: guessObj,
        triesCount: updatedGuesses.length,
        hasWon: isFirstWinner
      });

      if (isFirstWinner) {
        // Encerra a rodada imediatamente pois já temos o vencedor único da rodada
        this.clearAllTimers();
        setTimeout(() => this.handleRoundTimeUp(), 1200);
      } else {
        const allFinished = this.state.players.every(p => p.hasAnswered);
        if (allFinished) {
          this.clearAllTimers();
          setTimeout(() => this.handleRoundTimeUp(), 1000);
        } else {
          this.broadcastState();
        }
      }

      return { success: true, termoResult: guessObj };
    }

    // Modo STOP + TERMO padrão:
    // Verifica no dicionário como indicador prévio
    const validation = wordEngine.validateAnswer(rawAnswer, round);

    const answerRecord: PlayerAnswer = {
      playerId,
      playerName: player.name,
      rawAnswer,
      normalizedAnswer: validation.normalized,
      isValid: validation.isValid,
      inDictionary: validation.isValid,
      isCommunityApproved: false, // Será definido na votação!
      votes: { yes: 0, no: 0, voterIds: {} },
      validationReason: validation.reason,
      responseTimeMs,
      points: 0
    };

    this.state.roundAnswers[playerId] = answerRecord;
    player.hasAnswered = true;
    player.currentAnswer = rawAnswer;

    this.broadcast('round:player_answered', {
      playerId,
      playerName: player.name,
      hasAnswered: true
    });

    const allAnswered = this.state.players.every(p => p.hasAnswered);
    if (allAnswered) {
      this.clearAllTimers();
      setTimeout(() => this.handleRoundTimeUp(), 1000);
    } else {
      this.broadcastState();
    }

    return { success: true, validation };
  }

  public handleRoundTimeUp() {
    this.clearAllTimers();

    // Se o modo for STOP + TERMO e houver respostas para votar, iniciamos a VOTAÇÃO DA GALERA!
    if (this.state.settings.gameMode === 'stop_termo') {
      const answers = Object.values(this.state.roundAnswers).filter(a => a.rawAnswer.trim().length > 0);
      if (answers.length > 0) {
        this.startVotingPhase();
        return;
      }
    }

    // Modos direto para resultados (Juice ou Termo)
    this.endRound();
  }

  public startVotingPhase() {
    this.state.status = 'round_voting';
    const votingSecs = this.state.settings.votingTimeSeconds || 20;
    this.state.votingEndsAt = Date.now() + (votingSecs * 1000);

    // Initialize votes for all round answers
    for (const ans of Object.values(this.state.roundAnswers)) {
      ans.votes = { yes: 0, no: 0, voterIds: {} };
    }

    this.broadcast('round:voting_start', {
      answers: this.state.roundAnswers,
      votingEndsAt: this.state.votingEndsAt
    });
    this.broadcastState();

    // End voting automatically after time
    this.timerHandle = setTimeout(() => {
      this.concludeVoting();
    }, (votingSecs * 1000) + 500);
  }

  public castVote(voterId: string, targetPlayerId: string, approve: boolean) {
    if (this.state.status !== 'round_voting') return { success: false, reason: 'Não está na fase de votação.' };
    const ans = this.state.roundAnswers[targetPlayerId];
    if (!ans) return { success: false, reason: 'Resposta não encontrada.' };

    if (!ans.votes) {
      ans.votes = { yes: 0, no: 0, voterIds: {} };
    }

    const previousVote = ans.votes.voterIds[voterId];
    if (previousVote !== undefined) {
      if (previousVote) ans.votes.yes--;
      else ans.votes.no--;
    }

    ans.votes.voterIds[voterId] = approve;
    if (approve) ans.votes.yes++;
    else ans.votes.no++;

    this.broadcast('round:vote_cast', {
      voterId,
      targetPlayerId,
      approve,
      votes: ans.votes
    });
    this.broadcastState();
    return { success: true, votes: ans.votes };
  }

  public concludeVoting() {
    this.clearAllTimers();
    if (this.state.status !== 'round_voting') return;

    // Conclui avaliação com base na votação da galera
    const answers = Object.values(this.state.roundAnswers);
    for (const ans of answers) {
      const votes = ans.votes || { yes: 0, no: 0, voterIds: {} };
      // Aprovado se votos Sim >= votos Não (ou se for unânime/sem votos negativos)
      const approved = votes.yes >= votes.no;
      ans.isCommunityApproved = approved;
      ans.isValid = approved;
      if (!approved) {
        ans.validationReason = 'Rejeitado na votação da galera.';
      } else if (!ans.inDictionary) {
        ans.validationReason = 'Aprovado pelos jogadores (zoeira/contexto)!';
      }
    }

    this.endRound();
  }

  public endRound() {
    this.clearAllTimers();
    this.state.status = 'round_results';

    const answers = Object.values(this.state.roundAnswers);
    const validAnswers = answers.filter(a => a.isValid);

    // Contagem de respostas aprovadas para bônus de raridade
    const wordCounts: Record<string, number> = {};
    for (const ans of validAnswers) {
      const norm = ans.normalizedAnswer;
      wordCounts[norm] = (wordCounts[norm] || 0) + 1;
    }

    for (const ans of answers) {
      const player = this.state.players.find(p => p.id === ans.playerId);
      if (!player) continue;

      if (!ans.isValid) {
        ans.points = 0;
        player.roundScore = 0;
        continue;
      }

      if (this.state.settings.gameMode === 'termo_multiplayer' || this.state.settings.gameMode === 'juice_photo') {
        // Já calculado no submitAnswer
        player.roundScore = ans.points;
        player.score += ans.points;
        continue;
      }

      const isUnique = wordCounts[ans.normalizedAnswer] === 1;
      ans.isUnique = isUnique;

      if (this.state.settings.scoringStyle === 'classic_stop') {
        const pts = isUnique ? 10 : 5;
        ans.points = pts;
        ans.breakdown = {
          base: pts,
          speedBonus: 0,
          rarityBonus: 0,
          difficultyMultiplier: 1.0
        };
      } else {
        const base = 100;
        const timeLimit = this.state.currentRound?.timeLimit || 30;
        const timeRatio = Math.max(0, 1 - (ans.responseTimeMs / (timeLimit * 1000)));
        const speedBonus = Math.round(timeRatio * 50);
        const rarityBonus = isUnique && this.state.players.length > 1 ? 50 : 0;
        const total = base + speedBonus + rarityBonus;

        ans.points = total;
        ans.breakdown = {
          base,
          speedBonus,
          rarityBonus,
          difficultyMultiplier: 1.0
        };
      }

      player.roundScore = ans.points;
      player.score += ans.points;
    }

    if (this.state.currentRound) {
      if (this.possibleCurrentWords.length > 0) {
        this.state.sampleValidAnswers = this.possibleCurrentWords.slice(0, 10).map(w => w.word);
      }

      this.state.history.push({
        roundNumber: this.state.currentRound.roundNumber,
        letter: this.state.currentRound.letter,
        categoryName: this.state.currentRound.categoryName,
        wordLength: this.state.currentRound.wordLength,
        answers: { ...this.state.roundAnswers }
      });
    }

    this.broadcast('round:end', {
      roundNumber: this.state.currentRound?.roundNumber,
      answers: this.state.roundAnswers,
      sampleAnswers: this.state.sampleValidAnswers
    });

    this.broadcastState();
  }

  public nextStep() {
    if (this.state.status !== 'round_results') return;

    if (this.state.currentRoundIndex >= this.state.settings.totalRounds) {
      this.state.status = 'game_over';
      this.state.players.sort((a, b) => b.score - a.score);
      this.broadcast('game:end', {
        players: this.state.players,
        history: this.state.history
      });
      this.broadcastState();
    } else {
      this.startRound(this.state.currentRoundIndex + 1);
    }
  }

  public resetToLobby() {
    this.clearAllTimers();
    this.state.status = 'lobby';
    this.state.currentRound = null;
    this.state.currentRoundIndex = 0;
    this.state.roundAnswers = {};
    for (const p of this.state.players) {
      p.score = 0;
      p.roundScore = 0;
      p.hasAnswered = false;
    }
    this.broadcastState();
  }

  public clearAllTimers() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
  }
}

class GameManager {
  private rooms: Map<string, Room> = new Map();

  public createRoom(hostPlayer: Player, settings?: Partial<RoomSettings>): Room {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    while (this.rooms.has(code)) {
      code = '';
      for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    const room = new Room(code, hostPlayer, settings);
    this.rooms.set(code, room);
    return room;
  }

  public createRoomWithId(code: string, hostPlayer: Player, settings?: Partial<RoomSettings>): Room {
    const cleanCode = code.toUpperCase().trim();
    const existing = this.rooms.get(cleanCode);
    if (existing) {
      return existing;
    }
    const room = new Room(cleanCode, hostPlayer, settings);
    this.rooms.set(cleanCode, room);
    return room;
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId.toUpperCase().trim());
  }

  public removeRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.clearAllTimers();
      this.rooms.delete(roomId);
    }
  }
}

export const gameManager = new GameManager();
