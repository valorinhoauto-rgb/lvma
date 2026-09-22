/**
 * Banco de Palavras, Categorias e Dicas para o Jogo da Forca (Hangman)
 * Especialmente selecionadas para reviver a nostalgia das brincadeiras de infância.
 */

export interface ForcaChallenge {
  id: string;
  word: string;             // Palavra original (ex: "BRIGADEIRO")
  normalized: string;       // Sem acentos/espaços (ex: "BRIGADEIRO")
  category: string;         // Ex: "Doces & Comidas"
  hint: string;             // Dica divertida e nostálgica
  difficulty?: 'facil' | 'medio' | 'dificil';
}

export const FORCA_CHALLENGES: ForcaChallenge[] = [
  // --- INFÂNCIA & BRINCADEIRAS ---
  { id: 'f1', word: 'BICICLETA', normalized: 'BICICLETA', category: 'Infância & Brinquedos', hint: 'Tem duas rodas, guidão e você aprendeu a andar tirando as rodinhas', difficulty: 'facil' },
  { id: 'f2', word: 'PIPA', normalized: 'PIPA', category: 'Infância & Brinquedos', hint: 'Feita de varetas e papel de seda, dança no céu com o vento', difficulty: 'facil' },
  { id: 'f3', word: 'IOIO', normalized: 'IOIO', category: 'Infância & Brinquedos', hint: 'Brinquedo que sobe e desce na ponta de um barbante', difficulty: 'facil' },
  { id: 'f4', word: 'PIAO', normalized: 'PIAO', category: 'Infância & Brinquedos', hint: 'Gira no chão enrolado no cordão e tem uma ponta de ferro', difficulty: 'facil' },
  { id: 'f5', word: 'VIDEOGAME', normalized: 'VIDEOGAME', category: 'Infância & Brinquedos', hint: 'Aparelho de console onde se joga com controle na TV', difficulty: 'facil' },
  { id: 'f6', word: 'ESTILINGUE', normalized: 'ESTILINGUE', category: 'Infância & Brinquedos', hint: 'Forquilha de madeira com elásticos para atirar pedrinhas', difficulty: 'medio' },
  { id: 'f7', word: 'AMARELINHA', normalized: 'AMARELINHA', category: 'Infância & Brinquedos', hint: 'Brincadeira desenhada com giz no chão pulando num pé só', difficulty: 'medio' },
  { id: 'f8', word: 'ESCONDE-ESCONDE', normalized: 'ESCONDEESCONDE', category: 'Infância & Brinquedos', hint: 'Um conta até dez de olhos fechados e os outros se escondem', difficulty: 'medio' },
  { id: 'f9', word: 'BOLINHA DE GUDE', normalized: 'BOLINHADEGUDE', category: 'Infância & Brinquedos', hint: 'Esferas coloridas de vidro jogadas na terra ou no cimento', difficulty: 'medio' },
  { id: 'f10', word: 'PATINETE', normalized: 'PATINETE', category: 'Infância & Brinquedos', hint: 'Prancha com rodas e guidão que você empurra com um pé', difficulty: 'facil' },

  // --- ANIMAIS ---
  { id: 'f11', word: 'CANGURU', normalized: 'CANGURU', category: 'Animais', hint: 'Mamífero da Austrália que pula muito e carrega o filhote na bolsa', difficulty: 'facil' },
  { id: 'f12', word: 'GIRAFA', normalized: 'GIRAFA', category: 'Animais', hint: 'Tem o pescoço mais longo da savana africana', difficulty: 'facil' },
  { id: 'f13', word: 'GOLFINHO', normalized: 'GOLFINHO', category: 'Animais', hint: 'Mamífero aquático muito inteligente que adora dar saltos e acrobacias', difficulty: 'facil' },
  { id: 'f14', word: 'CAMALEAO', normalized: 'CAMALEAO', category: 'Animais', hint: 'Réptil que muda de cor para se camuflar e mexe os olhos de forma independente', difficulty: 'medio' },
  { id: 'f15', word: 'ORNITORRINCO', normalized: 'ORNITORRINCO', category: 'Animais', hint: 'Mamífero que põe ovos, tem bico de pato e cauda de castor', difficulty: 'dificil' },
  { id: 'f16', word: 'TAMANDUA', normalized: 'TAMANDUA', category: 'Animais', hint: 'Animal com focinho longo que usa a língua comprida para comer formigas', difficulty: 'medio' },
  { id: 'f17', word: 'PINGUIM', normalized: 'PINGUIM', category: 'Animais', hint: 'Ave que não voa, usa fraque preto e branco e nada no gelo', difficulty: 'facil' },
  { id: 'f18', word: 'TUBARAO', normalized: 'TUBARAO', category: 'Animais', hint: 'Grande predador dos oceanos com barbatanas afiadas e dentes pontudos', difficulty: 'facil' },
  { id: 'f19', word: 'LOBO-GUARÁ', normalized: 'LOBOGUARA', category: 'Animais', hint: 'Canoídeo de pernas compridas e pelos avermelhados típico do cerrado brasileiro', difficulty: 'medio' },
  { id: 'f20', word: 'CAPIVARA', normalized: 'CAPIVARA', category: 'Animais', hint: 'O maior roedor do mundo, muito calma e adora tomar banho de lago', difficulty: 'facil' },

  // --- COMIDAS & DOCES BRASILEIROS ---
  { id: 'f21', word: 'BRIGADEIRO', normalized: 'BRIGADEIRO', category: 'Comidas & Doces', hint: 'O doce de festa infantil mais famoso do Brasil, enrolado em granulado', difficulty: 'facil' },
  { id: 'f22', word: 'PAO DE QUEIJO', normalized: 'PAODEQUEIJO', category: 'Comidas & Doces', hint: 'Delícia quentinha típica de Minas Gerais feita com polvilho', difficulty: 'facil' },
  { id: 'f23', word: 'COXINHA', normalized: 'COXINHA', category: 'Comidas & Doces', hint: 'Salgado frito com massa dourada e recheio cremoso de frango', difficulty: 'facil' },
  { id: 'f24', word: 'PASTEL', normalized: 'PASTEL', category: 'Comidas & Doces', hint: 'Clássico da feira de domingo, frito na hora e acompanha caldo de cana', difficulty: 'facil' },
  { id: 'f25', word: 'PIPOCA', normalized: 'PIPOCA', category: 'Comidas & Doces', hint: 'Milho que pula na panela quente, essencial no cinema', difficulty: 'facil' },
  { id: 'f26', word: 'FEIJOADA', normalized: 'FEIJOADA', category: 'Comidas & Doces', hint: 'Prato tradicional com feijão preto, carnes e farofa', difficulty: 'facil' },
  { id: 'f27', word: 'ACARAJÉ', normalized: 'ACARAJE', category: 'Comidas & Doces', hint: 'Bolinho de feijão fradinho frito no dendê com vatapá, típico da Bahia', difficulty: 'medio' },
  { id: 'f28', word: 'TAPIOCA', normalized: 'TAPIOCA', category: 'Comidas & Doces', hint: 'Feita da goma de mandioca na frigideira, com recheios doces ou salgados', difficulty: 'facil' },
  { id: 'f29', word: 'CHURROS', normalized: 'CHURROS', category: 'Comidas & Doces', hint: 'Massa frita e crocante recheada com muito doce de leite ou chocolate', difficulty: 'facil' },
  { id: 'f30', word: 'PAÇOCA', normalized: 'PACOCA', category: 'Comidas & Doces', hint: 'Doce típico de festa junina feito com amendoim triturado e açúcar', difficulty: 'facil' },

  // --- PROFISSÕES ---
  { id: 'f31', word: 'ASTRONAUTA', normalized: 'ASTRONAUTA', category: 'Profissões', hint: 'Viaja para o espaço em foguetes e usa traje espacial na Lua', difficulty: 'facil' },
  { id: 'f32', word: 'BOMBEIRO', normalized: 'BOMBEIRO', category: 'Profissões', hint: 'Usa caminhão vermelho, sirene e mangueira para apagar incêndios e salvar vidas', difficulty: 'facil' },
  { id: 'f33', word: 'DETETIVE', normalized: 'DETETIVE', category: 'Profissões', hint: 'Investiga mistérios, pistas e crimes usando lupa e sobretudo', difficulty: 'facil' },
  { id: 'f34', word: 'ARQUEÓLOGO', normalized: 'ARQUEOLOGO', category: 'Profissões', hint: 'Escava a terra em busca de fósseis de dinossauros e ruínas antigas', difficulty: 'medio' },
  { id: 'f35', word: 'VETERINÁRIO', normalized: 'VETERINARIO', category: 'Profissões', hint: 'O médico especializado em cuidar e curar os animais', difficulty: 'facil' },
  { id: 'f36', word: 'PILOTO', normalized: 'PILOTO', category: 'Profissões', hint: 'Fica na cabine comandando aviões cruzando os céus', difficulty: 'facil' },
  { id: 'f37', word: 'CIENTISTA', normalized: 'CIENTISTA', category: 'Profissões', hint: 'Faz pesquisas e experimentos de jaleco em laboratórios', difficulty: 'facil' },
  { id: 'f38', word: 'MARINHEIRO', normalized: 'MARINHEIRO', category: 'Profissões', hint: 'Navega pelos mares em navios e barcos', difficulty: 'facil' },

  // --- DESENHOS & CULTURA POP ---
  { id: 'f39', word: 'CHAVES', normalized: 'CHAVES', category: 'Desenhos & TV', hint: 'Menino órfão que mora numa vila e entra num barril de madeira', difficulty: 'facil' },
  { id: 'f40', word: 'POKÉMON', normalized: 'POKEMON', category: 'Desenhos & TV', hint: 'Monstrinhos de bolso capturados em esferas vermelhas e brancas', difficulty: 'facil' },
  { id: 'f41', word: 'DINOSSAURO', normalized: 'DINOSSAURO', category: 'Mundo Antigo', hint: 'Gigantes pré-históricos extintos que dominavam a Terra', difficulty: 'facil' },
  { id: 'f42', word: 'SUPER-HERÓI', normalized: 'SUPERHEROI', category: 'Quadrinhos & Cinema', hint: 'Usa capa ou armadura e tem poderes especiais para proteger a cidade', difficulty: 'facil' },
  { id: 'f43', word: 'PIRATA', normalized: 'PIRATA', category: 'Aventura & Histórias', hint: 'Navega com bandeira de caveira, tapa-olho e busca tesouros enterrados', difficulty: 'facil' },
  { id: 'f44', word: 'CASTELO', normalized: 'CASTELO', category: 'Lugares & Fantasia', hint: 'Fortaleza medieval com muralhas, torres e ponte levadiça', difficulty: 'facil' },

  // --- LUGARES & NATUREZA ---
  { id: 'f45', word: 'VULCAO', normalized: 'VULCAO', category: 'Natureza', hint: 'Montanha com cratera que expele fumaça, cinzas e lava ardente', difficulty: 'facil' },
  { id: 'f46', word: 'CACHOEIRA', normalized: 'CACHOEIRA', category: 'Natureza', hint: 'Queda d’água corrente cercada de pedras e mata', difficulty: 'facil' },
  { id: 'f47', word: 'FLORESTA', normalized: 'FLORESTA', category: 'Natureza', hint: 'Grande área verde cheia de árvores, cipós e animais silvestres', difficulty: 'facil' },
  { id: 'f48', word: 'ARCO-ÍRIS', normalized: 'ARCOIRIS', category: 'Natureza', hint: 'Sete cores que aparecem no céu quando chove e faz sol ao mesmo tempo', difficulty: 'facil' },
  { id: 'f49', word: 'PIRÂMIDES', normalized: 'PIRAMIDES', category: 'Monumentos', hint: 'Grandes monumentos triangulares no deserto do Egito construídos pelos faraós', difficulty: 'facil' },
  { id: 'f50', word: 'PLANETA', normalized: 'PLANETA', category: 'Espaço & Ciência', hint: 'Corpo celeste que orbita uma estrela, como a Terra ou Marte', difficulty: 'facil' }
];

