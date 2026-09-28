/**
 * Motor de Regras Oficiais do Jogo UNO
 * Implementa 108 cartas, ações de Skip, Reverse, +2, Coringa, Coringa +4,
 * Grito de UNO, Denúncia de UNO, pontuação oficial e suporte a Bots.
 */

import { Player, UnoCard, UnoColor, UnoGameState, UnoLastAction } from '../types.ts';
import {
  createStandardUnoDeck,
  shuffleUnoDeck,
  isValidUnoMove,
  calculateUnoHandScore,
  getNextUnoPlayerIndex,
  chooseBotUnoMove,
  UNO_COLOR_NAMES
} from './unoDeck.ts';

/**
 * Garante que o baralho de compras tenha cartas suficientes, reembaralhando o descarte se necessário
 */
export function ensureDrawDeck(state: UnoGameState): void {
  if (state.drawDeck.length >= 6) return;

  // Guarda a carta do topo do descarte
  const top = state.topCard;
  const pileToShuffle = state.discardPile.slice(0, -1);

  if (pileToShuffle.length > 0) {
    const reshuffled = shuffleUnoDeck(pileToShuffle);
    state.drawDeck = [...state.drawDeck, ...reshuffled];
    state.discardPile = [top];
  }

  // Se mesmo após reembaralhar ainda estiver com poucas cartas, adiciona novo baralho embaralhado
  if (state.drawDeck.length < 4) {
    const freshDeck = shuffleUnoDeck(createStandardUnoDeck());
    state.drawDeck = [...state.drawDeck, ...freshDeck];
  }
}

/**
 * Inicializa uma nova partida/rodada de UNO
 */
export function initUnoGame(players: Player[]): UnoGameState {
  const fullDeck = shuffleUnoDeck(createStandardUnoDeck());
  const hands: Record<string, UnoCard[]> = {};

  // Distribui 7 cartas para cada jogador
  let deckIndex = 0;
  for (const player of players) {
    hands[player.id] = fullDeck.slice(deckIndex, deckIndex + 7);
    deckIndex += 7;
  }

  // Encontra a primeira carta válida do topo da pilha de descarte (não pode ser Coringa +4)
  let firstCardIndex = deckIndex;
  while (firstCardIndex < fullDeck.length && fullDeck[firstCardIndex].value === 'wild_draw4') {
    firstCardIndex++;
  }

  // Se chegou ao fim (muito raro), pega a primeira não-wild
  if (firstCardIndex >= fullDeck.length) {
    firstCardIndex = deckIndex;
  }

  const topCard = fullDeck[firstCardIndex];
  const remainingDeck = fullDeck.filter((_, idx) => idx >= deckIndex && idx !== firstCardIndex);

  // Define a cor inicial (se a primeira carta for Coringa simples, escolhe Vermelho por padrão)
  const initialColor: UnoColor = topCard.color === 'wild' ? 'red' : topCard.color;

  const currentTurnPlayerId = players[0]?.id || '';

  const state: UnoGameState = {
    hands,
    drawDeck: remainingDeck,
    discardPile: [topCard],
    topCard,
    currentColor: initialColor,
    currentTurnPlayerId,
    direction: 1,
    unoCalled: {},
    hasDrawnThisTurn: false,
    lastAction: {
      playerId: 'system',
      playerName: 'Mesa',
      action: 'play',
      card: topCard,
      message: `Partida iniciada! Carta inicial: ${topCard.color === 'wild' ? 'Coringa' : UNO_COLOR_NAMES[topCard.color]} ${topCard.value.toUpperCase()}`
    }
  };

  // Se a primeira carta do descarte tiver ação especial
  if (topCard.value === 'skip') {
    // Pula o primeiro jogador
    const nextIdx = getNextUnoPlayerIndex(0, players.length, 1, 1);
    state.currentTurnPlayerId = players[nextIdx]?.id || '';
    state.lastAction!.message += ' (Primeiro jogador pulado!)';
  } else if (topCard.value === 'reverse') {
    if (players.length === 2) {
      // Em 2 jogadores, Inverter age como Bloqueio
      const nextIdx = getNextUnoPlayerIndex(0, players.length, 1, 1);
      state.currentTurnPlayerId = players[nextIdx]?.id || '';
    } else {
      state.direction = -1;
      const nextIdx = getNextUnoPlayerIndex(0, players.length, -1, 1);
      state.currentTurnPlayerId = players[nextIdx]?.id || '';
    }
    state.lastAction!.message += ' (Sentido invertido!)';
  } else if (topCard.value === 'draw2') {
    // O primeiro jogador compra 2 cartas e perde a vez
    const targetPlayer = players[0];
    if (targetPlayer) {
      ensureDrawDeck(state);
      const drawn = state.drawDeck.splice(0, 2);
      state.hands[targetPlayer.id].push(...drawn);
      const nextIdx = getNextUnoPlayerIndex(0, players.length, 1, 1);
      state.currentTurnPlayerId = players[nextIdx]?.id || '';
      state.lastAction!.message += ` (${targetPlayer.name} comprou +2 e perdeu a vez!)`;
    }
  }

  return state;
}

