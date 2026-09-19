/**
 * Banco de Imagens e Desafios para o Modo Juice / Foto Desafio
 * Com foco e temas de Brasil (Lençóis Maranhenses, Cantores, Bandas, Atores, Marcas, Lugares)
 * e clássicos da cultura pop mundial.
 * 
 * Todas as fotos são fotografias autênticas e históricas de domínio público / acervos oficiais.
 * Sem spoilers nas marcas d'água ou créditos durante a rodada.
 */

import { JuicePhotoChallenge, JuiceThemeId, JuiceThemeInfo } from '../types.ts';

export const JUICE_THEMES: JuiceThemeInfo[] = [
  {
    id: 'brasil_geral',
    name: 'Especial Brasil (Tudo BR)',
    emoji: '🇧🇷',
    description: 'O melhor do Brasil: lugares, cantores, bandas, atores, marcas e comidas'
  },
  {
    id: 'brasil_lugares',
    name: 'Lugares & Maravilhas do BR',
    emoji: '🏖️',
    description: 'Lençóis Maranhenses, Cataratas do Iguaçu, Cristo, Pão de Açúcar e mais'
  },
  {
    id: 'brasil_musica',
    name: 'Música & Bandas do Brasil',
    emoji: '🎸',
    description: 'Tim Maia, Raul Seixas, Rita Lee, Legião Urbana, Titãs, Mamonas, etc.'
  },
  {
    id: 'brasil_famosos',
    name: 'Atores & Ícones Brasileiros',
    emoji: '🎭',
    description: 'Wagner Moura, Fernanda Montenegro, Rodrigo Santoro, Selton Mello, Senna...'
  },
  {
    id: 'brasil_marcas_comidas',
    name: 'Marcas & Comidas Típicas',
    emoji: '☕',
    description: 'Havaianas, Guaraná Antarctica, Feijoada, Pão de Queijo, Coxinha, Pastel...'
  },
  {
    id: 'mundo_cultura',
    name: 'Ícones Mundiais',
    emoji: '🌍',
    description: 'Bob Marley, Freddie Mercury, Torre Eiffel, Mona Lisa, Elvis...'
  },
  {
    id: 'todos',
    name: 'Modo Misto (Todos)',
    emoji: '🎲',
    description: 'Mistura geral com grande presença da cultura e turismo brasileiro'
  }
];