/**
 * Retorna um desafio aleatório da Forca, evitando palavras já jogadas recentemente.
 */
export function getRandomForcaChallenge(usedIds: string[] = [], categoryFilter?: string): ForcaChallenge {
  let pool = FORCA_CHALLENGES;
  if (categoryFilter && categoryFilter !== 'todas') {
    pool = pool.filter(c => c.category.toLowerCase() === categoryFilter.toLowerCase());
  }

  const unused = pool.filter(c => !usedIds.includes(c.id));
  const available = unused.length > 0 ? unused : pool;

  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

/**
 * Normaliza letra ou chute da Forca
 */
export function normalizeForcaString(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ç/g, 'C')
    .replace(/[^A-Z]/g, '');
}

export const FORCA_CATEGORY_OPTIONS = [
  { id: 'todas', name: 'Todas as Categorias', emoji: '🎲' },
  { id: 'Infância & Brinquedos', name: 'Infância & Brinquedos', emoji: '🧸' },
  { id: 'Animais', name: 'Animais', emoji: '🐾' },
  { id: 'Comidas & Doces', name: 'Comidas & Doces', emoji: '🍬' },
  { id: 'Objetos do Cotidiano', name: 'Objetos & Invenções', emoji: '📦' },
  { id: 'Profissões', name: 'Profissões', emoji: '💼' }
];

