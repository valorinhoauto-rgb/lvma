/**
 * Tournament & Competitive Gaming Service for MALM
 * Gerenciamento de Torneios, Pote de Prêmios, Inscrições e Economia de Moedas
 */

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  Unsubscribe
} from 'firebase/firestore';
import { db, syncUserProfileToDb } from './firebase.ts';
import { Tournament, TournamentParticipant, UserProfile } from '../types.ts';
import { saveUserProfile } from '../utils/profile.ts';

const TOURNAMENTS_COLLECTION = 'tournaments';
const LOCAL_STORAGE_KEY = 'malm_tournaments_cache';

export const OFFICIAL_SEED_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour_uno_blitz_1',
    title: 'Copa Relâmpago UNO Pro',
    description: 'Partidas dinâmicas de UNO com cartas especiais e penalidades ativadas. Mostre agilidade no grito de UNO!',
    gameMode: 'uno',
    entryFee: 50,
    prizePool: 500,
    prizes: {
      first: 300,
      second: 125,
      third: 75
    },
    maxParticipants: 8,
    status: 'registering',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    startsAt: new Date(Date.now() + 1800000).toISOString(),
    creatorId: 'official_malm',
    creatorName: 'MALM Competitivo',
    isOfficial: true,
    participants: [
      {
        id: 'bot_alpha',
        name: 'MestreUno_BR',
        nickname: 'MestreUno_BR',
        avatar: '🦁',
        avatarColor: 'amber',
        score: 180,
        matchesPlayed: 1,
        wins: 1,
        registeredAt: new Date(Date.now() - 3000000).toISOString()
      },
      {
        id: 'bot_beta',
        name: 'CartaCuringa',
        nickname: 'CartaCuringa',
        avatar: '🦊',
        avatarColor: 'red',
        score: 120,
        matchesPlayed: 1,
        wins: 0,
        registeredAt: new Date(Date.now() - 2400000).toISOString()
      },
      {
        id: 'bot_gamma',
        name: 'ReiDoReverso',
        nickname: 'ReiDoReverso',
        avatar: '⚡',
        avatarColor: 'cyan',
        score: 95,
        matchesPlayed: 1,
        wins: 0,
        registeredAt: new Date(Date.now() - 1200000).toISOString()
      }
    ]
  },
  {
    id: 'tour_stop_championship_1',
    title: 'Grand Prix STOP + TERMO',
    description: 'A prova máxima de vocabulário e rapidez: critérios de raridade, palavras únicas e validação por votos.',
    gameMode: 'stop_termo',
    entryFee: 100,
    prizePool: 1200,
    prizes: {
      first: 720,
      second: 300,
      third: 180
    },
    maxParticipants: 16,
    status: 'registering',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    startsAt: new Date(Date.now() + 3600000).toISOString(),
    creatorId: 'official_malm',
    creatorName: 'MALM Competitivo',
    isOfficial: true,
    participants: [
      {
        id: 'bot_stop1',
        name: 'DicionarioVivo',
        nickname: 'DicionarioVivo',
        avatar: '🦉',
        avatarColor: 'emerald',
        score: 240,
        matchesPlayed: 1,
        wins: 1,
        registeredAt: new Date(Date.now() - 6000000).toISOString()
      },
      {
        id: 'bot_stop2',
        name: 'Velocista_99',
        nickname: 'Velocista_99',
        avatar: '🚀',
        avatarColor: 'teal',
        score: 190,
        matchesPlayed: 1,
        wins: 0,
        registeredAt: new Date(Date.now() - 4800000).toISOString()
      }
    ]
  },
  {
    id: 'tour_termo_challenge_1',
    title: 'Desafio Master do TERMO Coletivo',
    description: 'Todos os competidores enfrentam os mesmos enigmas de 5 e 6 letras. Vence quem decifrar com menos palpites e tempo.',
    gameMode: 'termo_multiplayer',
    entryFee: 25,
    prizePool: 300,
    prizes: {
      first: 180,
      second: 75,
      third: 45
    },
    maxParticipants: 8,
    status: 'registering',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    startsAt: new Date(Date.now() + 5400000).toISOString(),
    creatorId: 'official_malm',
    creatorName: 'MALM Competitivo',
    isOfficial: true,
    participants: [
      {
        id: 'bot_termo1',
        name: 'AnagramaPro',
        nickname: 'AnagramaPro',
        avatar: '🐼',
        avatarColor: 'amber',
        score: 150,
        matchesPlayed: 1,
        wins: 0,
        registeredAt: new Date(Date.now() - 1500000).toISOString()
      }
    ]
  },
  {
    id: 'tour_forca_free_1',
    title: 'Liga Comunitária da Forca (Entrada Grátis)',
    description: 'Torneio gratuito com premiação garantida patrocinada pela MALM Arena! Salve o boneco e marque mais pontos.',
    gameMode: 'forca',
    entryFee: 0,
    prizePool: 200,
    prizes: {
      first: 120,
      second: 50,
      third: 30
    },
    maxParticipants: 8,
    status: 'registering',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    startsAt: new Date(Date.now() + 7200000).toISOString(),
    creatorId: 'official_malm',
    creatorName: 'MALM Arena Free',
    isOfficial: true,
    participants: []
  }
];