/**
 * Executa a jogada de uma carta
 */
export function playUnoCardAction(
  state: UnoGameState,
  players: Player[],
  playerId: string,
  cardId: string,
  chosenColor?: UnoColor
): { success: boolean; message?: string; isGameOver?: boolean } {
  if (state.winnerId) {
    return { success: false, message: 'A rodada já terminou!' };
  }

  if (state.currentTurnPlayerId !== playerId) {
    return { success: false, message: 'Não é a sua vez de jogar!' };
  }

  const player = players.find(p => p.id === playerId);
  state.hands[playerId] = state.hands[playerId] || [];
  const playerHand = state.hands[playerId];
  if (!player || !playerHand) {
    return { success: false, message: 'Jogador não encontrado na mesa.' };
  }

  const cardIndex = playerHand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    return { success: false, message: 'Você não possui essa carta na mão.' };
  }

  const card = playerHand[cardIndex];

  // Validação da regra do UNO
  if (!isValidUnoMove(card, state.topCard, state.currentColor)) {
    return { success: false, message: 'Essa carta não pode ser jogada agora!' };
  }

  const isWild = card.color === 'wild' || card.value === 'wild' || card.value === 'wild_draw4';

  // Se for Coringa, precisa de uma cor definida
  let activeColor = card.color;
  if (isWild) {
    if (!chosenColor || chosenColor === 'wild') {
      activeColor = 'red'; // Fallback
    } else {
      activeColor = chosenColor;
    }
  }

  // Remove da mão e joga na pilha de descarte
  playerHand.splice(cardIndex, 1);
  state.discardPile.push(card);
  state.topCard = card;
  state.currentColor = activeColor;
  state.hasDrawnThisTurn = false;
  state.drawnCardId = undefined;

  // Ação de gritar UNO se restou 1 carta
  if (playerHand.length === 1) {
    // Se o jogador já chamou UNO ou é bot, marca como chamado
    if (player.isBot) {
      state.unoCalled[playerId] = true;
    }
  } else {
    state.unoCalled[playerId] = false;
  }

  // Mensagem do log da jogada
  let actionMessage = `${player.name} jogou ${card.color === 'wild' ? 'Coringa' : UNO_COLOR_NAMES[card.color]} ${card.value.toUpperCase()}`;
  if (isWild) {
    actionMessage += ` (Cor: ${UNO_COLOR_NAMES[activeColor]})`;
  }

  // VERIFICA VITÓRIA: jogador bateu todas as cartas
  if (playerHand.length === 0) {
    state.winnerId = playerId;

    // Calcula os pontos somando as cartas restantes nas mãos dos adversários
    let totalScore = 0;
    const roundScores: Record<string, number> = {};

    for (const p of players) {
      const remainingHand = state.hands[p.id] || [];
      const handScore = calculateUnoHandScore(remainingHand);
      roundScores[p.id] = p.id === playerId ? 0 : handScore;
      if (p.id !== playerId) {
        totalScore += handScore;
      }
    }

    roundScores[playerId] = totalScore;
    state.roundScores = roundScores;

    state.lastAction = {
      playerId,
      playerName: player.name,
      action: 'play',
      card,
      chosenColor: activeColor,
      message: `🎉 ${player.name} BATEU e venceu a rodada com ${totalScore} pontos!`
    };

    return { success: true, isGameOver: true };
  }

  // =====================================================================
  // AÇÕES ESPECIAIS DAS CARTAS
  // =====================================================================
  const currentIdx = players.findIndex(p => p.id === playerId);
  let step = 1;

  if (card.value === 'skip') {
    // Pula o próximo jogador
    step = 2;
    const skippedIdx = getNextUnoPlayerIndex(currentIdx, players.length, state.direction, 1);
    const skippedPlayer = players[skippedIdx];
    actionMessage += ` (${skippedPlayer ? skippedPlayer.name : 'Próximo'} foi bloqueado!)`;
  } else if (card.value === 'reverse') {
    if (players.length === 2) {
      // Em 2 jogadores, Reverse age como Skip
      step = 2;
      const skippedIdx = getNextUnoPlayerIndex(currentIdx, players.length, state.direction, 1);
      const skippedPlayer = players[skippedIdx];
      actionMessage += ` (${skippedPlayer ? skippedPlayer.name : 'Adversário'} perdeu a vez!)`;
    } else {
      state.direction = (state.direction * -1) as 1 | -1;
      actionMessage += state.direction === 1 ? ' (Sentido Horário ↻)' : ' (Sentido Anti-horário ↺)';
      step = 1;
    }
  } else if (card.value === 'draw2') {
    // Próximo jogador compra 2 cartas e perde a vez
    const targetIdx = getNextUnoPlayerIndex(currentIdx, players.length, state.direction, 1);
    const targetPlayer = players[targetIdx];
    if (targetPlayer) {
      ensureDrawDeck(state);
      const drawnCards = state.drawDeck.splice(0, 2);
      state.hands[targetPlayer.id].push(...drawnCards);
      actionMessage += ` (${targetPlayer.name} comprou +2 e perdeu a vez!)`;
    }
    step = 2; // Pula o turno de quem comprou
  } else if (card.value === 'wild_draw4') {
    // Próximo jogador compra 4 cartas e perde a vez
    const targetIdx = getNextUnoPlayerIndex(currentIdx, players.length, state.direction, 1);
    const targetPlayer = players[targetIdx];
    if (targetPlayer) {
      ensureDrawDeck(state);
      const drawnCards = state.drawDeck.splice(0, 4);
      state.hands[targetPlayer.id].push(...drawnCards);
      actionMessage += ` (${targetPlayer.name} comprou +4 e perdeu a vez!)`;
    }
    step = 2; // Pula o turno de quem comprou
  }

  // Avança o turno
  const nextPlayerIdx = getNextUnoPlayerIndex(currentIdx, players.length, state.direction, step);
  state.currentTurnPlayerId = players[nextPlayerIdx]?.id || '';

  state.lastAction = {
    playerId,
    playerName: player.name,
    action: 'play',
    card,
    chosenColor: activeColor,
    message: actionMessage
  };

  return { success: true, isGameOver: false };
}

