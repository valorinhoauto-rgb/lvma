/**
 * Baralho Oficial de UNO (108 Cartas) e Lógica de Regras
 * 4 Cores: Vermelho, Azul, Verde, Amarelo + Cartas Especiais Pretas
 */

import { UnoCard, UnoColor, UnoValue } from '../types.ts';

export const UNO_COLORS: UnoColor[] = ['red', 'blue', 'green', 'yellow'];

export const UNO_COLOR_NAMES: Record<UnoColor, string> = {
  red: 'Vermelho',
  blue: 'Azul',
  green: 'Verde',
  yellow: 'Amarelo',
  wild: 'Coringa'
};

export const UNO_COLOR_HEX: Record<UnoColor, string> = {
  red: '#E52521',
  blue: '#0096E6',
  green: '#2BA84A',
  yellow: '#FFD100',
  wild: '#1E1E24'
};

/**
 * Cria o baralho oficial de 108 cartas do UNO
 */
export function createStandardUnoDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  let cardCounter = 0;

  for (const color of UNO_COLORS) {
    // 1x carta 0
    deck.push({
      id: `${color}_0_${++cardCounter}`,
      color,
      value: '0',
      score: 0
    });

    // 2x cartas 1 a 9
    for (let num = 1; num <= 9; num++) {
      const valStr = String(num) as UnoValue;
      deck.push({
        id: `${color}_${num}_a_${++cardCounter}`,
        color,
        value: valStr,
        score: num
      });
      deck.push({
        id: `${color}_${num}_b_${++cardCounter}`,
        color,
        value: valStr,
        score: num
      });
    }

    // 2x Bloqueio (Skip)
    deck.push({
      id: `${color}_skip_a_${++cardCounter}`,
      color,
      value: 'skip',
      score: 20
    });
    deck.push({
      id: `${color}_skip_b_${++cardCounter}`,
      color,
      value: 'skip',
      score: 20
    });

    // 2x Inverter (Reverse)
    deck.push({
      id: `${color}_reverse_a_${++cardCounter}`,
      color,
      value: 'reverse',
      score: 20
    });
    deck.push({
      id: `${color}_reverse_b_${++cardCounter}`,
      color,
      value: 'reverse',
      score: 20
    });

    // 2x Compre 2 (+2)
    deck.push({
      id: `${color}_draw2_a_${++cardCounter}`,
      color,
      value: 'draw2',
      score: 20
    });
    deck.push({
      id: `${color}_draw2_b_${++cardCounter}`,
      color,
      value: 'draw2',
      score: 20
    });
  }

  // 4x Coringa (Wild)
  for (let i = 1; i <= 4; i++) {
    deck.push({
      id: `wild_${i}_${++cardCounter}`,
      color: 'wild',
      value: 'wild',
      score: 50
    });
  }

  // 4x Coringa Compre 4 (Wild Draw 4)
  for (let i = 1; i <= 4; i++) {
    deck.push({
      id: `wild_draw4_${i}_${++cardCounter}`,
      color: 'wild',
      value: 'wild_draw4',
      score: 50
    });
  }

  return deck;
}

/**
 * Embaralha o baralho com Fisher-Yates
 */