// Helper para ler cache local
function getLocalTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return OFFICIAL_SEED_TOURNAMENTS;
}

// Helper para salvar cache local
function saveLocalTournaments(tournaments: Tournament[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tournaments));
  } catch {}
}

/**
 * Assina atualizações em tempo real dos torneios do Firestore
 */
export function subscribeTournaments(callback: (tournaments: Tournament[]) => void): Unsubscribe {
  const tournamentsCol = collection(db, TOURNAMENTS_COLLECTION);

  // Inicializa imediatamente com cache local para UI ultra rápida
  const initialCache = getLocalTournaments();
  callback(initialCache);

  try {
    const unsub = onSnapshot(
      tournamentsCol,
      (snapshot) => {
        if (snapshot.empty) {
          // Se a coleção estiver vazia no Firestore pela primeira vez, faz o seed
          seedOfficialTournaments(OFFICIAL_SEED_TOURNAMENTS);
          saveLocalTournaments(OFFICIAL_SEED_TOURNAMENTS);
          callback(OFFICIAL_SEED_TOURNAMENTS);
          return;
        }

        const items: Tournament[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Tournament);
        });

        // Ordena: Em andamento / Inscrições primeiro, finalizados depois
        items.sort((a, b) => {
          if (a.status === 'registering' && b.status !== 'registering') return -1;
          if (a.status !== 'registering' && b.status === 'registering') return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        saveLocalTournaments(items);
        callback(items);
      },
      (error) => {
        console.warn('Firestore tournaments subscription warning (fallback to local):', error);
        callback(getLocalTournaments());
      }
    );

    return unsub;
  } catch (err) {
    console.warn('Failed to listen to tournaments collection:', err);
    return () => {};
  }
}

/**
 * Salva sementes oficiais no Firestore
 */
async function seedOfficialTournaments(tournaments: Tournament[]) {
  for (const tour of tournaments) {
    try {
      await setDoc(doc(db, TOURNAMENTS_COLLECTION, tour.id), tour);
    } catch (err) {
      console.warn('Error seeding tournament:', tour.id, err);
    }
  }
}

/**
 * Inscreve um jogador em um torneio
 */
