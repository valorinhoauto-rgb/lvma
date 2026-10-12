/**
 * Supporter & Donation Service for MALM
 * Sistema de Apoio ao Projeto ("Pague um Café", PIX Copia e Cola, Mural de Apoiadores)
 */

import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, syncUserProfileToDb } from './firebase.ts';
import { SupporterEntry, UserProfile } from '../types.ts';
import { saveUserProfile } from '../utils/profile.ts';

const SUPPORTERS_COLLECTION = 'supporters';
const LOCAL_STORAGE_KEY = 'malm_supporters_wall_cache';

export interface SupporterTierInfo {
  id: 'cafe' | 'pizza' | 'servidor';
  name: string;
  priceBRL: number;
  formattedPrice: string;
  badge: string;
  coinsBonus: number;
  description: string;
  perks: string[];
  icon: string;
}

export const SUPPORTER_TIERS: SupporterTierInfo[] = [
  {
    id: 'cafe',
    name: 'Cafézinho do Dev',
    priceBRL: 5.0,
    formattedPrice: 'R$ 5,00',
    badge: '☕ Apoiador Café',
    coinsBonus: 500,
    description: 'Ajude a pagar o café que alimenta o código das novas atualizações!',
    perks: [
      'Badge exclusivo ☕ no perfil e nas salas',
      'Apelido em destaque dourado no chat',
      '+500 MALM Coins de bônus para torneios',
      'Nome eternizado no Mural de Apoiadores'
    ],
    icon: '☕'
  },
  {
    id: 'pizza',
    name: 'Rodada de Pizza',
    priceBRL: 15.0,
    formattedPrice: 'R$ 15,00',
    badge: '⭐ Patrono Fundador',
    coinsBonus: 1800,
    description: 'Contribua com o desenvolvimento contínuo e infraestrutura do jogo!',
    perks: [
      'Badge estelar ⭐ Patrono Fundador',
      'Apelido dourado com brilho no chat e placares',
      '+1.800 MALM Coins de bônus',
      'Mensagem personalizada no Mural de Apoiadores',
      'Prioridade em sugestões de novas palavras e cartas'
    ],
    icon: '🍕'
  },
  {
    id: 'servidor',
    name: 'Manutenção do Servidor',
    priceBRL: 30.0,
    formattedPrice: 'R$ 30,00',
    badge: '👑 Apoiador Lendário',
    coinsBonus: 4000,
    description: 'Ajude a manter os servidores de baixa latência e banco de dados no ar!',
    perks: [
      'Badge lendário 👑 Apoiador Lendário',
      'Apelido com gradiente real e coroa ao lado',
      '+4.000 MALM Coins de bônus instantâneo',
      'Destaque no topo do Mural de Apoiadores',
      'Acesso antecipado a novos modos de jogo'
    ],
    icon: '🚀'
  }
];

// Chave PIX do Projeto MALM (Chave pública em E-mail com QR Code/Copia e Cola oficial do banco)
export const PIX_CONFIG = {
  keyType: 'Email',
  keyValue: 'minecraftthedark@gmail.com',
  emailKey: 'minecraftthedark@gmail.com',
  recipientName: 'LEONARDO V DE MORAIS',
  city: 'MAIRIPORA',
  staticCode: '00020101021126330014br.gov.bcb.pix0111460675988765204000053039865802BR5920LEONARDO V DE MORAIS6009MAIRIPORA62070503***6304ADBD'
};

/**
 * Cálculo oficial de CRC16-CCITT (Polinômio 0x1021, valor inicial 0xFFFF)
 * Utilizado para validação de integridade do padrão BR Code do Banco Central do Brasil
 */
export function calculatePixCrc16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera o código PIX Copia e Cola formatado padrão EMV.
 * Se nenhum valor for fornecido, retorna o código oficial exato gerado pelo banco.
 */
export function generatePixCopiaECola(amount?: number): string {
  if (!amount || amount <= 0) {
    return PIX_CONFIG.staticCode;
  }
  const p1 = '00020101021126330014br.gov.bcb.pix011146067598876520400005303986';
  const p2 = '5802BR5920LEONARDO V DE MORAIS6009MAIRIPORA62070503***6304';
  const amtStr = amount.toFixed(2);
  const amtTag = '54' + amtStr.length.toString().padStart(2, '0') + amtStr;
  const payload = p1 + amtTag + p2;
  return payload + calculatePixCrc16(payload);
}