export const JUICE_PHOTO_CHALLENGES: JuicePhotoChallenge[] = [
  // ==========================================
  // --- LUGARES & MARAVILHAS DO BRASIL ---
  // ==========================================
  {
    id: 'place_lencois_maranhenses',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Len%C3%A7%C3%B3is_Maranhenses_2018.jpg/960px-Len%C3%A7%C3%B3is_Maranhenses_2018.jpg',
    category: 'Lugar / Maravilha do Brasil',
    targetName: 'LENCOIS MARANHENSES',
    normalizedTarget: 'LENCOIS MARANHENSES',
    aliases: ['LENCOIS MARANHENSES', 'LENÇOIS MARANHENSES', 'LENCOIS', 'LENÇÓIS', 'MARANHAO', 'PARQUE DOS LENCOIS'],
    hint: 'Parque paradisíaco no Nordeste com infinitas dunas de areia branca e lagoas de água doce cristalina.',
    letterCount: 18,
    initialLetter: 'L',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_lugares',
    isBrazilian: true
  },
  {
    id: 'place_cataratas_iguacu',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Aerial_Foz_de_Igua%C3%A7u_26_Nov_2005.jpg/960px-Aerial_Foz_de_Igua%C3%A7u_26_Nov_2005.jpg',
    category: 'Lugar / Maravilha do Brasil',
    targetName: 'CATARATAS DO IGUACU',
    normalizedTarget: 'CATARATAS DO IGUACU',
    aliases: ['CATARATAS DO IGUACU', 'CATARATAS DO IGUAÇU', 'CATARATAS', 'FOZ DO IGUACU', 'IGUACU', 'GARGANTA DO DIABO'],
    hint: 'Um dos maiores conjuntos de quedas d\'água do planeta e Maravilha da Natureza no Paraná.',
    letterCount: 18,
    initialLetter: 'C',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_lugares',
    isBrazilian: true
  },
  {
    id: 'place_pao_de_acucar',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/P%C3%A3o_de_A%C3%A7ucar_-_Sugarloaf_Mountain_-_Zuckerhut_-_2022.jpg/960px-P%C3%A3o_de_A%C3%A7ucar_-_Sugarloaf_Mountain_-_Zuckerhut_-_2022.jpg',
    category: 'Ponto Turístico do Brasil',
    targetName: 'PAO DE ACUCAR',
    normalizedTarget: 'PAO DE ACUCAR',
    aliases: ['PAO DE ACUCAR', 'PÃO DE AÇÚCAR', 'BONDINHO', 'BONDINHO DO PAO DE ACUCAR', 'MORRO DA URCA'],
    hint: 'Famoso morro monolítico de granito com bondinho aéreo com vista para a baía de Guanabara.',
    letterCount: 11,
    initialLetter: 'P',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_lugares',
    isBrazilian: true
  },
  {
    id: 'place_cristo_redentor',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/960px-Christ_the_Redeemer_-_Cristo_Redentor.jpg',
    category: 'Monumento do Brasil',
    targetName: 'CRISTO REDENTOR',
    normalizedTarget: 'CRISTO REDENTOR',
    aliases: ['CRISTO REDENTOR', 'CRISTO', 'CORCOVADO', 'RIO DE JANEIRO'],
    hint: 'Estátua monumental de braços abertos no topo do morro do Corcovado, eleita Maravilha do Mundo Moderno.',
    letterCount: 14,
    initialLetter: 'C',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_lugares',
    isBrazilian: true
  },
  {
    id: 'place_fernando_noronha',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/EDUARDO_MURUCI_-_BAIA_DOS_PORCOS-%28recorte%29.jpg/960px-EDUARDO_MURUCI_-_BAIA_DOS_PORCOS-%28recorte%29.jpg',
    category: 'Lugar / Maravilha do Brasil',
    targetName: 'FERNANDO DE NORONHA',
    normalizedTarget: 'FERNANDO DE NORONHA',
    aliases: ['FERNANDO DE NORONHA', 'NORONHA', 'BAIA DOS PORCOS', 'MORRO DOIS IRMAOS'],
    hint: 'Arquipélago vulcânico paradisíaco brasileiro conhecido por suas praias cristalinas, tartarugas e golfinhos.',
    letterCount: 18,
    initialLetter: 'F',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_lugares',
    isBrazilian: true
  },
  {
    id: 'place_teatro_amazonas',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Noite_no_Teatro_Amazonas_%28cropped%29.jpg/960px-Noite_no_Teatro_Amazonas_%28cropped%29.jpg',
    category: 'Patrimônio Histórico do Brasil',
    targetName: 'TEATRO AMAZONAS',
    normalizedTarget: 'TEATRO AMAZONAS',
    aliases: ['TEATRO AMAZONAS', 'OPERA DE MANAUS', 'TEATRO DE MANAUS', 'MANAUS'],
    hint: 'Majestosa casa de ópera com cúpula policromada construída no auge do ciclo da borracha em Manaus.',
    letterCount: 14,
    initialLetter: 'T',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_lugares',
    isBrazilian: true
  },
  {
    id: 'place_maracana',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Maracana_2022.jpg/960px-Maracana_2022.jpg',
    category: 'Estádio / Ponto do Brasil',
    targetName: 'MARACANA',
    normalizedTarget: 'MARACANA',
    aliases: ['MARACANA', 'MARACANÃ', 'ESTADIO DO MARACANA', 'TEMPLO DO FUTEBOL'],
    hint: 'O mais mítico e lendário estádio do futebol brasileiro, palco de duas finais de Copa do Mundo.',
    letterCount: 8,
    initialLetter: 'M',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_lugares',
    isBrazilian: true
  },
  {
    id: 'place_pelourinho',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Centro_Hist%C3%B3rico_Salvador_Vista_A%C3%A9rea_2021-0933.jpg/960px-Centro_Hist%C3%B3rico_Salvador_Vista_A%C3%A9rea_2021-0933.jpg',
    category: 'Patrimônio Histórico do Brasil',
    targetName: 'PELOURINHO',
    normalizedTarget: 'PELOURINHO',
    aliases: ['PELOURINHO', 'PELO', 'CENTRO HISTORICO DE SALVADOR', 'SALVADOR BAHIA'],
    hint: 'Bairro histórico de Salvador com ladeiras de pedras pé-de-moleque e casarões coloniais coloridos.',
    letterCount: 10,
    initialLetter: 'P',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_lugares',
    isBrazilian: true
  },
  {
    id: 'place_chapada_diamantina',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/Chapada_Diamantina_Panorama.jpg/960px-Chapada_Diamantina_Panorama.jpg',
    category: 'Natureza / Parque do Brasil',
    targetName: 'CHAPADA DIAMANTINA',
    normalizedTarget: 'CHAPADA DIAMANTINA',
    aliases: ['CHAPADA DIAMANTINA', 'CHAPADA', 'PAI INACIO', 'MORRO DO PAI INACIO'],
    hint: 'Região de serras, cânions monumentais, cachoeiras e grutas no coração da Bahia.',
    letterCount: 17,
    initialLetter: 'C',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_lugares',
    isBrazilian: true
  },

  // ==========================================
  // --- MÚSICA & BANDAS DO BRASIL ---
  // ==========================================
  {
    id: 'music_tim_maia',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Tim_Maia_em_1970_crop_restored.png',
    category: 'Cantor Brasileiro',
    targetName: 'TIM MAIA',
    normalizedTarget: 'TIM MAIA',
    aliases: ['TIM MAIA', 'TIM', 'SEBASTIAO RODRIGUES MAIA', 'O SINDICO'],
    hint: 'O eterno "Síndico" e pioneiro do soul/funk brasileiro, autor de "Não Quero Dinheiro" e "Gostava Tanto de Você".',
    letterCount: 7,
    initialLetter: 'T',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },
  {
    id: 'music_raul_seixas',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Raul_Seixas_%281972%29_colorized.tif/lossy-page1-960px-Raul_Seixas_%281972%29_colorized.tif.jpg',
    category: 'Cantor Brasileiro',
    targetName: 'RAUL SEIXAS',
    normalizedTarget: 'RAUL SEIXAS',
    aliases: ['RAUL SEIXAS', 'RAUL', 'RAULZITO', 'MALUCO BELEZA'],
    hint: 'O eterno Maluco Beleza e pai do rock nacional, compositor de "Metamorfose Ambulante" e "Sociedade Alternativa".',
    letterCount: 10,
    initialLetter: 'R',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },
  {
    id: 'music_rita_lee',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Rita_Lee_-_Credicard_Hall_-_03-2010_%28cropped_2%29.jpg',
    category: 'Cantora Brasileira',
    targetName: 'RITA LEE',
    normalizedTarget: 'RITA LEE',
    aliases: ['RITA LEE', 'RITA', 'RAINHA DO ROCK', 'OS MUTANTES'],
    hint: 'A inesquecível Rainha do Rock brasileiro e dona de sucessos como "Lança Perfume", "Mania de Você" e "Ovelha Negra".',
    letterCount: 7,
    initialLetter: 'R',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },
  {
    id: 'music_mamonas_assassinas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/pt/7/75/Mamonas-assassinas.jpg',
    category: 'Banda Brasileira',
    targetName: 'MAMONAS ASSASSINAS',
    normalizedTarget: 'MAMONAS ASSASSINAS',
    aliases: ['MAMONAS ASSASSINAS', 'MAMONAS', 'DINHO', 'BRASILIA AMARELA', 'PELADOS EM SANTOS'],
    hint: 'O icônico grupo bem-humorado de Guarulhos que conquistou o Brasil com "Pelados em Santos" e a Brasília Amarela.',
    letterCount: 17,
    initialLetter: 'M',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },
  {
    id: 'music_legiao_urbana',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/pt/2/22/Legi%C3%A3o_Urbana.jpg',
    category: 'Banda Brasileira',
    targetName: 'LEGIAO URBANA',
    normalizedTarget: 'LEGIAO URBANA',
    aliases: ['LEGIAO URBANA', 'LEGIÃO URBANA', 'RENATO RUSSO', 'LEGIAO', 'DADO VILLA LOBOS'],
    hint: 'Banda emblemática do rock de Brasília liderada por Renato Russo, autora de "Tempo Perdido" e "Pais e Filhos".',
    letterCount: 12,
    initialLetter: 'L',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },
  {
    id: 'music_titas',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Tit%C3%A3s_2019.png/960px-Tit%C3%A3s_2019.png',
    category: 'Banda Brasileira',
    targetName: 'TITAS',
    normalizedTarget: 'TITAS',
    aliases: ['TITAS', 'TITÃS', 'BANDA TITAS', 'TITAS DO IE IE'],
    hint: 'Uma das maiores bandas paulistanas de rock, com hits antológicos como "Epitáfio", "Polícia", "Comida" e "Sonífera Ilha".',
    letterCount: 5,
    initialLetter: 'T',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },
  {
    id: 'music_sepultura',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Sepultura_Live_at_Olinda_Classic_Hall_2024.jpg/960px-Sepultura_Live_at_Olinda_Classic_Hall_2024.jpg',
    category: 'Banda Brasileira',
    targetName: 'SEPULTURA',
    normalizedTarget: 'SEPULTURA',
    aliases: ['SEPULTURA', 'BANDA SEPULTURA', 'MAX CAVALERA', 'ANDREAS KISSER', 'ROOTS BLOODY ROOTS'],
    hint: 'A mais famosa banda de heavy metal do Brasil no cenário internacional, criadora do revolucionário álbum Roots.',
    letterCount: 9,
    initialLetter: 'S',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },
  {
    id: 'music_caetano_veloso',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Caetano_Veloso_entrevista_Haddad_%C2%B7_23-06-2022_%C2%B7_S%C3%A3o_Paulo_%28SP%29_%2852433690124%29_%28cropped%29.jpg/960px-Caetano_Veloso_entrevista_Haddad_%C2%B7_23-06-2022_%C2%B7_S%C3%A3o_Paulo_%28SP%29_%2852433690124%29_%28cropped%29.jpg',
    category: 'Cantor Brasileiro',
    targetName: 'CAETANO VELOSO',
    normalizedTarget: 'CAETANO VELOSO',
    aliases: ['CAETANO VELOSO', 'CAETANO', 'VELOSO', 'TROPICALIA'],
    hint: 'Mestre da MPB e do Tropicalismo, compositor de "Alegria, Alegria", "Sozinho" e "Você é Linda".',
    letterCount: 13,
    initialLetter: 'C',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },
  {
    id: 'music_ivete_sangalo',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Ivete_Sangalo_SAM_0058_%2854481946217%29_%28cropped%29.jpg/960px-Ivete_Sangalo_SAM_0058_%2854481946217%29_%28cropped%29.jpg',
    category: 'Cantora Brasileira',
    targetName: 'IVETE SANGALO',
    normalizedTarget: 'IVETE SANGALO',
    aliases: ['IVETE SANGALO', 'IVETE', 'VEVETA', 'BANDA EVA'],
    hint: 'A rainha do axé baiano e dona de uma das vozes mais contagiantes do Carnaval brasileiro.',
    letterCount: 12,
    initialLetter: 'I',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },
  {
    id: 'music_roberto_carlos',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Roberto_Carlos_Credicard_Hall_%2842626066250%29.jpg/960px-Roberto_Carlos_Credicard_Hall_%2842626066250%29.jpg',
    category: 'Cantor Brasileiro',
    targetName: 'ROBERTO CARLOS',
    normalizedTarget: 'ROBERTO CARLOS',
    aliases: ['ROBERTO CARLOS', 'O REI', 'ROBERTO', 'JOVEM GUARDA'],
    hint: 'O "Rei" da música brasileira, ícone da Jovem Guarda e das famosas canções românticas de fim de ano.',
    letterCount: 13,
    initialLetter: 'R',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },
  {
    id: 'music_carmen_miranda',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Carmen_Miranda_in_That_Night_in_Rio_%281941%29.jpg/960px-Carmen_Miranda_in_That_Night_in_Rio_%281941%29.jpg',
    category: 'Cantora & Cinema BR',
    targetName: 'CARMEN MIRANDA',
    normalizedTarget: 'CARMEN MIRANDA',
    aliases: ['CARMEN MIRANDA', 'CARMEM MIRANDA', 'PEQUENA NOTAVEL'],
    hint: 'A "Pequena Notável", artista que levou o samba e seu icônico turbante de frutas tropicais a Hollywood.',
    letterCount: 13,
    initialLetter: 'C',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_musica',
    isBrazilian: true
  },

  // ==========================================
  // --- ATORES & ÍCONES BRASILEIROS ---
  // ==========================================
  {
    id: 'actor_wagner_moura',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d4/Wagner_Moura-6546_%283x4%29.jpg/960px-Wagner_Moura-6546_%283x4%29.jpg',
    category: 'Ator Brasileiro',
    targetName: 'WAGNER MOURA',
    normalizedTarget: 'WAGNER MOURA',
    aliases: ['WAGNER MOURA', 'CAPITAO NASCIMENTO', 'WAGNER', 'MOURA', 'TROPA DE ELITE', 'PABLO ESCOBAR'],
    hint: 'Ator e diretor baiano aclamado mundialmente por papéis como o Capitão Nascimento e Pablo Escobar.',
    letterCount: 11,
    initialLetter: 'W',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },
  {
    id: 'actor_fernanda_montenegro',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Fernanda_Montenegro2019.jpg/960px-Fernanda_Montenegro2019.jpg',
    category: 'Atriz Brasileira',
    targetName: 'FERNANDA MONTENEGRO',
    normalizedTarget: 'FERNANDA MONTENEGRO',
    aliases: ['FERNANDA MONTENEGRO', 'FERNANDA', 'DORA', 'CENTRAL DO BRASIL'],
    hint: 'A maior dama do teatro e cinema brasileiro, indicada ao Oscar de Melhor Atriz pelo filme Central do Brasil.',
    letterCount: 18,
    initialLetter: 'F',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },
  {
    id: 'actor_rodrigo_santoro',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Rodrigo_Santoro_at_Berlinale_2025.jpg/960px-Rodrigo_Santoro_at_Berlinale_2025.jpg',
    category: 'Ator Brasileiro',
    targetName: 'RODRIGO SANTORO',
    normalizedTarget: 'RODRIGO SANTORO',
    aliases: ['RODRIGO SANTORO', 'SANTORO', 'XERXES', 'RODRIGO'],
    hint: 'Ator brasileiro de prestígio internacional, famoso pelo imperador Xerxes em 300 e na série Westworld.',
    letterCount: 14,
    initialLetter: 'R',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },
  {
    id: 'actor_selton_mello',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Selton_Mello-68515_%28cropped%29.jpg/960px-Selton_Mello-68515_%28cropped%29.jpg',
    category: 'Ator Brasileiro',
    targetName: 'SELTON MELLO',
    normalizedTarget: 'SELTON MELLO',
    aliases: ['SELTON MELLO', 'SELTON', 'CHICO', 'AUTO DA COMPADECIDA', 'MELLO'],
    hint: 'Ator e cineasta brasileiro imortalizado como o Chicó em O Auto da Compadecida e diretor de O Palhaço.',
    letterCount: 11,
    initialLetter: 'S',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },
  {
    id: 'actor_tais_araujo',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/100_anos_do_Grupo_Globo_e_60_anos_da_Rede_Globo_20_%28Ta%C3%ADs_Ara%C3%BAjo%29_%28cropped%29.jpg',
    category: 'Atriz Brasileira',
    targetName: 'TAIS ARAUJO',
    normalizedTarget: 'TAIS ARAUJO',
    aliases: ['TAIS ARAUJO', 'TAÍS ARAÚJO', 'XICA DA SILVA', 'PRETA'],
    hint: 'Atriz e apresentadora pioneira que marcou a teledramaturgia nacional como Xica da Silva e Preta em Da Cor do Pecado.',
    letterCount: 10,
    initialLetter: 'T',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },
  {
    id: 'sport_ayrton_senna',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Ayrton_Senna_in_the_paddock_before_the_1993_British_Grand_Prix_%2833686752075%29_%28cropped%29.jpg',
    category: 'Ícone do Esporte BR',
    targetName: 'AYRTON SENNA',
    normalizedTarget: 'AYRTON SENNA',
    aliases: ['AYRTON SENNA', 'SENNA', 'AYRTON', 'AIRTON SENNA'],
    hint: 'Tricampeão mundial de Fórmula 1 e um dos maiores ídolos da história esportiva do Brasil.',
    letterCount: 11,
    initialLetter: 'A',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },
  {
    id: 'sport_pele',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Pele_con_brasil_%28cropped%29.jpg',
    category: 'Ícone do Esporte BR',
    targetName: 'PELE',
    normalizedTarget: 'PELE',
    aliases: ['PELE', 'PELÉ', 'EDSON ARANTES DO NASCIMENTO', 'REI DO FUTEBOL'],
    hint: 'O Rei do Futebol, tricampeão da Copa do Mundo com a Seleção Brasileira.',
    letterCount: 4,
    initialLetter: 'P',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },
  {
    id: 'figure_santos_dumont',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Alberto_Santos-Dumont_by_Zaida_Ben-Yusuf.jpg/960px-Alberto_Santos-Dumont_by_Zaida_Ben-Yusuf.jpg',
    category: 'Personalidade Histórica BR',
    targetName: 'SANTOS DUMONT',
    normalizedTarget: 'SANTOS DUMONT',
    aliases: ['SANTOS DUMONT', 'ALBERTO SANTOS DUMONT', 'DUMONT', '14 BIS'],
    hint: 'O Pai da Aviação, inventor e pioneiro da aeronáutica brasileira que voou com o 14-Bis.',
    letterCount: 12,
    initialLetter: 'S',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },
  {
    id: 'figure_oscar_niemeyer',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Oscar_Niemeyer_1968b.jpg',
    category: 'Arquiteto / Ícone do Brasil',
    targetName: 'OSCAR NIEMEYER',
    normalizedTarget: 'OSCAR NIEMEYER',
    aliases: ['OSCAR NIEMEYER', 'NIEMEYER', 'OSCAR'],
    hint: 'O célebre mestre da arquitetura moderna que projetou as curvas dos edifícios e monumentos de Brasília.',
    letterCount: 13,
    initialLetter: 'O',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },
  {
    id: 'animal_capivara',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/Hydrochoeris_hydrochaeris_in_Brazil_in_Petr%C3%B3polis%2C_Rio_de_Janeiro%2C_Brazil_09.jpg/960px-Hydrochoeris_hydrochaeris_in_Brazil_in_Petr%C3%B3polis%2C_Rio_de_Janeiro%2C_Brazil_09.jpg',
    category: 'Fauna do Brasil',
    targetName: 'CAPIVARA',
    normalizedTarget: 'CAPIVARA',
    aliases: ['CAPIVARA', 'CAPIBARA'],
    hint: 'O maior roedor semi-aquático do mundo, carismático e dócil morador das margens de lagos e rios brasileiros.',
    letterCount: 8,
    initialLetter: 'C',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },
  {
    id: 'animal_tucano',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Toucans_%28Ramphastidae%29.jpg/960px-Toucans_%28Ramphastidae%29.jpg',
    category: 'Fauna do Brasil',
    targetName: 'TUCANO',
    normalizedTarget: 'TUCANO',
    aliases: ['TUCANO', 'TUCANO TOCO', 'TOCO'],
    hint: 'Ave emblemática da fauna tropical brasileira com bico comprido, curvado e alaranjado.',
    letterCount: 6,
    initialLetter: 'T',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_famosos',
    isBrazilian: true
  },

  // ==========================================
  // --- MARCAS, PRODUTOS & COMIDAS TÍPICAS ---
  // ==========================================
  {
    id: 'brand_havaianas',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/2023_Japonki_Havaianas_%281%29.jpg/960px-2023_Japonki_Havaianas_%281%29.jpg',
    category: 'Marca Brasileira',
    targetName: 'HAVAIANAS',
    normalizedTarget: 'HAVAIANAS',
    aliases: ['HAVAIANAS', 'CHINELO HAVAIANAS', 'SANDALIA HAVAIANAS', 'CHINELO'],
    hint: 'Famosa marca nacional de sandálias de borracha conhecida no mundo inteiro como "as legítimas".',
    letterCount: 9,
    initialLetter: 'H',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_marcas_comidas',
    isBrazilian: true
  },
  {
    id: 'brand_guarana',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Guarana-antarctica_2020.svg/960px-Guarana-antarctica_2020.svg.png',
    category: 'Marca / Produto do Brasil',
    targetName: 'GUARANA ANTARCTICA',
    normalizedTarget: 'GUARANA ANTARCTICA',
    aliases: ['GUARANA ANTARCTICA', 'GUARANÁ ANTARCTICA', 'GUARANA', 'ANTARCTICA'],
    hint: 'Refrigerante 100% brasileiro feito com o fruto nativo da floresta amazônica.',
    letterCount: 17,
    initialLetter: 'G',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_marcas_comidas',
    isBrazilian: true
  },
  {
    id: 'food_feijoada',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Feijoada_01.jpg',
    category: 'Culinária Típica do Brasil',
    targetName: 'FEIJOADA',
    normalizedTarget: 'FEIJOADA',
    aliases: ['FEIJOADA', 'FEIJOADA COMPLETA', 'FEIJAO PRETO'],
    hint: 'O prato nacional por excelência, preparado com feijão preto cozido com carnes nobres e salgadas.',
    letterCount: 8,
    initialLetter: 'F',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_marcas_comidas',
    isBrazilian: true
  },
  {
    id: 'food_pao_de_queijo',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Pao_de_queijo_brasil.jpg/960px-Pao_de_queijo_brasil.jpg',
    category: 'Culinária Típica do Brasil',
    targetName: 'PAO DE QUEIJO',
    normalizedTarget: 'PAO DE QUEIJO',
    aliases: ['PAO DE QUEIJO', 'PÃO DE QUEIJO'],
    hint: 'Delicioso quitute mineiro feito à base de polvilho e queijo, assado e servido quentinho.',
    letterCount: 11,
    initialLetter: 'P',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_marcas_comidas',
    isBrazilian: true
  },
  {
    id: 'food_brigadeiro',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Brigadeiro.jpg/960px-Brigadeiro.jpg',
    category: 'Doce Típico do Brasil',
    targetName: 'BRIGADEIRO',
    normalizedTarget: 'BRIGADEIRO',
    aliases: ['BRIGADEIRO', 'DOCE DE CHOCOLATE', 'NEGRINHO'],
    hint: 'O doce mais clássico das festas brasileiras, feito com leite condensado e coberto com granulado.',
    letterCount: 10,
    initialLetter: 'B',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_marcas_comidas',
    isBrazilian: true
  },
  {
    id: 'food_coxinha',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Coxinha_-_iguaria_brasileira_01.jpg/960px-Coxinha_-_iguaria_brasileira_01.jpg',
    category: 'Salgado Típico do Brasil',
    targetName: 'COXINHA',
    normalizedTarget: 'COXINHA',
    aliases: ['COXINHA', 'COXINHA DE FRANGO'],
    hint: 'O salgado frito mais amado do Brasil, com massa dourada em formato de gota e recheio de frango.',
    letterCount: 7,
    initialLetter: 'C',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_marcas_comidas',
    isBrazilian: true
  },
  {
    id: 'food_pastel',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Brazilian_pastel.jpg/960px-Brazilian_pastel.jpg',
    category: 'Comida de Feira do Brasil',
    targetName: 'PASTEL',
    normalizedTarget: 'PASTEL',
    aliases: ['PASTEL', 'PASTEL DE FEIRA', 'PASTEIS'],
    hint: 'Clássico das feiras de rua brasileiras, com massa fina frita crocante e recheios diversos.',
    letterCount: 6,
    initialLetter: 'P',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_marcas_comidas',
    isBrazilian: true
  },
  {
    id: 'food_caipirinha',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Caipirinha_with_lime.jpg/960px-Caipirinha_with_lime.jpg',
    category: 'Drink Típico do Brasil',
    targetName: 'CAIPIRINHA',
    normalizedTarget: 'CAIPIRINHA',
    aliases: ['CAIPIRINHA', 'DRINK DE CACHACA', 'CAIPIRA'],
    hint: 'A bebida brasileira oficial e mais famosa do mundo, preparada com cachaça, limão e açúcar.',
    letterCount: 10,
    initialLetter: 'C',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'brasil_marcas_comidas',
    isBrazilian: true
  },

  // ==========================================
  // --- CLÁSSICOS DO MUNDO & CULTURA POP ---
  // ==========================================
  {
    id: 'singer_bob_marley',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Bob_Marley_1976_press_photo.jpg',
    category: 'Cantor / Música Internacional',
    targetName: 'BOB MARLEY',
    normalizedTarget: 'BOB MARLEY',
    aliases: ['BOB MARLEY', 'BOB', 'MARLEY', 'ROBERT NESTA MARLEY', 'THE WAILERS'],
    hint: 'O lendário ícone jamaicano pioneiro do reggae com dreadlocks e sorriso inconfundível.',
    letterCount: 9,
    initialLetter: 'B',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'singer_freddie',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Freddie_Mercury_at_Live_Aid_%281985%29.jpg/960px-Freddie_Mercury_at_Live_Aid_%281985%29.jpg',
    category: 'Cantor / Música Internacional',
    targetName: 'FREDDIE MERCURY',
    normalizedTarget: 'FREDDIE MERCURY',
    aliases: ['FREDDIE MERCURY', 'FREDDIE', 'MERCURY', 'QUEEN', 'FARROKH BULSARA'],
    hint: 'Vocalista britânico do Queen em sua lendária apresentação no concerto Live Aid em 1985.',
    letterCount: 14,
    initialLetter: 'F',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'singer_elvis',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Elvis_Presley_promoting_Jailhouse_Rock.jpg/960px-Elvis_Presley_promoting_Jailhouse_Rock.jpg',
    category: 'Cantor / Música Internacional',
    targetName: 'ELVIS PRESLEY',
    normalizedTarget: 'ELVIS PRESLEY',
    aliases: ['ELVIS PRESLEY', 'ELVIS', 'PRESLEY', 'REI DO ROCK'],
    hint: 'O inesquecível Rei do Rock em clássica imagem promocional de Jailhouse Rock.',
    letterCount: 12,
    initialLetter: 'E',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'singer_michael_jackson',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Michael_Jackson_1983_%283x4_cropped%29_%28contrast%29.jpg/960px-Michael_Jackson_1983_%283x4_cropped%29_%28contrast%29.jpg',
    category: 'Cantor / Música Internacional',
    targetName: 'MICHAEL JACKSON',
    normalizedTarget: 'MICHAEL JACKSON',
    aliases: ['MICHAEL JACKSON', 'MICHAEL', 'JACKSON', 'REI DO POP', 'MJ'],
    hint: 'O Rei do Pop, autor de Thriller, Billie Jean e criador do passo Moonwalk.',
    letterCount: 14,
    initialLetter: 'M',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'figure_einstein',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/960px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
    category: 'Ciência & História Mundial',
    targetName: 'ALBERT EINSTEIN',
    normalizedTarget: 'ALBERT EINSTEIN',
    aliases: ['ALBERT EINSTEIN', 'EINSTEIN', 'ALBERT'],
    hint: 'O mais célebre físico teórico da humanidade, autor da Teoria da Relatividade.',
    letterCount: 14,
    initialLetter: 'A',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'art_mona_lisa',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/960px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    category: 'Obra de Arte Mundial',
    targetName: 'MONA LISA',
    normalizedTarget: 'MONA LISA',
    aliases: ['MONA LISA', 'MONALISA', 'LA GIOCONDA', 'GIOCONDA', 'LEONARDO DA VINCI', 'DA VINCI'],
    hint: 'A pintura a óleo mais famosa do mundo criada por Leonardo da Vinci.',
    letterCount: 9,
    initialLetter: 'M',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'art_o_grito',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/960px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
    category: 'Obra de Arte Mundial',
    targetName: 'O GRITO',
    normalizedTarget: 'O GRITO',
    aliases: ['O GRITO', 'GRITO', 'THE SCREAM', 'EDVARD MUNCH', 'MUNCH'],
    hint: 'Célebre tela expressionista norueguesa de Edvard Munch com um céu em tons alaranjados.',
    letterCount: 7,
    initialLetter: 'O',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'place_eiffel',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Eiffel_Tower_from_Champ-de-Mars%2C_7_August_2017.jpg/960px-Eiffel_Tower_from_Champ-de-Mars%2C_7_August_2017.jpg',
    category: 'Monumento Mundial',
    targetName: 'TORRE EIFFEL',
    normalizedTarget: 'TORRE EIFFEL',
    aliases: ['TORRE EIFFEL', 'EIFFEL', 'PARIS', 'TOUR EIFFEL'],
    hint: 'Estrutura treliçada de ferro inaugurada em 1889 e símbolo supremo da França.',
    letterCount: 11,
    initialLetter: 'T',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'place_coliseu',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg',
    category: 'Monumento Mundial',
    targetName: 'COLISEU',
    normalizedTarget: 'COLISEU',
    aliases: ['COLISEU', 'COLISEU DE ROMA', 'COLOSSEUM', 'ANFITEATRO FLAVIANO'],
    hint: 'Imponente anfiteatro da Roma Antiga onde ocorriam lutas de gladiadores.',
    letterCount: 7,
    initialLetter: 'C',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'place_piramides',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg/960px-Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg',
    category: 'Monumento Mundial',
    targetName: 'PIRAMIDES DE GIZE',
    normalizedTarget: 'PIRAMIDES DE GIZE',
    aliases: ['PIRAMIDES DE GIZE', 'PIRAMIDES', 'PIRAMIDE', 'PIRAMIDE DE QUEOPS', 'EGITO', 'GIZE'],
    hint: 'A mais antiga das Sete Maravilhas do Mundo Antigo construída no deserto.',
    letterCount: 17,
    initialLetter: 'P',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'place_estatua_liberdade',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Front_view_of_Statue_of_Liberty_%28cropped%29.jpg/960px-Front_view_of_Statue_of_Liberty_%28cropped%29.jpg',
    category: 'Monumento Mundial',
    targetName: 'ESTATUA DA LIBERDADE',
    normalizedTarget: 'ESTATUA DA LIBERDADE',
    aliases: ['ESTATUA DA LIBERDADE', 'LIBERDADE', 'STATUE OF LIBERTY'],
    hint: 'Monumento neoclássico segurando uma tocha oferecido pela França.',
    letterCount: 19,
    initialLetter: 'E',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  },
  {
    id: 'place_muralha_china',
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/960px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg',
    category: 'Monumento Mundial',
    targetName: 'MURALHA DA CHINA',
    normalizedTarget: 'MURALHA DA CHINA',
    aliases: ['MURALHA DA CHINA', 'GRANDE MURALHA', 'MURALHA', 'GREAT WALL'],
    hint: 'Série de fortificações de pedra e tijolo construídas ao longo de milhares de quilômetros na Ásia.',
    letterCount: 16,
    initialLetter: 'M',
    photoCredit: 'Acervo Registrado • Fotografia Autêntica',
    themeId: 'mundo_cultura',
    isBrazilian: false
  }
];