export async function registerInTournament(
  tournamentId: string,
  userProfile: UserProfile
): Promise<{ success: boolean; message: string; updatedProfile?: UserProfile }> {
  const currentTournaments = getLocalTournaments();
  const targetIndex = currentTournaments.findIndex((t) => t.id === tournamentId);

  if (targetIndex === -1) {
    return { success: false, message: 'Torneio não encontrado.' };
  }

  const tour = currentTournaments[targetIndex];

  // Verificar se o torneio ainda aceita inscrições
  if (tour.status !== 'registering') {
    return { success: false, message: 'As inscrições para este torneio já foram encerradas.' };
  }

  // Verificar se já está inscrito
  const alreadyIn = tour.participants.some((p) => p.id === userProfile.id);
  if (alreadyIn) {
    return { success: false, message: 'Você já está inscrito neste torneio!' };
  }

  // Verificar se há vagas
  if (tour.participants.length >= tour.maxParticipants) {
    return { success: false, message: 'As vagas para este torneio estão esgotadas.' };
  }

  // Verificar saldo de moedas
  const userCoins = userProfile.malmCoins ?? 250;
  if (userCoins < tour.entryFee) {
    return {
      success: false,
      message: `Saldo insuficiente! Você tem 🪙 ${userCoins} moedas e a inscrição custa 🪙 ${tour.entryFee}. Resgate o bônus diário ou recarregue moedas.`
    };
  }

  // Deduz as moedas do usuário
  const newCoins = userCoins - tour.entryFee;
  const updatedProfile: UserProfile = {
    ...userProfile,
    malmCoins: newCoins,
    tournamentsPlayed: (userProfile.tournamentsPlayed || 0) + 1
  };

  // Salva perfil atualizado
  saveUserProfile(updatedProfile);
  syncUserProfileToDb(updatedProfile);

  // Adiciona o participante
  const newParticipant: TournamentParticipant = {
    id: userProfile.id,
    name: userProfile.name,
    nickname: userProfile.nickname || userProfile.name,
    avatar: userProfile.avatar,
    avatarColor: userProfile.avatarColor,
    score: 0,
    matchesPlayed: 0,
    wins: 0,
    registeredAt: new Date().toISOString()
  };

  const updatedParticipants = [...tour.participants, newParticipant];

  // Adiciona 80% da taxa de inscrição ao pote de premiação
  const addedToPool = Math.round(tour.entryFee * 0.8);
  const updatedPrizePool = tour.prizePool + addedToPool;
  const updatedPrizes = {
    first: Math.round(updatedPrizePool * 0.6),
    second: Math.round(updatedPrizePool * 0.25),
    third: Math.round(updatedPrizePool * 0.15)
  };

  const isFull = updatedParticipants.length >= tour.maxParticipants;
  const updatedStatus = isFull ? 'live' : 'registering';

  const updatedTournament: Tournament = {
    ...tour,
    participants: updatedParticipants,
    prizePool: updatedPrizePool,
    prizes: updatedPrizes,
    status: updatedStatus
  };

  // Atualiza no cache local
  currentTournaments[targetIndex] = updatedTournament;
  saveLocalTournaments(currentTournaments);

  // Sincroniza no Firestore
  try {
    await updateDoc(doc(db, TOURNAMENTS_COLLECTION, tour.id), {
      participants: updatedParticipants,
      prizePool: updatedPrizePool,
      prizes: updatedPrizes,
      status: updatedStatus
    });
  } catch (err) {
    // Se updateDoc falhar tenta setDoc com merge
    try {
      await setDoc(doc(db, TOURNAMENTS_COLLECTION, tour.id), updatedTournament, { merge: true });
    } catch (e) {
      console.warn('Sync to Firestore tournament error:', e);
    }
  }

  return {
    success: true,
    message: isFull
      ? 'Inscrição confirmada! As vagas foram preenchidas e o torneio começará em breve!'
      : `Inscrição confirmada! Você entrou no torneio. Pote atualizado para 🪙 ${updatedPrizePool} moedas.`,
    updatedProfile
  };
}

/**
 * Cria um novo torneio comunitário
 */
