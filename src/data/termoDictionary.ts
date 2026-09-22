/**
 * Dicionário Completo da Língua Portuguesa e Utilitários para o Modo TERMO
 * Validação instantânea O(1) de palavras reais brasileiras (mais de 58.000 palavras de 5, 6 e 7 letras)
 * e seleção de palavras secretas equilibradas para as rodadas.
 */

import termoData from './termoWords.json';
import { WORD_CATALOG, normalizeWord } from './words.ts';

// Sets em memória para checagem instantânea de palavras válidas
const words5 = new Set<string>(termoData.w5);
const words6 = new Set<string>(termoData.w6);
const words7 = new Set<string>(termoData.w7);

// Adiciona também todas as palavras do catálogo geral de STOP
for (const entry of WORD_CATALOG) {
  const norm = entry.normalized;
  if (norm.length === 5) words5.add(norm);
  else if (norm.length === 6) words6.add(norm);
  else if (norm.length === 7) words7.add(norm);
}

/**
 * Valida se uma palavra de fato existe na Língua Portuguesa
 */
export function isValidTermoWord(rawWord: string): boolean {
  if (!rawWord) return false;
  const clean = normalizeWord(rawWord);
  if (!clean) return false;

  if (clean.length === 5) return words5.has(clean);
  if (clean.length === 6) return words6.has(clean);
  if (clean.length === 7) return words7.has(clean);

  // Fallback para qualquer outro comprimento caso necessário
  return WORD_CATALOG.some(w => w.normalized === clean);
}

/**
 * Alterne a quantidade de letras por rodada:
 * Rodada 1 -> 5 letras
 * Rodada 2 -> 6 letras
 * Rodada 3 -> 7 letras
 * Rodada 4 -> 5 letras
 * Rodada 5 -> 6 letras...
 */
export function getAlternatingTermoLength(roundNumber: number): number {
  const sequence = [5, 6, 7];
  const safeRound = Math.max(1, roundNumber);
  return sequence[(safeRound - 1) % sequence.length];
}

// Pool curado de palavras-alvo secretas familiares e de qualidade para o segredo
const CURATED_TARGETS_5 = [
  'AMIGO', 'AREIA', 'AVIAO', 'BALAO', 'BANCO', 'BARCO', 'BICHO', 'BOLSA', 'BRAVO', 'BRISA',
  'CAMPO', 'CANAL', 'CANTO', 'CARRO', 'CARTA', 'CHAVE', 'CHUVA', 'CLUBE', 'COBRA', 'CORPO',
  'DENTE', 'DISCO', 'FALTA', 'FESTA', 'FOGO', 'FORTE', 'FROTA', 'FUMAR', 'FUNDO', 'GATO',
  'GELO', 'GENTE', 'GIRAR', 'GRADE', 'GRATO', 'HOTEL', 'IDEIA', 'IRMAO', 'JOGO', 'JOVEM',
  'LESTE', 'LIVRO', 'LUGAR', 'MAGIA', 'MALA', 'MANHA', 'MESA', 'MINHA', 'MONTE', 'MUNDO',
  'NAVIO', 'NINHO', 'NOITE', 'NORTE', 'NUVEM', 'ONDA', 'OURO', 'PADRE', 'PALCO', 'PASTA',
  'PEDRA', 'PEIXE', 'PERNA', 'PISTA', 'PLANO', 'POETA', 'PONTE', 'PORTA', 'PRAIA', 'PRATO',
  'PRETO', 'PRIMA', 'PROVA', 'PUDIM', 'QUEDA', 'RADIO', 'RAIO', 'RAMO', 'REINO', 'RESTO',
  'ROCHA', 'ROSTO', 'ROUPA', 'SABOR', 'SAGAZ', 'SAIDA', 'SALTO', 'SANTO', 'SELVA', 'SOLAR',
  'SONHO', 'SORTE', 'TARDE', 'TEMPO', 'TERMO', 'TERRA', 'TINTA', 'TORRE', 'TRENO', 'TURNO',
  'UNIAO', 'VALOR', 'VENTO', 'VERDE', 'VIGOR', 'VILAO', 'VINHO', 'VISAO', 'VIVER', 'ZEBRA'
].map(normalizeWord).filter(w => w.length === 5);

