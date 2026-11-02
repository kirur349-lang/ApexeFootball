import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  Firestore,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import type { TelegramUser, PlayerProfile } from '../src/types/player.ts';

// Load config safely
let config: any = null;
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch {
  // fallback
}

if (!config) {
  config = {
    projectId: 'gen-lang-client-0726551553',
    appId: '1:874115148407:web:268a58becea3107552f472',
    apiKey: 'AIzaSyCM5B7KzSo_ln7cL8sIzBwLWHXER680_lo',
    authDomain: 'gen-lang-client-0726551553.firebaseapp.com',
    firestoreDatabaseId: 'ai-studio-apexefootballadm-4a575541-f393-4a25-884c-ac75fb539486',
    storageBucket: 'gen-lang-client-0726551553.firebasestorage.app',
    messagingSenderId: '874115148407',
  };
}

const serverApp = getApps().length > 0 ? getApp() : initializeApp(config);
export const serverDb: Firestore = getFirestore(serverApp, config.firestoreDatabaseId);

export interface SharedCoinOrder {
  id: string;
  playerId: string;
  playerName: string;
  playerUsername: string;
  efootballId: string;
  packageName: string;
  packageCoins: number;
  amountUsd: number;
  paymentMethod: string;
  paymentStatus: 'Verification Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Approved' | 'Rejected';
  orderDate: string;
  transactionRef: string;
}

/**
 * Ensures a player record exists in the shared 'players' collection
 */
export async function syncTelegramPlayerToFirestore(user: TelegramUser): Promise<PlayerProfile> {
  const playerId = `tg_${user.id}`;
  const playerRef = doc(serverDb, 'players', playerId);

  const now = new Date().toISOString();
  const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
  const username = user.username || `apex_user_${user.id}`;

  try {
    const existingSnap = await getDoc(playerRef);

    if (existingSnap.exists()) {
      const data = existingSnap.data();
      // Update last active
      await updateDoc(playerRef, {
        lastActiveAt: now,
        avatar: user.photo_url || data.avatar || '',
      });

      return {
        id: playerId,
        telegramId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        photoUrl: user.photo_url || data.avatar || '',
        isPremium: Boolean(user.is_premium),
        apexId: data.apexId || `APEX-${user.id}`,
        apexGamerTag: data.name || fullName,
        konamiId: data.efootballId || undefined,
        coinsBalance: typeof data.coinsBalance === 'number' ? data.coinsBalance : 250,
        rankTitle: data.ranking ? `Apex Division #${data.ranking}` : 'Apex Challenger',
        reputationScore: 100,
        matchesPlayed: data.matchesPlayed || 0,
        wins: data.wins || 0,
        losses: data.losses || 0,
        role: 'player',
        createdAt: data.registrationDate || now,
        lastActiveAt: now,
        isDevPreview: false,
        isBlobPending: false,
      };
    }

    // Create new player record in shared players collection
    const initialPlayerRecord = {
      id: playerId,
      name: fullName,
      username: username,
      efootballId: '',
      coinsBalance: 250, // 250 Welcome bonus
      avatar: user.photo_url || '',
      status: 'Active',
      ranking: 100,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      country: 'Global',
      preferredClub: 'Apex FC',
      telegramId: user.id,
      registrationDate: now.slice(0, 10),
      lastActiveAt: now,
    };

    await setDoc(playerRef, initialPlayerRecord);

    return {
      id: playerId,
      telegramId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      photoUrl: user.photo_url || '',
      isPremium: Boolean(user.is_premium),
      apexId: `APEX-${user.id}`,
      apexGamerTag: fullName,
      konamiId: undefined,
      coinsBalance: 250,
      rankTitle: 'Apex Challenger',
      reputationScore: 100,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      role: 'player',
      createdAt: now,
      lastActiveAt: now,
      isDevPreview: false,
      isBlobPending: false,
    };
  } catch (err) {
    console.error('[Firebase] Failed to sync player to Firestore:', err);
    throw err;
  }
}

/**
 * Creates a real coin order in the shared 'coinOrders' collection
 */
export async function createCoinOrderInFirestore(order: {
  playerId: string;
  playerName: string;
  playerUsername: string;
  efootballId: string;
  packageName: string;
  packageCoins: number;
  amountUsd: number;
  paymentMethod?: string;
}): Promise<SharedCoinOrder> {
  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const txRef = `tx_${Date.now()}`;

  const newOrder: SharedCoinOrder = {
    id: orderId,
    playerId: order.playerId,
    playerName: order.playerName,
    playerUsername: order.playerUsername,
    efootballId: order.efootballId,
    packageName: order.packageName,
    packageCoins: order.packageCoins,
    amountUsd: order.amountUsd,
    paymentMethod: order.paymentMethod || 'Card',
    paymentStatus: 'Verification Pending',
    orderStatus: 'Pending', // Strictly pending for admin approval
    orderDate: dateFormatted,
    transactionRef: txRef,
  };

  const orderDocRef = doc(serverDb, 'coinOrders', orderId);
  await setDoc(orderDocRef, newOrder);

  return newOrder;
}

/**
 * Retrieves coin orders belonging exclusively to a verified customer
 */
export async function getCustomerCoinOrdersFromFirestore(playerId: string): Promise<SharedCoinOrder[]> {
  try {
    const q = query(collection(serverDb, 'coinOrders'), where('playerId', '==', playerId));
    const snap = await getDocs(q);
    const orders: SharedCoinOrder[] = [];
    snap.forEach((d) => {
      orders.push(d.data() as SharedCoinOrder);
    });
    // Sort descending by orderDate
    orders.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
    return orders;
  } catch (err) {
    console.error('[Firebase] Failed to fetch customer orders:', err);
    return [];
  }
}

/**
 * Registers an authenticated player for a tournament
 */
export async function registerPlayerForTournamentInFirestore(
  tournamentId: string,
  registration: {
    playerId: string;
    playerName: string;
    username: string;
    teamName?: string;
    avatar?: string;
  }
): Promise<{ success: boolean; registrationId?: string; error?: string }> {
  try {
    const tournRef = doc(serverDb, 'tournaments', tournamentId);
    const snap = await getDoc(tournRef);
    if (!snap.exists()) {
      return { success: false, error: 'Tournament not found' };
    }

    const data = snap.data();
    const existing = data.registrations || [];

    // Check if already registered
    if (existing.some((r: any) => r.playerId === registration.playerId)) {
      return { success: true, registrationId: existing.find((r: any) => r.playerId === registration.playerId)?.id };
    }

    const regId = `reg-${Date.now()}`;
    const newReg = {
      id: regId,
      tournamentId,
      playerId: registration.playerId,
      playerName: registration.playerName,
      username: registration.username,
      teamName: registration.teamName || 'Apex Contender',
      country: 'Global',
      avatar: registration.avatar || '',
      status: 'Pending',
      registeredAt: new Date().toISOString().slice(0, 10),
    };

    await updateDoc(tournRef, {
      registrations: arrayUnion(newReg),
      registeredPlayersCount: (data.registeredPlayersCount || 0) + 1,
    });

    return { success: true, registrationId: regId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