export function shuffleUnoDeck(cards: UnoCard[]): UnoCard[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Verifica se a carta jogada é permitida de acordo com as regras do UNO
 */
export function isValidUnoMove(card: UnoCard, topCard: UnoCard, currentColor: UnoColor): boolean {
  // Cartas Coringa sempre podem ser jogadas
  if (card.color === 'wild' || card.value === 'wild' || card.value === 'wild_draw4') {
    return true;
  }

  // Mesma cor da carta atual (ou da cor escolhida pelo Coringa anterior)
  if (card.color === currentColor) {
    return true;
  }

  // Mesmo valor ou símbolo (ex: 7 sobre 7, ou Skip sobre Skip)
  if (card.value === topCard.value) {
    return true;
  }

  return false;
}

/**
 * Calcula os pontos da mão do jogador
 */
export function calculateUnoHandScore(hand: UnoCard[]): number {
  return hand.reduce((total, card) => total + card.score, 0);
}

/**
 * Retorna o próximo índice de jogador considerando direção (1 horário, -1 anti-horário)
 */
export function getNextUnoPlayerIndex(
  currentIndex: number,
  totalPlayers: number,
  direction: 1 | -1,
  step = 1
): number {
  if (totalPlayers <= 0) return 0;
  let next = (currentIndex + (direction * step)) % totalPlayers;
  while (next < 0) {
    next += totalPlayers;
  }
  return next;
}

/**
 * Retorna um nome descritivo em português para a carta
 */
export function getUnoCardLabel(card: UnoCard): string {
  const colorName = UNO_COLOR_NAMES[card.color] || card.color;
  switch (card.value) {
    case 'skip':
      return `${colorName} Bloqueio (Pular)`;
    case 'reverse':
      return `${colorName} Inverter`;
    case 'draw2':
      return `${colorName} +2`;
    case 'wild':
      return 'Coringa (Mudar Cor)';
    case 'wild_draw4':
      return 'Coringa +4 (Compre 4)';
    default:
      return `${colorName} ${card.value}`;
  }
}

/**
 * IA Inteligente para Bots de UNO
 */
export function chooseBotUnoMove(
  botHand: UnoCard[],
  topCard: UnoCard,
  currentColor: UnoColor
): { card: UnoCard; chosenColor?: UnoColor } | null {
  // Filtra as cartas válidas
  const legalCards = botHand.filter(c => isValidUnoMove(c, topCard, currentColor));
  if (legalCards.length === 0) {
    return null; // Precisa comprar
  }

  // Preferência:
  // 1. Ações da mesma cor (Skip, Reverse, +2)
  // 2. Números da mesma cor
  // 3. Mesmos números de cor diferente
  // 4. Coringa / Coringa +4 por último (para guardar nas horas críticas)
  const actionCards = legalCards.filter(c => c.color !== 'wild' && ['draw2', 'skip', 'reverse'].includes(c.value));
  const sameColorNumbers = legalCards.filter(c => c.color === currentColor && !['draw2', 'skip', 'reverse'].includes(c.value));
  const otherColorSameNumber = legalCards.filter(c => c.color !== 'wild' && c.color !== currentColor && c.value === topCard.value);
  const wildCards = legalCards.filter(c => c.color === 'wild');

  let chosen: UnoCard;
  if (actionCards.length > 0) {
    chosen = actionCards[Math.floor(Math.random() * actionCards.length)];
  } else if (sameColorNumbers.length > 0) {
    // Joga a carta de maior valor numérico
    chosen = sameColorNumbers.sort((a, b) => b.score - a.score)[0];
  } else if (otherColorSameNumber.length > 0) {
    chosen = otherColorSameNumber[0];
  } else {
    chosen = wildCards[0];
  }

  // Se escolheu um Coringa, decide a cor que o bot mais tem na mão
  let chosenColor: UnoColor | undefined = undefined;
  if (chosen.color === 'wild' || chosen.value === 'wild' || chosen.value === 'wild_draw4') {
    const colorCounts: Record<UnoColor, number> = {
      red: 0,
      blue: 0,
      green: 0,
      yellow: 0,
      wild: 0
    };

    for (const card of botHand) {
      if (card.color !== 'wild') {
        colorCounts[card.color]++;
      }
    }

    let bestColor: UnoColor = 'red';
    let maxCount = -1;
    for (const c of UNO_COLORS) {
      if (colorCounts[c] > maxCount) {
        maxCount = colorCounts[c];
        bestColor = c;
      }
    }
    chosenColor = bestColor;
  }

  return { card: chosen, chosenColor };
}