/**
 * Compra uma carta do baralho
 */
export function drawUnoCardAction(
  state: UnoGameState,
  players: Player[],
  playerId: string
): { success: boolean; drawnCard?: UnoCard; canPlay?: boolean; message?: string } {
  if (state.winnerId) return { success: false, message: 'A rodada já terminou!' };
  if (state.currentTurnPlayerId !== playerId) return { success: false, message: 'Não é sua vez!' };
  if (state.hasDrawnThisTurn) return { success: false, message: 'Você já comprou nesta rodada! Jogue ou passe a vez.' };

  const player = players.find(p => p.id === playerId);
  if (!player) return { success: false };

  ensureDrawDeck(state);
  if (state.drawDeck.length === 0) {
    return { success: false, message: 'Baralho de compras esgotado.' };
  }

  // Garante que a mão exista
  state.hands[playerId] = state.hands[playerId] || [];

  const drawnCard = state.drawDeck.shift()!;
  state.hands[playerId].push(drawnCard);
  state.hasDrawnThisTurn = true;
  state.drawnCardId = drawnCard.id;

  const canPlay = isValidUnoMove(drawnCard, state.topCard, state.currentColor);

  state.lastAction = {
    playerId,
    playerName: player.name,
    action: 'draw',
    message: `${player.name} comprou uma carta do baralho.`
  };

  return { success: true, drawnCard, canPlay };
}