export async function createCustomTournament(
  params: {
    title: string;
    description: string;
    gameMode: Tournament['gameMode'];
    entryFee: number;
    maxParticipants: number;
  },
  userProfile: UserProfile
): Promise<{ success: boolean; message: string; tournament?: Tournament; updatedProfile?: UserProfile }> {
  if (!params.title.trim()) {
    return { success: false, message: 'Digite um título para o torneio.' };
  }

  const basePrize = params.entryFee > 0 ? params.entryFee * 4 : 100;
  const prizes = {
    first: Math.round(basePrize * 0.6),
    second: Math.round(basePrize * 0.25),
    third: Math.round(basePrize * 0.15)
  };

  const id = `tour_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newTournament: Tournament = {
    id,
    title: params.title.trim(),
    description: params.description.trim() || 'Torneio comunitário criado por jogadores MALM.',
    gameMode: params.gameMode,
    entryFee: params.entryFee,
    prizePool: basePrize,
    prizes,
    maxParticipants: params.maxParticipants,
    status: 'registering',
    createdAt: now,
    startsAt: new Date(Date.now() + 3600000).toISOString(),
    creatorId: userProfile.id,
    creatorName: userProfile.nickname || userProfile.name,
    isOfficial: false,
    participants: []
  };

  // Salva no Firestore
  try {
    await setDoc(doc(db, TOURNAMENTS_COLLECTION, id), newTournament);
  } catch (err) {
    console.warn('Firestore create tournament failed, keeping local:', err);
  }

  // Atualiza cache local
  const currentTournaments = getLocalTournaments();
  const updatedList = [newTournament, ...currentTournaments];
  saveLocalTournaments(updatedList);

  // Auto-inscreve o criador caso deseje
  return {
    success: true,
    message: 'Torneio criado com sucesso na Arena!',
    tournament: newTournament
  };
}

/**
 * Resgate de Bônus Diário de Moedas (100 moedas a cada 24 horas)
 */
export function claimDailyBonus(userProfile: UserProfile): {
  success: boolean;
  message: string;
  updatedProfile?: UserProfile;
  remainingMs?: number;
} {
  const now = Date.now();
  const lastClaim = userProfile.lastDailyBonusClaimed
    ? new Date(userProfile.lastDailyBonusClaimed).getTime()
    : 0;

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const elapsed = now - lastClaim;

  if (lastClaim > 0 && elapsed < ONE_DAY_MS) {
    const remaining = ONE_DAY_MS - elapsed;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return {
      success: false,
      message: `Bônus diário já coletado! Volte em ${hours}h ${minutes}min para resgatar mais moedas.`,
      remainingMs: remaining
    };
  }

  const bonusAmount = 100;
  const newCoins = (userProfile.malmCoins ?? 250) + bonusAmount;

  const updatedProfile: UserProfile = {
    ...userProfile,
    malmCoins: newCoins,
    lastDailyBonusClaimed: new Date(now).toISOString()
  };

  saveUserProfile(updatedProfile);
  syncUserProfileToDb(updatedProfile);

  return {
    success: true,
    message: `Parabéns! Você resgatou +${bonusAmount} MALM Coins diárias! Saldo atual: 🪙 ${newCoins}`,
    updatedProfile
  };
}

/**
 * Simulação de Recarga de Pacotes de Moedas (PIX / Cartão)
 */
export function purchaseCoinsPack(
  userProfile: UserProfile,
  packAmount: number,
  packPriceBRL: string
): { success: boolean; message: string; updatedProfile: UserProfile } {
  const newCoins = (userProfile.malmCoins ?? 250) + packAmount;

  const updatedProfile: UserProfile = {
    ...userProfile,
    malmCoins: newCoins
  };

  saveUserProfile(updatedProfile);
  syncUserProfileToDb(updatedProfile);

  return {
    success: true,
    message: `Recarga simulada de ${packAmount} moedas (${packPriceBRL}) concluída com sucesso! Novo saldo: 🪙 ${newCoins}`,
    updatedProfile
  };
}