const CURATED_TARGETS_6 = [
  'ALFACE', 'AMIGOS', 'ANANAS', 'ANELAR', 'ANIMAL', 'ARVORE', 'BANANA', 'BARRIL',
  'BATATA', 'BEIJO', 'BELEZA', 'BONECA', 'BOSQUE', 'BRASIL', 'BRILHO', 'CABELO',
  'CAMISA', 'CANETA', 'CANHAO', 'CIDADE', 'COELHO', 'COLHER', 'COMIDA', 'COROA',
  'CRISTO', 'DIRETO', 'ESCOLA', 'ESPADA', 'ESTUDO', 'FRANGO', 'FRUTAS', 'FUTEBOL',
  'GAVETA', 'HOMEM', 'JARDIM', 'LIVROS', 'MACACO', 'MENINO', 'MESTRE', 'MUSEU',
  'MUSICA', 'NAVIOS', 'OCEANO', 'OCULOS', 'ONIBUS', 'ORIGEM', 'PANELA', 'PAPEIS',
  'PIPOCA', 'POMBAS', 'PREDIO', 'QUADRO', 'QUARTO', 'QUEIJO', 'QUINTO', 'RAPOSA',
  'RECIFE', 'ROCHAS', 'ROUPAS', 'SAPATO', 'SEREIA', 'SOMBRA', 'TAMBOR', 'TAPETE',
  'TEATRO', 'TIJOLO', 'TOMATE', 'TOALHA', 'TROFEU', 'URBANO', 'VIOLAO', 'VULCAO',
  'XADREZ', 'ZEBRAS'
].map(normalizeWord).filter(w => w.length === 6);

const CURATED_TARGETS_7 = [
  'ABACATE', 'ABOBORA', 'ALGODAO', 'AMARELO', 'ARANHAS', 'ARMARIO', 'BALEIAS', 'BARALHO',
  'BATERIA', 'BESOURO', 'BEZERRO', 'CALCADA', 'CAMARAS', 'CANARIO', 'CANGURU', 'CANUDOS',
  'CASTELO', 'CEBOLAS', 'CELULAR', 'CENOURA', 'CERVEJA', 'CHINELO', 'CIGARRA', 'COLIBRI',
  'CORUJAS', 'CRIANCA', 'CRISTAL', 'DESENHO', 'ENERGIA', 'ESPELHO', 'ESTRELA', 'FARINHA',
  'FORMIGA', 'GALINHA', 'GARRAFA', 'GIRASSO', 'GORILAS', 'GRAVATA', 'GUITARR', 'IMAGENS',
  'INVERNO', 'JACARE', 'JANELAS', 'JARDINS', 'LAGARTO', 'LAMPADA', 'MADEIRA', 'MAQUINA',
  'MARTELO', 'MENINAS', 'MERCADO', 'MILITAR', 'MINERIO', 'MISTURA', 'MOCHILA', 'MORCEGO',
  'NATUREZ', 'PALACIO', 'PALAVRA', 'PALHACO', 'PANELAS', 'PARQUES', 'PESCOCO', 'PIMENTA',
  'PINGUIM', 'PINTURA', 'PIRATAS', 'PISTOLA', 'POLICIA', 'QUADROS', 'REMEDIO', 'REPRESA',
  'SAPATOS', 'SERPENT', 'SOLDADO', 'TESOURA', 'TORRADA', 'TUBARAO', 'VACINAS', 'VALENTE',
  'VEICULO', 'VESTIDO', 'VIAGENS', 'VIOLETA'
].map(normalizeWord).filter(w => w.length === 7);

// Combina os alvos curados com o catálogo geral de STOP para aquela quantidade de letras
const TARGET_POOLS: Record<number, string[]> = {
  5: Array.from(new Set([
    ...CURATED_TARGETS_5,
    ...WORD_CATALOG.filter(w => w.length === 5).map(w => w.normalized)
  ])),
  6: Array.from(new Set([
    ...CURATED_TARGETS_6,
    ...WORD_CATALOG.filter(w => w.length === 6).map(w => w.normalized)
  ])),
  7: Array.from(new Set([
    ...CURATED_TARGETS_7,
    ...WORD_CATALOG.filter(w => w.length === 7).map(w => w.normalized)
  ]))
};

// Garante que absolutamente todas as palavras-alvo secretas também estão nos Sets de palavras válidas
for (const word of TARGET_POOLS[5] || []) words5.add(word);
for (const word of TARGET_POOLS[6] || []) words6.add(word);
for (const word of TARGET_POOLS[7] || []) words7.add(word);

/**
 * Retorna uma palavra secreta aleatória válida e familiar do tamanho requisitado
 */
export function getRandomTermoTarget(length: number): string {
  const pool = TARGET_POOLS[length] || TARGET_POOLS[5];
  if (!pool || pool.length === 0) {
    if (length === 6) return 'MACACO';
    if (length === 7) return 'CASTELO';
    return 'TERMO';
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
