/**
 * Firebase Client SDK Initialization & Authentication & Firestore Helpers
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInAnonymously,
  signOut as fbSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FbUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, GameHistoryEntry, Friend } from '../types.ts';

// 1. Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Connect directly to firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

// Error handler conforming to FirestoreErrorInfo standard
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or connecting...');
    }
  }
}
testConnection();

// Google Sign-In via Popup
export async function loginWithGoogle(): Promise<FbUser | null> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
}

// Sign-Out
export async function logout(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.error('Sign out error:', err);
  }
}

// Fetch Profile from Firestore
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

// Save/Update Profile in Firestore
export async function syncUserProfileToDb(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    await setDoc(doc(db, 'users', profile.id), {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Save completed game to user's history
export async function recordGameHistory(userId: string, entry: Omit<GameHistoryEntry, 'id'>): Promise<void> {
  const path = `users/${userId}/gameHistory`;
  try {
    await addDoc(collection(db, 'users', userId, 'gameHistory'), {
      ...entry,
      playedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Fetch user's recent game history
export async function fetchUserGameHistory(userId: string): Promise<GameHistoryEntry[]> {
  const path = `users/${userId}/gameHistory`;
  try {
    const q = query(
      collection(db, 'users', userId, 'gameHistory'),
      orderBy('playedAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as GameHistoryEntry[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Normalizes nickname for unique indexing:
 * lowercase, removes spaces and non-alphanumeric/underscore
 */
export function normalizeNickname(nick: string): string {
  return nick.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
}

/**
 * Checks if a nickname is available in Firestore.
 * Returns { available: true } or { available: false, error: string }
 */
export async function checkNicknameAvailable(
  rawNickname: string,
  currentUserId: string
): Promise<{ available: boolean; error?: string; normalized: string }> {
  const normalized = normalizeNickname(rawNickname);
  if (!normalized || normalized.length < 3) {
    return {
      available: false,
      error: 'O nickname deve ter no mínimo 3 caracteres válidos (letras, números ou _).',
      normalized
    };
  }
  if (normalized.length > 18) {
    return {
      available: false,
      error: 'O nickname deve ter no máximo 18 caracteres.',
      normalized
    };
  }

  const path = `nicknames/${normalized}`;
  try {
    const snap = await getDoc(doc(db, 'nicknames', normalized));
    if (snap.exists()) {
      const data = snap.data();
      if (data.userId && data.userId !== currentUserId) {
        return {
          available: false,
          error: `O nickname "${rawNickname.trim()}" já está em uso por outro jogador. Escolha outro único!`,
          normalized
        };
      }
    }
    return { available: true, normalized };
  } catch (err) {
    console.warn('Error checking nickname in firestore:', err);
    return { available: true, normalized };
  }
}

/**
 * Permanently registers a unique nickname for a user in Firestore
 */
export async function reserveNickname(rawNickname: string, userId: string): Promise<boolean> {
  const normalized = normalizeNickname(rawNickname);
  if (!normalized) return false;
  const path = `nicknames/${normalized}`;
  try {
    await setDoc(doc(db, 'nicknames', normalized), {
      nickname: rawNickname.trim(),
      normalized,
      userId,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Finds a user profile by exact unique nickname
 */
export async function findUserByNickname(rawNickname: string): Promise<UserProfile | null> {
  const normalized = normalizeNickname(rawNickname);
  if (!normalized) return null;
  try {
    const nickSnap = await getDoc(doc(db, 'nicknames', normalized));
    if (nickSnap.exists()) {
      const targetUserId = nickSnap.data()?.userId;
      if (targetUserId) {
        const profile = await fetchUserProfile(targetUserId);
        if (profile) return profile;
      }
    }

    // Fallback: search users collection
    const q = query(collection(db, 'users'), limit(50));
    const usersSnap = await getDocs(q);
    for (const d of usersSnap.docs) {
      const data = d.data() as UserProfile;
      if (
        (data.nickname && normalizeNickname(data.nickname) === normalized) ||
        (data.name && normalizeNickname(data.name) === normalized)
      ) {
        return data;
      }
    }
    return null;
  } catch (err) {
    console.error('Error finding user by nickname:', err);
    return null;
  }
}

/**
 * Fetch list of friends for a user from Firestore
 */
export async function fetchFriendsFromDb(userId: string): Promise<Friend[]> {
  const path = `users/${userId}/friends`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'friends'));
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Friend[];
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Save friend to user's friends list
 */
export async function saveFriendToDb(userId: string, friend: Friend): Promise<void> {
  const path = `users/${userId}/friends/${friend.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'friends', friend.id), {
      ...friend,
      addedAt: friend.addedAt || new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Remove friend from user's friends list
 */
export async function removeFriendFromDb(userId: string, friendId: string): Promise<void> {
  const path = `users/${userId}/friends/${friendId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'friends', friendId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