export function getRandomJuicePhoto(
  excludeIds: string[] = [],
  themeId: JuiceThemeId = 'brasil_geral'
): JuicePhotoChallenge {
  let pool = JUICE_PHOTO_CHALLENGES;

  if (themeId === 'brasil_geral') {
    // Especial Brasil: Apenas desafios brasileiros
    pool = JUICE_PHOTO_CHALLENGES.filter(c => c.isBrazilian);
  } else if (themeId === 'brasil_lugares') {
    pool = JUICE_PHOTO_CHALLENGES.filter(c => c.themeId === 'brasil_lugares');
  } else if (themeId === 'brasil_musica') {
    pool = JUICE_PHOTO_CHALLENGES.filter(c => c.themeId === 'brasil_musica');
  } else if (themeId === 'brasil_famosos') {
    pool = JUICE_PHOTO_CHALLENGES.filter(c => c.themeId === 'brasil_famosos');
  } else if (themeId === 'brasil_marcas_comidas') {
    pool = JUICE_PHOTO_CHALLENGES.filter(c => c.themeId === 'brasil_marcas_comidas');
  } else if (themeId === 'mundo_cultura') {
    pool = JUICE_PHOTO_CHALLENGES.filter(c => c.themeId === 'mundo_cultura');
  } else if (themeId === 'todos') {
    // Modo misto: piscina com todos os itens
    pool = JUICE_PHOTO_CHALLENGES;
  }

  // Filtragem contra repetidos na mesma partida
  const available = pool.filter(c => !excludeIds.includes(c.id));
  const finalPool = available.length > 0 ? available : (pool.length > 0 ? pool : JUICE_PHOTO_CHALLENGES);
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export function normalizeJuiceString(str: string): string {
  return (str || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^A-Z0-9\s]/g, '')      // remove pontuação
    .replace(/\s+/g, ' ');           // normaliza múltiplos espaços
}