/**
 * Passa a vez após comprar carta (ou passe forçado de bot/emergência)
 */
export function passUnoTurnAction(
  state: UnoGameState,
  players: Player[],
  playerId: string,
  force = false
): { success: boolean; message?: string } {
  if (state.winnerId) return { success: false, message: 'A rodada já terminou!' };
  if (state.currentTurnPlayerId !== playerId) return { success: false, message: 'Não é sua vez!' };

  const player = players.find(p => p.id === playerId);
  const isBot = Boolean(player?.isBot || playerId.startsWith('bot_'));

  // Jogadores humanos precisam comprar antes de passar; Bots e passes forçados podem passar direto se necessário
  if (!state.hasDrawnThisTurn && !isBot && !force) {
    return { success: false, message: 'Você deve comprar uma carta antes de passar a vez!' };
  }

  const currentIdx = players.findIndex(p => p.id === playerId);
  const nextIdx = getNextUnoPlayerIndex(currentIdx >= 0 ? currentIdx : 0, players.length, state.direction || 1, 1);

  state.hasDrawnThisTurn = false;
  state.drawnCardId = undefined;
  state.currentTurnPlayerId = players[nextIdx]?.id || '';

  state.lastAction = {
    playerId,
    playerName: player ? player.name : 'Jogador',
    action: 'pass',
    message: `${player ? player.name : 'Jogador'} passou a vez.`
  };

  return { success: true };
}

/**
 * Grita UNO!
 */
export function callUnoAction(
  state: UnoGameState,
  players: Player[],
  playerId: string
): { success: boolean; message?: string } {
  const player = players.find(p => p.id === playerId);
  const hand = state.hands[playerId];
  if (!player || !hand) return { success: false };

  // Jogador pode gritar UNO se tiver 1 ou 2 cartas
  if (hand.length > 2) {
    return { success: false, message: 'Você ainda tem mais de 2 cartas!' };
  }

  state.unoCalled[playerId] = true;
  state.lastAction = {
    playerId,
    playerName: player.name,
    action: 'uno',
    message: `📣 ${player.name} gritou: UNO!`
  };

  return { success: true, message: 'Você gritou UNO!' };
}

/**
 * Denuncia jogador que esqueceu de gritar UNO quando ficou com 1 carta
 * Penalidade: comprar 2 cartas
 */
export function catchUnoAction(
  state: UnoGameState,
  players: Player[],
  reporterId: string,
  targetId: string
): { success: boolean; message?: string } {
  if (reporterId === targetId) return { success: false };

  const reporter = players.find(p => p.id === reporterId);
  const target = players.find(p => p.id === targetId);
  const targetHand = state.hands[targetId];

  if (!reporter || !target || !targetHand) return { success: false };

  if (targetHand.length === 1 && !state.unoCalled[targetId]) {
    ensureDrawDeck(state);
    const penalty = state.drawDeck.splice(0, 2);
    targetHand.push(...penalty);
    state.unoCalled[targetId] = true; // Evita dupla penalidade

    state.lastAction = {
      playerId: reporterId,
      playerName: reporter.name,
      action: 'catch_uno',
      message: `🚨 ${reporter.name} pegou ${target.name} sem gritar UNO! (+2 cartas de penalidade)`
    };

    return {
      success: true,
      message: `Você denunciou ${target.name}! Ele comprou 2 cartas de penalidade.`
    };
  }

  return { success: false, message: 'Não é possível denunciar este jogador agora.' };
}
