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
  },
  {
    id: "place_sambodromo",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e6/Sambodromo_Marqu%C3%AAs_de_Sapuca%C3%AD_1985_%2853-16A%29.jpg/960px-Sambodromo_Marqu%C3%AAs_de_Sapuca%C3%AD_1985_%2853-16A%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Patrimônio Cultural do Brasil",
    targetName: "SAMBODROMO",
    normalizedTarget: "SAMBODROMO",
    aliases: ["SAMBODROMO","SAMBÓDROMO","MARQUES DE SAPUCAI","SAPUCAI","PASSARELA DO SAMBA","CARNAVAL"],
    hint: "A passarela do samba na Marquês de Sapucaí, palco dos maiores desfiles de Carnaval do mundo.",
    letterCount: 10,
    initialLetter: "S",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_monte_roraima",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Monte_Roraima_e_Kukenan_Tepui_no_retorno_a_casa.jpg/960px-Monte_Roraima_e_Kukenan_Tepui_no_retorno_a_casa.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Natureza / Maravilha do Brasil",
    targetName: "MONTE RORAIMA",
    normalizedTarget: "MONTE RORAIMA",
    aliases: ["MONTE RORAIMA","RORAIMA","TEPUI","MONTE RORAIMA BRASIL"],
    hint: "Gigantesca montanha de topo plano (tepui) na tríplice fronteira entre Brasil, Venezuela e Guiana.",
    letterCount: 12,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_catedral_brasilia",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Catedral_Metropolitana_de_Bras%C3%ADlia_-_Bras%C3%ADlia_-_20150603150521.jpg/960px-Catedral_Metropolitana_de_Bras%C3%ADlia_-_Bras%C3%ADlia_-_20150603150521.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Monumento do Brasil",
    targetName: "CATEDRAL DE BRASILIA",
    normalizedTarget: "CATEDRAL DE BRASILIA",
    aliases: ["CATEDRAL DE BRASILIA","CATEDRAL DE BRASÍLIA","CATEDRAL METROPOLITANA","CATEDRAL","BRASILIA","NIEMEYER"],
    hint: "Famosa catedral com estrutura hiperboloide de 16 colunas de concreto projetada por Oscar Niemeyer.",
    letterCount: 18,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_elevador_lacerda",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Elevador_Lacerda_Salvador_Bahia_Outubro_Rosa_2021-1851.jpg/960px-Elevador_Lacerda_Salvador_Bahia_Outubro_Rosa_2021-1851.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Ponto Turístico do Brasil",
    targetName: "ELEVADOR LACERDA",
    normalizedTarget: "ELEVADOR LACERDA",
    aliases: ["ELEVADOR LACERDA","ELEVADOR","LACERDA","SALVADOR","CIDADE ALTA","BAHIA","CIDADE BAIXA"],
    hint: "Primeiro elevador urbano do mundo que liga a Cidade Baixa à Cidade Alta em Salvador.",
    letterCount: 15,
    initialLetter: "E",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_ponte_hercilio_luz",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Ponte_Hercilio_Luz_-_Florianopolis_-_Santa_Catarina.jpg/960px-Ponte_Hercilio_Luz_-_Florianopolis_-_Santa_Catarina.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Monumento / Cartão-Postal do Brasil",
    targetName: "PONTE HERCILIO LUZ",
    normalizedTarget: "PONTE HERCILIO LUZ",
    aliases: ["PONTE HERCILIO LUZ","HERCILIO LUZ","HERCÍLIO LUZ","PONTE PENSIL","FLORIANOPOLIS","FLORIPA","SANTA CATARINA"],
    hint: "Majestosa ponte pênsil cartão-postal que liga a ilha ao continente em Florianópolis.",
    letterCount: 16,
    initialLetter: "P",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_museu_amanha",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Museu_do_Amanh%C3%A3_ao_anoitecer_do_Rio.jpg/960px-Museu_do_Amanh%C3%A3_ao_anoitecer_do_Rio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Museu / Ponto Turístico do Brasil",
    targetName: "MUSEU DO AMANHA",
    normalizedTarget: "MUSEU DO AMANHA",
    aliases: ["MUSEU DO AMANHA","MUSEU DO AMANHÃ","PRACA MAUA","PORTO MARAVILHA","RIO DE JANEIRO"],
    hint: "Museu futurista projetado por Santiago Calatrava na Praça Mauá no Rio de Janeiro.",
    letterCount: 13,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_pantanal",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Flavio_Andre_Pantanal_Vista_aerea_Pocone_MT.jpg/960px-Flavio_Andre_Pantanal_Vista_aerea_Pocone_MT.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Natureza / Bioma do Brasil",
    targetName: "PANTANAL",
    normalizedTarget: "PANTANAL",
    aliases: ["PANTANAL","PANTANAL MATO GROSSENSE","PANTANAL SUL","MATO GROSSO","MS"],
    hint: "A maior planície de inundação contínua do planeta, santuário de onças, tuiuiús e jacarés.",
    letterCount: 8,
    initialLetter: "P",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_jericoacoara",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Pedra_Furada_de_Jericoacoara_2026.jpg/960px-Pedra_Furada_de_Jericoacoara_2026.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Praia / Maravilha do Brasil",
    targetName: "JERICOACOARA",
    normalizedTarget: "JERICOACOARA",
    aliases: ["JERICOACOARA","JERI","PEDRA FURADA","DUNAS DE JERI","CEARA"],
    hint: "Antiga vila de pescadores no Ceará famosa pela Pedra Furada e lagoas com redes na água.",
    letterCount: 12,
    initialLetter: "J",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_bonito",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Gruta_do_Lago_Azul_%28Bonito%29.jpg/960px-Gruta_do_Lago_Azul_%28Bonito%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Natureza / Turismo do Brasil",
    targetName: "BONITO",
    normalizedTarget: "BONITO",
    aliases: ["BONITO","BONITO MS","GRUTA DO LAGO AZUL","RIO DA PRATA","MATO GROSSO DO SUL"],
    hint: "Capital do ecoturismo no Mato Grosso do Sul, célebre pela Gruta do Lago Azul e rios cristalinos.",
    letterCount: 6,
    initialLetter: "B",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_ouro_preto",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Ouro_Preto_November_2009-11a.jpg/960px-Ouro_Preto_November_2009-11a.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Patrimônio Histórico do Brasil",
    targetName: "OURO PRETO",
    normalizedTarget: "OURO PRETO",
    aliases: ["OURO PRETO","VILA RICA","MINAS GERAIS","IGREJA DE SAO FRANCISCO","ALEIJADINHO"],
    hint: "Histórica cidade colonial mineira, patrimônio da humanidade com ladeiras e igrejas barrocas de Aleijadinho.",
    letterCount: 9,
    initialLetter: "O",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_chapada_veadeiros",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Vale_da_Lua_Chapada_dos_Veadeiros_GO.jpg/960px-Vale_da_Lua_Chapada_dos_Veadeiros_GO.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Natureza / Parque do Brasil",
    targetName: "CHAPADA DOS VEADEIROS",
    normalizedTarget: "CHAPADA DOS VEADEIROS",
    aliases: ["CHAPADA DOS VEADEIROS","VEADEIROS","VALE DA LUA","ALTO PARAISO","GOIAS"],
    hint: "Parque Nacional em Goiás famoso por cânions de quartzo, cachoeiras e as formações lunares do Vale da Lua.",
    letterCount: 19,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_jalapao",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Parque_Estadual_do_Jalap%C3%A3o_Jo%C3%A3o_Paulo_Marques_Dandretta_%2816%29_edited.jpg/960px-Parque_Estadual_do_Jalap%C3%A3o_Jo%C3%A3o_Paulo_Marques_Dandretta_%2816%29_edited.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Natureza / Maravilha do Brasil",
    targetName: "JALAPAO",
    normalizedTarget: "JALAPAO",
    aliases: ["JALAPAO","JALAPÃO","FERVEDOURO","DUNAS DO JALAPAO","TOCANTINS","FERVEDOUROS"],
    hint: "Paraíso no cerrado do Tocantins com dunas douradas e fervedouros de águas azul-turquesa onde não se afunda.",
    letterCount: 7,
    initialLetter: "J",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "place_ilha_grande",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Praia_de_Lopes_Mendes_-_Ilha_Grande_-_Angra_dos_Reis.jpg/960px-Praia_de_Lopes_Mendes_-_Ilha_Grande_-_Angra_dos_Reis.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Natureza / Praia do Brasil",
    targetName: "ILHA GRANDE",
    normalizedTarget: "ILHA GRANDE",
    aliases: ["ILHA GRANDE","ANGRA DOS REIS","LOPES MENDES","LAGOA AZUL"],
    hint: "Famosa ilha paradisíaca em Angra dos Reis cercada por Mata Atlântica e praias paradisíacas como Lopes Mendes.",
    letterCount: 10,
    initialLetter: "I",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "music_elis_regina",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/Elis_Regina_1972.tif/lossless-page1-960px-Elis_Regina_1972.tif.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Cantora Brasileira",
    targetName: "ELIS REGINA",
    normalizedTarget: "ELIS REGINA",
    aliases: ["ELIS REGINA","ELIS","PIMENTINHA","COMO NOSSOS PAIS","AGUAS DE MARCO"],
    hint: "A \"Pimentinha\", considerada por muitos a maior cantora do Brasil, de \"Como Nossos Pais\" e \"Águas de Março\".",
    letterCount: 10,
    initialLetter: "E",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_gilberto_gil",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Gilberto_Gil_1719MC198.jpg/960px-Gilberto_Gil_1719MC198.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Músico Brasileiro",
    targetName: "GILBERTO GIL",
    normalizedTarget: "GILBERTO GIL",
    aliases: ["GILBERTO GIL","GIL","TROPICALIA","PALCO","ANDAR COM FE","AQUELE ABRACO"],
    hint: "Mestre da Tropicália, ministro da cultura e imortal da ABL, autor de \"Aquele Abraço\" e \"Andar com Fé\".",
    letterCount: 11,
    initialLetter: "G",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_milton_nascimento",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Milton_Nascimento%2C_October_2022.jpg/960px-Milton_Nascimento%2C_October_2022.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Cantor Brasileiro",
    targetName: "MILTON NASCIMENTO",
    normalizedTarget: "MILTON NASCIMENTO",
    aliases: ["MILTON NASCIMENTO","MILTON","BITUCA","CLUBE DA ESQUINA","CORACAO DE ESTUDANTE"],
    hint: "A voz de ouro do Clube da Esquina, \"Bituca\" conquistou o mundo com sua voz inconfundível.",
    letterCount: 16,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "place_encontro_aguas",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/79/SOBREVOANDO_O_ENCONTRO_DAS_AGUAS_MANAUS-AM_-_panoramio.jpg/960px-SOBREVOANDO_O_ENCONTRO_DAS_AGUAS_MANAUS-AM_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Fenômeno Natural do Brasil",
    targetName: "ENCONTRO DAS AGUAS",
    normalizedTarget: "ENCONTRO DAS AGUAS",
    aliases: ["ENCONTRO DAS AGUAS","ENCONTRO DAS ÁGUAS","RIO NEGRO E SOLIMOES","RIO AMAZONAS","MANAUS"],
    hint: "Fenômeno onde as águas escuras do Rio Negro e barrentas do Solimões correm lado a lado sem se misturar.",
    letterCount: 16,
    initialLetter: "E",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_lugares",
    isBrazilian: true
  },
  {
    id: "music_chico_buarque",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/90/Chico_Buarque_no_BRAVO.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Compositor Brasileiro",
    targetName: "CHICO BUARQUE",
    normalizedTarget: "CHICO BUARQUE",
    aliases: ["CHICO BUARQUE","CHICO","BUARQUE","CONSTRUCAO","APESAR DE VOCE","A BANDA"],
    hint: "Ícone máximo da MPB e da literatura, genial compositor de \"Construção\", \"Cálice\" e \"A Banda\".",
    letterCount: 12,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_skank",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/01-10-102359-Skank-Samuel-Rosa-Show-01Outubro2010-RiodeJaneiro-Brasil.jpg/120px-01-10-102359-Skank-Samuel-Rosa-Show-01Outubro2010-RiodeJaneiro-Brasil.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Banda Brasileira",
    targetName: "SKANK",
    normalizedTarget: "SKANK",
    aliases: ["SKANK","SAMUEL ROSA","GAROTA NACIONAL","VAMOS FUGIR","PARTIDA DE FUTEBOL","VOU DEIXAR"],
    hint: "Famosa banda mineira de pop rock e reggae liderada por Samuel Rosa, de \"Garota Nacional\" e \"Vou Deixar\".",
    letterCount: 5,
    initialLetter: "S",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_cazuza",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Cazuza_fala_%C3%A0_TVE-RS_em_1988.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Cantor e Poeta Brasileiro",
    targetName: "CAZUZA",
    normalizedTarget: "CAZUZA",
    aliases: ["CAZUZA","AGENOR DE MIRANDA","BARAO VERMELHO","EXAGERADO","IDEOLOGIA","PRO DIA NASCER FELIZ"],
    hint: "Poeta e rebelde do rock nacional nos anos 80, líder do Barão Vermelho e autor de \"Exagerado\" e \"Ideologia\".",
    letterCount: 6,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_gal_costa",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bf/Gal_Costa_Tom_Brasil_%2845246823335%29.jpg/960px-Gal_Costa_Tom_Brasil_%2845246823335%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Cantora Brasileira",
    targetName: "GAL COSTA",
    normalizedTarget: "GAL COSTA",
    aliases: ["GAL COSTA","GAL","FATAL","BABY","MEU NOME E GAL","CHUVA DE PRATA"],
    hint: "Musa da Tropicália e voz lendária da MPB com agudos inesquecíveis em \"Baby\" e \"Chuva de Prata\".",
    letterCount: 8,
    initialLetter: "G",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_marilia_mendonca",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/14/Mar%C3%ADlia_Mendon%C3%A7a_no_programa_Lady_Night_em_2018_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Cantora Brasileira",
    targetName: "MARILIA MENDONCA",
    normalizedTarget: "MARILIA MENDONCA",
    aliases: ["MARILIA MENDONCA","MARÍLIA MENDONÇA","RAINHA DA SOFRENCIA","SOFRENCIA","INFIEIS","DE QUEM E A CULPA"],
    hint: "A eterna \"Rainha da Sofrência\" e fenômeno estrondoso do sertanejo e feminejo nacional.",
    letterCount: 15,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_charlie_brown_jr",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7d/CBJr_Bras%C3%ADlia_2012_Champignon_e_Chor%C3%A3o_%28cropped%29.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Banda Brasileira",
    targetName: "CHARLIE BROWN JR",
    normalizedTarget: "CHARLIE BROWN JR",
    aliases: ["CHARLIE BROWN JR","CHARLIE BROWN","CHORAO","CHORÃO","CBJR","SANTOS","DIAS DE LUTA"],
    hint: "Banda santista de skate rock liderada por Chorão, autora de \"Dias de Luta, Dias de Glória\" e \"Proibida Pra Mim\".",
    letterCount: 14,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_cartola",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Rutherford_Hill_Wine_Cave-1369.jpg/960px-Rutherford_Hill_Wine_Cave-1369.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Sambista Brasileiro",
    targetName: "CARTOLA",
    normalizedTarget: "CARTOLA",
    aliases: ["CARTOLA","AGENOR DE OLIVEIRA","MANGUEIRA","AS ROSAS NAO FALAM","O MUNDO E UM MOINHO"],
    hint: "Poeta maior do samba e fundador da Mangueira, compositor de \"As Rosas Não Falam\" e \"O Mundo é um Moinho\".",
    letterCount: 7,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_pitty",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/EmmilyBarreto_Pitty_TassiaReis.jpg/960px-EmmilyBarreto_Pitty_TassiaReis.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Cantora Brasileira",
    targetName: "PITTY",
    normalizedTarget: "PITTY",
    aliases: ["PITTY","PRISCILLA NOVAES","EQUALIZER","ADMIRAVEL CHIP NOVO","MASCARA","EQUALIZE"],
    hint: "Voz marcante do rock brasileiro nos anos 2000 com \"Admirável Chip Novo\", \"Máscara\" e \"Equalize\".",
    letterCount: 5,
    initialLetter: "P",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_djavan",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Djavan.jpg/960px-Djavan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Cantor e Compositor Brasileiro",
    targetName: "DJAVAN",
    normalizedTarget: "DJAVAN",
    aliases: ["DJAVAN","OCEANO","SE","SINAI","SAMURAI","ALAGOAS"],
    hint: "Gênio alagoano da MPB que une sofisticação harmônica e ritmo popular, autor de \"Oceano\" e \"Se\".",
    letterCount: 6,
    initialLetter: "D",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_lulu_santos",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/25%C2%BA_Pr%C3%AAmio_da_M%C3%BAsica_Brasileira_%2814006096648%29.jpg/960px-25%C2%BA_Pr%C3%AAmio_da_M%C3%BAsica_Brasileira_%2814006096648%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Cantor Brasileiro",
    targetName: "LULU SANTOS",
    normalizedTarget: "LULU SANTOS",
    aliases: ["LULU SANTOS","LULU","COMO UMA ONDA","TEMPOS MODERNOS","TODA FORMA DE AMOR","APENAS MAIS UMA DE AMOR"],
    hint: "Hitmaker consagrado do pop brasileiro com \"Tempos Modernos\", \"Como Uma Onda\" e \"Toda Forma de Amor\".",
    letterCount: 10,
    initialLetter: "L",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_paralamas",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/26_Pr%C3%AAmio_da_M%C3%BAsica_Brasileira_%2818701206962%29.jpg/960px-26_Pr%C3%AAmio_da_M%C3%BAsica_Brasileira_%2818701206962%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Banda Brasileira",
    targetName: "PARALAMAS DO SUCESSO",
    normalizedTarget: "PARALAMAS DO SUCESSO",
    aliases: ["PARALAMAS DO SUCESSO","OS PARALAMAS DO SUCESSO","PARALAMAS","HERBERT VIANNA","MEU ERRO"],
    hint: "Trio histórico do rock nacional com Herbert Vianna, Bi Ribeiro e Barone, autores de \"Meu Erro\".",
    letterCount: 18,
    initialLetter: "P",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_alceu_valenca",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/Alceu_Valenca_Pirenopolis_2023.webm/500px--Alceu_Valenca_Pirenopolis_2023.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    category: "Cantor e Compositor Brasileiro",
    targetName: "ALCEU VALENCA",
    normalizedTarget: "ALCEU VALENCA",
    aliases: ["ALCEU VALENCA","ALCEU VALENÇA","ALCEU","ANUNCIACAO","TROPICANA","MORENA TROPICANA","OLINDA"],
    hint: "Mestre pernambucano do frevo, forró e psicodelia nordestina, compositor de \"Anunciação\" e \"Morena Tropicana\".",
    letterCount: 12,
    initialLetter: "A",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "music_zeca_pagodinho",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Zeca_Pagodinho.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Sambista Brasileiro",
    targetName: "ZECA PAGODINHO",
    normalizedTarget: "ZECA PAGODINHO",
    aliases: ["ZECA PAGODINHO","ZECA","DEIXA A VIDA ME LEVAR","PAGODINHO","XEREM","SAMBA"],
    hint: "Símbolo do samba carioca e carisma puro, famoso pelo hino \"Deixa a Vida Me Levar\".",
    letterCount: 13,
    initialLetter: "Z",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_musica",
    isBrazilian: true
  },
  {
    id: "celeb_tony_ramos",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Tony_Ramos.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Ator Brasileiro",
    targetName: "TONY RAMOS",
    normalizedTarget: "TONY RAMOS",
    aliases: ["TONY RAMOS","TONI RAMOS","ANTONIO RAMOS","NOVELAS"],
    hint: "Um dos maiores e mais respeitados atores da teledramaturgia brasileira com décadas de protagonistas.",
    letterCount: 9,
    initialLetter: "T",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "celeb_lazaro_ramos",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1f/O_Topo_da_Montanha_Tom_Brasil_%28L%C3%A1zaro_Ramos%29_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Ator e Diretor Brasileiro",
    targetName: "LAZARO RAMOS",
    normalizedTarget: "LAZARO RAMOS",
    aliases: ["LAZARO RAMOS","LÁZARO RAMOS","LAZARO","MADAME SATA","O HOMEM QUE COPIAVA","FOGUINHO"],
    hint: "Renomado ator, autor e diretor baiano, com papéis marcantes em \"Madame Satã\" e novelas memoráveis.",
    letterCount: 11,
    initialLetter: "L",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "celeb_paulo_gustavo",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Paulo_Gustavo_em_novembro_de_2019_no_Humor_Multishow.png/960px-Paulo_Gustavo_em_novembro_de_2019_no_Humor_Multishow.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Ator e Humorista Brasileiro",
    targetName: "PAULO GUSTAVO",
    normalizedTarget: "PAULO GUSTAVO",
    aliases: ["PAULO GUSTAVO","DONA HERMINIA","MINHA MAE E UMA PECA","HERMINIA","HIPERATIVO"],
    hint: "Ator e humorista genial idolatrado pelo público, criador da inesquecível \"Dona Hermínia\".",
    letterCount: 12,
    initialLetter: "P",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "celeb_chico_anysio",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Preservar_para_a_eternidade%2C_Hist%C3%B3ria_no_Museu_da_Pessoa_%28146428%29.pdf/page1-960px-Preservar_para_a_eternidade%2C_Hist%C3%B3ria_no_Museu_da_Pessoa_%28146428%29.pdf.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Humorista Brasileiro",
    targetName: "CHICO ANYSIO",
    normalizedTarget: "CHICO ANYSIO",
    aliases: ["CHICO ANYSIO","CHICO ANISIO","PROFESSOR RAIMUNDO","ESCOLINHA DO PROFESSOR RAIMUNDO","PAINHO","SALOME"],
    hint: "O maior comediante da história da TV brasileira, criador de mais de 200 personagens geniais.",
    letterCount: 11,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "celeb_fernanda_torres",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/Fernanda_Torres%2C_September_2024.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Atriz e Escritora Brasileira",
    targetName: "FERNANDA TORRES",
    normalizedTarget: "FERNANDA TORRES",
    aliases: ["FERNANDA TORRES","FERNANDINHA TORRES","OS NORMAIS","VANILDA","VARIACOES","AINDA ESTOU AQUI"],
    hint: "Atriz consagrada e escritora, premiada no Festival de Cannes e estrela da comédia \"Os Normais\".",
    letterCount: 14,
    initialLetter: "F",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "celeb_lima_duarte",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Limaduarte.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Ator Brasileiro",
    targetName: "LIMA DUARTE",
    normalizedTarget: "LIMA DUARTE",
    aliases: ["LIMA DUARTE","SINHOZINHO MALTA","ZECARANGA","SASSA MUTEMA","ROQUE SANTEIRO"],
    hint: "Ator pioneiro da televisão brasileira, imortalizado como Sinhozinho Malta em \"Roque Santeiro\" e Sassá Mutema.",
    letterCount: 10,
    initialLetter: "L",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "celeb_grande_otelo",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Informe_Final_%28tomo_7_-_parte_3%29_-_Comisi%C3%B3n_de_Verdad_y_Justicia.pdf/page1-500px-Informe_Final_%28tomo_7_-_parte_3%29_-_Comisi%C3%B3n_de_Verdad_y_Justicia.pdf.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Ator e Comediante Brasileiro",
    targetName: "GRANDE OTELO",
    normalizedTarget: "GRANDE OTELO",
    aliases: ["GRANDE OTELO","OTELO","SEBASTIAO BERNARDES","CHANCHADA","MACUNAIMA"],
    hint: "Ícone histórico do cinema e teatro nacional, astro de \"Macunaíma\" e das inesquecíveis chanchadas.",
    letterCount: 11,
    initialLetter: "G",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "celeb_gloria_pires",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/95/GloriaPires_2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Atriz Brasileira",
    targetName: "GLORIA PIRES",
    normalizedTarget: "GLORIA PIRES",
    aliases: ["GLORIA PIRES","GLÓRIA PIRES","RUTH E RAQUEL","MULHERES DE AREIA","MARIA DE FATIMA","VALE TUDO"],
    hint: "Uma das mais brilhantes atrizes do país, inesquecível como as gêmeas Ruth e Raquel em \"Mulheres de Areia\".",
    letterCount: 11,
    initialLetter: "G",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "celeb_marieta_severo",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/O_cinema_fora_do_armario_cartografia_dos.pdf/page1-960px-O_cinema_fora_do_armario_cartografia_dos.pdf.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Atriz Brasileira",
    targetName: "MARIETA SEVERO",
    normalizedTarget: "MARIETA SEVERO",
    aliases: ["MARIETA SEVERO","DONA NENE","DONA NENÊ","A GRANDE FAMILIA","LINEU"],
    hint: "Consagrada atriz brasileira, que marcou época no país como a adorada Dona Nenê de \"A Grande Família\".",
    letterCount: 13,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "celeb_machado_de_assis",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Machado_de_Assis_by_Marc_Ferrez.jpg/960px-Machado_de_Assis_by_Marc_Ferrez.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Escritor Brasileiro",
    targetName: "MACHADO DE ASSIS",
    normalizedTarget: "MACHADO DE ASSIS",
    aliases: ["MACHADO DE ASSIS","MACHADO","DOM CASMURRO","CAPITU","BRUXO DO COSME VELHO","MEMORIAS POSTUMAS"],
    hint: "Maior escritor da literatura brasileira e fundador da ABL, autor de \"Dom Casmurro\" e \"Memórias Póstumas\".",
    letterCount: 14,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "fauna_arara_azul",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Hyacinth_macaw_%28Anodorhynchus_hyacinthinus%29_head.JPG/960px-Hyacinth_macaw_%28Anodorhynchus_hyacinthinus%29_head.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Fauna e Símbolo do Brasil",
    targetName: "ARARA AZUL",
    normalizedTarget: "ARARA AZUL",
    aliases: ["ARARA AZUL","ARARA","ARARA AZUL GRANDE","AVES BRASILEIRAS","PANTANAL"],
    hint: "Ave exuberante de plumagem azul-cobalto símbolo da biodiversidade do Pantanal e do Brasil.",
    letterCount: 9,
    initialLetter: "A",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "celeb_matheus_nachtergaele",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/26_Pr%C3%AAmio_da_M%C3%BAsica_Brasileira_%2818522888039%29.jpg/960px-26_Pr%C3%AAmio_da_M%C3%BAsica_Brasileira_%2818522888039%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Ator Brasileiro",
    targetName: "MATHEUS NACHTERGAELE",
    normalizedTarget: "MATHEUS NACHTERGAELE",
    aliases: ["MATHEUS NACHTERGAELE","JOAO GRILO","AUTO DA COMPADECIDA","CENOURINHA","CIDADE DE DEUS"],
    hint: "Ator de imenso talento, inesquecível no papel do esperto João Grilo em \"O Auto da Compadecida\".",
    letterCount: 19,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "food_tapioca",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/P%C3%A3o_com_manteiga_e_mortadela_%2B_Mam%C3%A3o.jpg/960px-P%C3%A3o_com_manteiga_e_mortadela_%2B_Mam%C3%A3o.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Comida Típica do Brasil",
    targetName: "TAPIOCA",
    normalizedTarget: "TAPIOCA",
    aliases: ["TAPIOCA","BEIJU","GOMA DE MANDIOCA","POLVILHO","NORDESTE"],
    hint: "Delícia indígena feita com fécula de mandioca hidratada aquecida na frigideira com recheios doces ou salgados.",
    letterCount: 7,
    initialLetter: "T",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "food_acai",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/A%C3%A7a%C3%AD_na_tigela_1.jpg/960px-A%C3%A7a%C3%AD_na_tigela_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Comida Típica do Brasil",
    targetName: "ACAI",
    normalizedTarget: "ACAI",
    aliases: ["ACAI","AÇAÍ","ACAI NA TIGELA","FRUTA DA AMAZONIA","GRANOLA"],
    hint: "Fruto roxo da Amazônia batido com xarope de guaraná e servido na tigela com granola e frutas.",
    letterCount: 4,
    initialLetter: "A",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "fauna_onca_pintada",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Jaguar_in_Pantanal_Brazil_1_%28cropped%29.jpg/960px-Jaguar_in_Pantanal_Brazil_1_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Fauna e Símbolo do Brasil",
    targetName: "ONCA PINTADA",
    normalizedTarget: "ONCA PINTADA",
    aliases: ["ONCA PINTADA","ONÇA PINTADA","ONCA","JAGUAR","NOTA DE 50","PANTANAL"],
    hint: "O maior felino das Américas, imponente predador brasileiro estampado na cédula de R$ 50.",
    letterCount: 11,
    initialLetter: "O",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "fauna_mico_leao",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Leontopithecus_rosalia_in_S%C3%A3o_Paulo_Zoo.jpg/960px-Leontopithecus_rosalia_in_S%C3%A3o_Paulo_Zoo.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Fauna e Símbolo do Brasil",
    targetName: "MICO LEAO DOURADO",
    normalizedTarget: "MICO LEAO DOURADO",
    aliases: ["MICO LEAO DOURADO","MICO LEÃO DOURADO","MICO","MATA ATLANTICA","NOTA DE 20"],
    hint: "Primata de juba dourada símbolo da conservação ambiental no Brasil e estampado na cédula de R$ 20.",
    letterCount: 15,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_famosos",
    isBrazilian: true
  },
  {
    id: "food_acaraje",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Baiana-acaraj%C3%A9-Salvador.jpg/960px-Baiana-acaraj%C3%A9-Salvador.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Comida Típica do Brasil",
    targetName: "ACARAJE",
    normalizedTarget: "ACARAJE",
    aliases: ["ACARAJE","ACARAJÉ","BAHIA","COMIDA BAIANA","VATAPA","CARURU","DENDE"],
    hint: "Quitute afro-brasileiro da Bahia de feijão-fradinho frito no azeite de dendê recheado com vatapá e camarão.",
    letterCount: 7,
    initialLetter: "A",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "food_moqueca",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Moqueca_vegana.jpg/960px-Moqueca_vegana.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Comida Típica do Brasil",
    targetName: "MOQUECA",
    normalizedTarget: "MOQUECA",
    aliases: ["MOQUECA","MOQUECA BAIANA","MOQUECA CAPIXABA","PANELA DE BARRO","DENDE","PEIXE"],
    hint: "Tradicional ensopado aromático brasileiro cozido lentamente em panela de barro.",
    letterCount: 7,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "food_picanha",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Del_Barbiere_%284624610379%29.jpg/960px-Del_Barbiere_%284624610379%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Comida Típica do Brasil",
    targetName: "PICANHA",
    normalizedTarget: "PICANHA",
    aliases: ["PICANHA","CHURRASCO","CARNE","PICANHA NA BRASA","CHURRASCO GAUCHO"],
    hint: "O corte nobre mais consagrado do autêntico churrasco brasileiro, com sua famosa capa de gordura.",
    letterCount: 7,
    initialLetter: "P",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "food_farofa",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/54/Revista_Brasileira%2C_Tomo_18_%281899%29.pdf/page1-500px-Revista_Brasileira%2C_Tomo_18_%281899%29.pdf.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Comida Típica do Brasil",
    targetName: "FAROFA",
    normalizedTarget: "FAROFA",
    aliases: ["FAROFA","FAROFA BRASILEIRA","FARINHA DE MANDIOCA","ACOMPANHAMENTO"],
    hint: "Acompanhamento onipresente na mesa brasileira feito com farinha de mandioca tostada na gordura temperada.",
    letterCount: 6,
    initialLetter: "F",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "food_caldo_de_cana",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/Glass_of_sugarcane_juice.jpg/960px-Glass_of_sugarcane_juice.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Bebida Típica do Brasil",
    targetName: "CALDO DE CANA",
    normalizedTarget: "CALDO DE CANA",
    aliases: ["CALDO DE CANA","GARAPA","CANA DE ACUCAR","PASTEL E CALDO DE CANA","FEIRA"],
    hint: "Doce néctar extraído na hora da cana-de-açúcar, companhia clássica do pastel nas feiras de rua.",
    letterCount: 11,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "food_baiao_de_dois",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Bai%C3%A3o_de_dois.jpg/960px-Bai%C3%A3o_de_dois.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Comida Típica do Brasil",
    targetName: "BAIAO DE DOIS",
    normalizedTarget: "BAIAO DE DOIS",
    aliases: ["BAIAO DE DOIS","BAIÃO DE DOIS","ARROZ COM FEIJAO DE CORDA","QUEIJO COALHO","CEARA","CARNE SECA"],
    hint: "Prato clássico nordestino que combina arroz, feijão-de-corda, queijo coalho e carne-seca.",
    letterCount: 11,
    initialLetter: "B",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "food_pacoca",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Pa%C3%A7oca.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    category: "Doce Típico do Brasil",
    targetName: "PACOCA",
    normalizedTarget: "PACOCA",
    aliases: ["PACOCA","PAÇOCA","PACOQUINHA","AMENDOIM","PACOCA DE AMENDOIM","FESTA JUNINA"],
    hint: "Doce tradicional brasileiro feito de amendoim torrado moído com farinha de mandioca e açúcar.",
    letterCount: 6,
    initialLetter: "P",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "food_chimarrao",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Erva_mate_chimarrao_in_big_cuia.jpg/960px-Erva_mate_chimarrao_in_big_cuia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Bebida Típica do Brasil",
    targetName: "CHIMARRAO",
    normalizedTarget: "CHIMARRAO",
    aliases: ["CHIMARRAO","CHIMARRÃO","MATE","ERVA MATE","CUIA","BOMBA","GAUCHO","RIO GRANDE DO SUL"],
    hint: "Bebida tradicional gaúcha feita com infusão de erva-mate quente servida em cuia com bomba metálica.",
    letterCount: 9,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "food_biscoito_globo",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Pandeyuca-colombiano.jpg/960px-Pandeyuca-colombiano.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Marca / Produto Típico do Brasil",
    targetName: "BISCOITO GLOBO",
    normalizedTarget: "BISCOITO GLOBO",
    aliases: ["BISCOITO GLOBO","GLOBO","BISCOITO DE POLVILHO","PRAIA DE IPANEMA","RIO DE JANEIRO"],
    hint: "O tradicional biscoito de polvilho crocante vendido nos saquinhos de papel nas praias do Rio de Janeiro.",
    letterCount: 13,
    initialLetter: "B",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "world_big_ben",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Big_Ben_Elizabeth_Tower_London_2023_01.jpg/960px-Big_Ben_Elizabeth_Tower_London_2023_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Monumento Mundial",
    targetName: "BIG BEN",
    normalizedTarget: "BIG BEN",
    aliases: ["BIG BEN","TORRE DO RELOGIO","LONDRES","INGLATERRA","PALACIO DE WESTMINSTER","ELIZABETH TOWER"],
    hint: "Famosa torre com relógio de quatro faces e grande sino no parlamento britânico em Londres.",
    letterCount: 6,
    initialLetter: "B",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "food_cafe",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/960px-A_small_cup_of_coffee.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Bebida / Símbolo do Brasil",
    targetName: "CAFE",
    normalizedTarget: "CAFE",
    aliases: ["CAFE","CAFÉ","CAFEZINHO","GRAO DE CAFE","CAFE BRASILEIRO","ESPRESSO"],
    hint: "A bebida sagrada das manhãs brasileiras, país líder na produção e exportação mundial do grão.",
    letterCount: 4,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "world_torre_de_pisa",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/The_Duomo_and_Tower_of_Pisa_at_sunrise.jpg/960px-The_Duomo_and_Tower_of_Pisa_at_sunrise.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Monumento Mundial",
    targetName: "TORRE DE PISA",
    normalizedTarget: "TORRE DE PISA",
    aliases: ["TORRE DE PISA","TORRE INCLINADA","PISA","ITALIA","CAMPANARIO"],
    hint: "Famoso campanário de mármore na Itália célebre no mundo inteiro por sua inclinação.",
    letterCount: 11,
    initialLetter: "T",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_taj_mahal",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Taj_Mahal_in_March_2004.jpg/960px-Taj_Mahal_in_March_2004.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Monumento Mundial",
    targetName: "TAJ MAHAL",
    normalizedTarget: "TAJ MAHAL",
    aliases: ["TAJ MAHAL","TAJ","MAUSOLEU","AGRA","INDIA","MARAVILHA DO MUNDO"],
    hint: "Mausoléu de mármore branco em Agra, na Índia, erguido por amor e Maravilha do Mundo.",
    letterCount: 8,
    initialLetter: "T",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "food_churros",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/42/Churros_en_vasos_en_Londres_-_A_Taste_of_Spain.jpg/960px-Churros_en_vasos_en_Londres_-_A_Taste_of_Spain.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Doce Popular do Brasil",
    targetName: "CHURROS",
    normalizedTarget: "CHURROS",
    aliases: ["CHURROS","CHURRO","DOCE DE LEITE","CHURROS DE DOCE DE LEITE"],
    hint: "Massa crocante estriada frita, passada no açúcar e canela e recheada com doce de leite ou chocolate.",
    letterCount: 7,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "brasil_marcas_comidas",
    isBrazilian: true
  },
  {
    id: "world_monte_fuji",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Mt._Fuji_view_from_Lake_Shouji.jpg/960px-Mt._Fuji_view_from_Lake_Shouji.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Natureza Mundial",
    targetName: "MONTE FUJI",
    normalizedTarget: "MONTE FUJI",
    aliases: ["MONTE FUJI","FUJI","FUJISAN","VULCAO","JAPAO"],
    hint: "Vulcão de cume nevado e cone perfeitamente simétrico, montanha sagrada e símbolo do Japão.",
    letterCount: 9,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_chichen_itza",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/960px-Chichen_Itza_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Arqueologia Mundial",
    targetName: "CHICHEN ITZA",
    normalizedTarget: "CHICHEN ITZA",
    aliases: ["CHICHEN ITZA","CHICHÉN ITZÁ","PIRAMIDE DE KUKULCAN","MAIA","MEXICO","YUCATAN"],
    hint: "Cidade arqueológica maia com a pirâmide de Kukulcán na península de Yucatán no México.",
    letterCount: 11,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_opera_sydney",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Sydney_%28AU%29%2C_Opera_House_--_2019_--_3054.jpg/960px-Sydney_%28AU%29%2C_Opera_House_--_2019_--_3054.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Monumento Mundial",
    targetName: "OPERA DE SYDNEY",
    normalizedTarget: "OPERA DE SYDNEY",
    aliases: ["OPERA DE SYDNEY","ÓPERA DE SYDNEY","SYDNEY OPERA HOUSE","SYDNEY","AUSTRALIA"],
    hint: "Edifício espetacular com formato escultural de conchas na baía de Sydney na Austrália.",
    letterCount: 13,
    initialLetter: "O",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_beatles",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/The_Beatles_Abbey_Road_album_cover.jpg/960px-The_Beatles_Abbey_Road_album_cover.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Banda / Música Mundial",
    targetName: "THE BEATLES",
    normalizedTarget: "THE BEATLES",
    aliases: ["THE BEATLES","BEATLES","OS BEATLES","ABBEY ROAD","JOHN LENNON","PAUL MCCARTNEY"],
    hint: "A mais famosa banda de rock de todos os tempos, formada em Liverpool pelo quarteto de ouro.",
    letterCount: 10,
    initialLetter: "T",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_partenon",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/Parthenon_from_south.jpg/960px-Parthenon_from_south.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Monumento / História Mundial",
    targetName: "PARTENON",
    normalizedTarget: "PARTENON",
    aliases: ["PARTENON","PARTENÃO","ACROPOLE","ACROPOLE DE ATENAS","ATENAS","GRECIA"],
    hint: "Templo da Grécia Antiga no topo da Acrópole de Atenas dedicado à deusa Atena.",
    letterCount: 8,
    initialLetter: "P",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_machu_picchu",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Historic_Sanctuary_of_Machu_Picchu-109688.jpg/960px-Historic_Sanctuary_of_Machu_Picchu-109688.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Monumento / Arqueologia Mundial",
    targetName: "MACHU PICCHU",
    normalizedTarget: "MACHU PICCHU",
    aliases: ["MACHU PICCHU","CIDADE PERDIDA DOS INCAS","INCAS","PERU","ANDES","CUSCO"],
    hint: "Histórica cidadela inca do século XV erguida no alto da cordilheira dos Andes no Peru.",
    letterCount: 11,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_david_bowie",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/The_David_Bowie_Mural_in_Sheffield_-_geograph.org.uk_-_6088038.jpg/960px-The_David_Bowie_Mural_in_Sheffield_-_geograph.org.uk_-_6088038.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Música Mundial",
    targetName: "DAVID BOWIE",
    normalizedTarget: "DAVID BOWIE",
    aliases: ["DAVID BOWIE","BOWIE","ZIGGY STARDUST","HEROES","SPACE ODDITY","CAMALEAO DO ROCK"],
    hint: "O Camaleão do Rock britânico, criador de Ziggy Stardust e de clássicos como \"Heroes\" e \"Space Oddity\".",
    letterCount: 10,
    initialLetter: "D",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_charles_chaplin",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Chaplin_The_Kid_edit.jpg/960px-Chaplin_The_Kid_edit.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Cinema Mundial",
    targetName: "CHARLIE CHAPLIN",
    normalizedTarget: "CHARLIE CHAPLIN",
    aliases: ["CHARLIE CHAPLIN","CHAPLIN","O VAGABUNDO","CARLITOS","TEMPOS MODERNOS"],
    hint: "Gênio absoluto do cinema mudo, imortal com seu bigodinho, bengala e o personagem Carlitos.",
    letterCount: 14,
    initialLetter: "C",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_apollo_lua",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Aldrin_Apollo_11.jpg/960px-Aldrin_Apollo_11.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "História Mundial",
    targetName: "HOMEM NA LUA",
    normalizedTarget: "HOMEM NA LUA",
    aliases: ["HOMEM NA LUA","POUSO NA LUA","APOLLO 11","NEIL ARMSTRONG","ASTRONAUTA","PISANDO NA LUA","LUA"],
    hint: "A histórica imagem do homem pisando no solo lunar em 1969 na missão Apollo 11.",
    letterCount: 10,
    initialLetter: "H",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_van_gogh",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/960px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Arte Mundial",
    targetName: "VINCENT VAN GOGH",
    normalizedTarget: "VINCENT VAN GOGH",
    aliases: ["VINCENT VAN GOGH","VAN GOGH","A NOITE ESTRELADA","GIRASSOIS","IMPRESSIONISMO"],
    hint: "Gênio pós-impressionista holandês autor de \"A Noite Estrelada\" e autorretratos inconfundíveis.",
    letterCount: 14,
    initialLetter: "V",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
    isBrazilian: false
  },
  {
    id: "world_marilyn_monroe",
    imageUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Marilyn_Monroe_in_Gentlemen_Prefer_Blondes_trailer1.png/960px-Marilyn_Monroe_in_Gentlemen_Prefer_Blondes_trailer1.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    category: "Cinema Mundial",
    targetName: "MARILYN MONROE",
    normalizedTarget: "MARILYN MONROE",
    aliases: ["MARILYN MONROE","MARILYN","NORMA JEANE","HOLLYWOOD"],
    hint: "Maior ícone de beleza e glamour da era de ouro do cinema em Hollywood no século XX.",
    letterCount: 13,
    initialLetter: "M",
    photoCredit: "Acervo Registrado • Fotografia Autêntica",
    themeId: "mundo_cultura",
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
  isPartial?: boolean;
  isClose: boolean;
  message: string;
  normalizedGuess: string;
  pointsMultiplier?: number;
}