export function getLevenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = [];
  for (let i = 0; i <= bn; ++i) matrix[i] = [i];
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[bn][an];
}

export interface JuiceValidationResult {
  isCorrect: boolean;
  isClose: boolean;
  message: string;
  normalizedGuess: string;
}

/**
 * Validação com tolerância a acentos, pequenas variações de letras (typos)
 * e aviso dinâmico de proximidade ("está próximo / quase lá").
 */
export function validateJuiceGuessDetailed(guess: string, challenge: JuicePhotoChallenge): JuiceValidationResult {
  const cleanGuess = normalizeJuiceString(guess);
  if (!cleanGuess) {
    return { isCorrect: false, isClose: false, message: 'Digite um palpite!', normalizedGuess: '' };
  }

  // Lista de alvos candidatos válidos
  const candidates: string[] = [
    normalizeJuiceString(challenge.targetName),
    normalizeJuiceString(challenge.normalizedTarget),
    ...challenge.aliases.map(a => normalizeJuiceString(a))
  ];

  // Adiciona partes proeminentes de palavras compostas (ex: "LENCOIS", "MARANHENSES", "SENNA", "WAGNER", "HAVAIANAS")
  challenge.targetName.split(/\s+/).forEach(word => {
    const cleanWord = normalizeJuiceString(word);
    if (cleanWord.length >= 4 && !candidates.includes(cleanWord)) {
      candidates.push(cleanWord);
    }
  });

  // 1. Verificação de ACERTO (exato ou com pequenas variações de 1 a 2 letras / typos / acentos)
  for (const cand of candidates) {
    if (!cand) continue;

    // Correspondência exata normalizada (já ignora acentos, maiúsculas e pontuação)
    if (cleanGuess === cand) {
      return { isCorrect: true, isClose: true, message: '🎉 Acertou em cheio!', normalizedGuess: cleanGuess };
    }

    const dist = getLevenshteinDistance(cleanGuess, cand);

    // Tolerância a pequenas diferenças de digitação (1 letra em palavras de tamanho médio, 2 em longas)
    if (cand.length >= 5 && cand.length <= 7 && dist <= 1) {
      return { isCorrect: true, isClose: true, message: '🎉 Acertou!', normalizedGuess: cleanGuess };
    }
    if (cand.length >= 8 && dist <= 2) {
      return { isCorrect: true, isClose: true, message: '🎉 Acertou!', normalizedGuess: cleanGuess };
    }

    // Substring proeminente (ex: digitou "os lencois maranhenses" ou "lencois maranhenses brasil")
    if (cleanGuess.length >= 5 && cand.length >= 5) {
      if (cleanGuess.includes(cand) || cand.includes(cleanGuess)) {
        const ratio = Math.min(cleanGuess.length, cand.length) / Math.max(cleanGuess.length, cand.length);
        if (ratio >= 0.65) {
          return { isCorrect: true, isClose: true, message: '🎉 Acertou!', normalizedGuess: cleanGuess };
        }
      }
    }
  }

  // 2. Verificação de "ESTÁ PRÓXIMO" (Quase lá / feedback de proximidade)
  let isClose = false;
  let closeMessage = '🔥 Está muito próximo! Quase lá...';

  for (const cand of candidates) {
    if (!cand) continue;

    const dist = getLevenshteinDistance(cleanGuess, cand);
    const maxLen = Math.max(cleanGuess.length, cand.length);
    const similarity = maxLen > 0 ? 1 - dist / maxLen : 0;

    // Distância pequena ou similaridade alta
    if (dist <= 3 && cand.length >= 6) {
      isClose = true;
      closeMessage = '🔥 Está muito próximo! Quase lá...';
      break;
    }

    if (similarity >= 0.55 && cleanGuess.length >= 3) {
      isClose = true;
      closeMessage = '🔥 Está muito perto! Continue tentando!';
      break;
    }

    // Começo igual (prefixo) com pelo menos 3 letras
    if (cleanGuess.length >= 3 && cand.startsWith(cleanGuess)) {
      isClose = true;
      closeMessage = `🔥 Você pegou o início ("${cleanGuess}")! Está no caminho certo!`;
      break;
    }

    // Alvo como prefixo de um palpite mais longo
    if (cand.length >= 4 && cleanGuess.startsWith(cand)) {
      isClose = true;
      closeMessage = '🔥 Está pertíssimo!';
      break;
    }
  }

  if (isClose) {
    return {
      isCorrect: false,
      isClose: true,
      message: closeMessage,
      normalizedGuess: cleanGuess
    };
  }

  // Não está correto nem próximo
  return {
    isCorrect: false,
    isClose: false,
    message: 'Ainda não... Tente outro palpite!',
    normalizedGuess: cleanGuess
  };
}

export function validateJuiceGuess(guess: string, challenge: JuicePhotoChallenge): boolean {
  return validateJuiceGuessDetailed(guess, challenge).isCorrect;
}