// Sementes iniciais para o mural parecer ativo e engajado
export const INITIAL_WALL_SUPPORTERS: SupporterEntry[] = [
  {
    id: 'sup_alpha_1',
    name: 'Lucas_Dev',
    nickname: 'Lucas_Dev',
    avatar: '🦁',
    avatarColor: 'amber',
    tier: 'servidor',
    badge: '👑 Apoiador Lendário',
    message: 'Adorei o modo UNO e o Stop com votação! Parabéns pelo projeto.',
    donatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    amountBRL: 30.0
  },
  {
    id: 'sup_beta_2',
    name: 'Mariana_Palavras',
    nickname: 'Mariana_Palavras',
    avatar: '🦊',
    avatarColor: 'emerald',
    tier: 'pizza',
    badge: '⭐ Patrono Fundador',
    message: 'O jogo da forca com os amigos ficou nostálgico demais!',
    donatedAt: new Date(Date.now() - 86400000).toISOString(),
    amountBRL: 15.0
  },
  {
    id: 'sup_gamma_3',
    name: 'Gabriel_Termo',
    nickname: 'Gabriel_Termo',
    avatar: '🐼',
    avatarColor: 'teal',
    tier: 'cafe',
    badge: '☕ Apoiador Café',
    message: 'Um cafezinho merecido para a equipe. Continuem o bom trabalho!',
    donatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    amountBRL: 5.0
  }
];

function getLocalSupporters(): SupporterEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_WALL_SUPPORTERS;
}

function saveLocalSupporters(items: SupporterEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

/**
 * Assina atualizações em tempo real do mural de apoiadores
 */
export function subscribeSupportersWall(callback: (supporters: SupporterEntry[]) => void): Unsubscribe {
  const colRef = collection(db, SUPPORTERS_COLLECTION);
  const initial = getLocalSupporters();
  callback(initial);

  try {
    const unsub = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          callback(INITIAL_WALL_SUPPORTERS);
          return;
        }

        const list: SupporterEntry[] = [];
        snapshot.forEach((snap) => {
          list.push(snap.data() as SupporterEntry);
        });

        // Ordena por doações mais recentes
        list.sort((a, b) => new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime());
        saveLocalSupporters(list);
        callback(list);
      },
      (err) => {
        console.warn('Firestore supporters subscription fallback:', err);
        callback(getLocalSupporters());
      }
    );
    return unsub;
  } catch {
    return () => {};
  }
}

/**
 * Ativa o status de apoiador para o jogador atual (recompensa imediata e sinc)
 */
export async function activateSupporterStatus(
  userProfile: UserProfile,
  tierId: 'cafe' | 'pizza' | 'servidor',
  message?: string
): Promise<{ success: boolean; message: string; updatedProfile: UserProfile }> {
  const tier = SUPPORTER_TIERS.find((t) => t.id === tierId) || SUPPORTER_TIERS[0];

  const currentCoins = userProfile.malmCoins ?? 250;
  const newCoins = currentCoins + tier.coinsBonus;
  const currentTotal = (userProfile.totalDonatedBRL || 0) + tier.priceBRL;

  const updatedProfile: UserProfile = {
    ...userProfile,
    isSupporter: true,
    supporterTier: tier.id,
    supporterBadge: tier.badge,
    nameColor: '#f59e0b', // Dourado âmbar de prestígio
    malmCoins: newCoins,
    totalDonatedBRL: currentTotal
  };

  // Salva perfil local e no Firestore
  saveUserProfile(updatedProfile);
  syncUserProfileToDb(updatedProfile);

  // Adiciona ao Mural de Apoiadores
  const entryId = `sup_${userProfile.id}_${Date.now()}`;
  const newEntry: SupporterEntry = {
    id: entryId,
    name: userProfile.name,
    nickname: userProfile.nickname || userProfile.name,
    avatar: userProfile.avatar,
    avatarColor: userProfile.avatarColor,
    tier: tier.id,
    badge: tier.badge,
    message: message?.trim() || `Apoio com ${tier.name}!`,
    donatedAt: new Date().toISOString(),
    amountBRL: tier.priceBRL
  };

  // Atualiza cache local
  const currentWall = getLocalSupporters();
  const updatedWall = [newEntry, ...currentWall.filter((e) => e.id !== entryId)];
  saveLocalSupporters(updatedWall);

  // Sincroniza documento no Firestore
  try {
    await setDoc(doc(db, SUPPORTERS_COLLECTION, entryId), newEntry);
  } catch (err) {
    console.warn('Error saving to supporters collection:', err);
  }

  return {
    success: true,
    message: `🎉 Muito obrigado pelo seu apoio! Você agora é um ${tier.badge} com nome dourado e recebeu +${tier.coinsBonus} MALM Coins!`,
    updatedProfile
  };
}