const CONNECTORS = new Set(['DE', 'DO', 'DA', 'DOS', 'DAS', 'E', 'O', 'A', 'EM', 'NO', 'NA', 'DEL', 'DI', 'OF', 'THE', 'AND', 'DU', 'D']);

export function getSignificantWords(text: string): string[] {
  const norm = normalizeJuiceString(text);
  return norm.split(/\s+/).filter(w => w.length >= 2 && !CONNECTORS.has(w));
}

/**
 * Validação com tolerância a acentos, pequenas variações de letras (typos)
 * e aviso dinâmico de proximidade ("está próximo / quase lá").
 * Identifica também respostas "meio certas" (quando o termo é composto por mais de 1 palavra
 * e o jogador digita apenas parte, ex: "CRISTO" em vez de "CRISTO REDENTOR").
 */
export function validateJuiceGuessDetailed(guess: string, challenge: JuicePhotoChallenge): JuiceValidationResult {
  const cleanGuess = normalizeJuiceString(guess);
  if (!cleanGuess) {
    return { isCorrect: false, isClose: false, message: 'Digite um palpite!', normalizedGuess: '' };
  }

  const fullTargetNorm = normalizeJuiceString(challenge.targetName);
  const normalizedTargetNorm = normalizeJuiceString(challenge.normalizedTarget);

  const targetWords = getSignificantWords(challenge.targetName);
  const coreTargetWords = targetWords.length > 0 ? targetWords : getSignificantWords(challenge.normalizedTarget);
  const isMultiWordChallenge = coreTargetWords.length >= 2;

  // Lista de alvos candidatos válidos
  const candidates: string[] = [
    fullTargetNorm,
    normalizedTargetNorm,
    ...challenge.aliases.map(a => normalizeJuiceString(a))
  ];

  // Adiciona partes proeminentes de palavras compostas (ex: "LENCOIS", "MARANHENSES", "SENNA", "WAGNER", "HAVAIANAS")
  challenge.targetName.split(/\s+/).forEach(word => {
    const cleanWord = normalizeJuiceString(word);
    if (cleanWord.length >= 4 && !candidates.includes(cleanWord)) {
      candidates.push(cleanWord);
    }
  });

  const checkIsPartial = (matchedCand: string): boolean => {
    if (!isMultiWordChallenge) return false;

    // Verifica se o palpite cobre todas ou quase todas as palavras centrais do alvo
    const guessWords = getSignificantWords(cleanGuess);
    const matchedCoreCount = coreTargetWords.filter(cw =>
      guessWords.some(gw => gw === cw || getLevenshteinDistance(gw, cw) <= 1 || (gw.length >= 4 && gw.includes(cw)))
    ).length;

    const isFullTargetMatch = cleanGuess === fullTargetNorm ||
      cleanGuess === normalizedTargetNorm ||
      getLevenshteinDistance(cleanGuess, fullTargetNorm) <= 2 ||
      getLevenshteinDistance(cleanGuess, normalizedTargetNorm) <= 2 ||
      (matchedCoreCount >= coreTargetWords.length && coreTargetWords.length >= 2);

    // Verifica se o candidato casado é um alias composto que cobre o conceito completo
    const candidateWords = getSignificantWords(matchedCand);
    const isCandidateFullPhrase = candidateWords.length >= coreTargetWords.length && candidateWords.length >= 2;

    return !(isFullTargetMatch || isCandidateFullPhrase);
  };

  // 1. Verificação de ACERTO (exato ou com pequenas variações de 1 a 2 letras / typos / acentos)
  for (const cand of candidates) {
    if (!cand) continue;

    let matched = false;

    // Correspondência exata normalizada (já ignora acentos, maiúsculas e pontuação)
    if (cleanGuess === cand) {
      matched = true;
    } else {
      const dist = getLevenshteinDistance(cleanGuess, cand);

      // Tolerância a pequenas diferenças de digitação (1 letra em palavras de tamanho médio, 2 em longas)
      if (cand.length >= 5 && cand.length <= 7 && dist <= 1) {
        matched = true;
      } else if (cand.length >= 8 && dist <= 2) {
        matched = true;
      } else if (cleanGuess.length >= 5 && cand.length >= 5) {
        // Substring proeminente (ex: digitou "os lencois maranhenses" ou "lencois maranhenses brasil")
        if (cleanGuess.includes(cand) || cand.includes(cleanGuess)) {
          const ratio = Math.min(cleanGuess.length, cand.length) / Math.max(cleanGuess.length, cand.length);
          if (ratio >= 0.65) {
            matched = true;
          }
        }
      }
    }

    if (matched) {
      const isPartial = checkIsPartial(cand);
      if (isPartial) {
        return {
          isCorrect: true,
          isPartial: true,
          isClose: true,
          pointsMultiplier: 0.5,
          message: '⚡ Resposta Meio Certa! (Nome composto: 50% dos pontos. Envie o nome completo para 100%!)',
          normalizedGuess: cleanGuess
        };
      } else {
        return {
          isCorrect: true,
          isPartial: false,
          isClose: true,
          pointsMultiplier: 1.0,
          message: '🎉 Acertou em cheio! Resposta completa!',
          normalizedGuess: cleanGuess
        };
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
