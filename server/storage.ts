import fs from 'fs';
import path from 'path';
import type { PlayerProfile, TelegramUser } from '../src/types/player.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const LOCAL_STORE_FILE = path.join(DATA_DIR, 'players.json');

// In-memory cache for fast access
let memoryCache: Map<string, PlayerProfile> = new Map();
let isInitialized = false;

// Check if running in real Netlify Blobs environment
function isNetlifyBlobsAvailable(): boolean {
  return (
    typeof process.env.NETLIFY !== 'undefined' ||
    typeof process.env.NETLIFY_BLOBS_CONTEXT !== 'undefined' ||
    Boolean(process.env.NETLIFY_AUTH_TOKEN && process.env.NETLIFY_SITE_ID)
  );
}

async function getNetlifyBlobStore() {
  try {
    const { getStore } = await import('@netlify/blobs');
    return getStore('apex-players');
  } catch (err) {
    console.warn('[Storage] Netlify Blobs import fallback to local store:', err);
    return null;
  }
}

function ensureLocalStore(): void {
  if (isInitialized) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      memoryCache = new Map(Object.entries(parsed));
    }
    isInitialized = true;
  } catch (err) {
    console.error('[Storage] Error initializing local player store:', err);
    isInitialized = true;
  }
}

function persistLocalStore(): void {
  try {
    ensureLocalStore();
    const obj = Object.fromEntries(memoryCache.entries());
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Failed to persist local player store to disk:', err);
  }
}

/**
 * Retrieves a player profile by Telegram User ID
 */
export async function getPlayerByTelegramId(telegramId: number): Promise<PlayerProfile | null> {
  const key = `tg_${telegramId}`;

  if (isNetlifyBlobsAvailable()) {
    try {
      const store = await getNetlifyBlobStore();
      if (store) {
        const data = await store.get(key, { type: 'json' });
        if (data) return data as PlayerProfile;
      }
    } catch (err) {
      console.warn(`[Storage] Netlify Blobs read error for key ${key}, checking fallback:`, err);
    }
  }

  ensureLocalStore();
  return memoryCache.get(key) || null;
}

/**
 * Saves or updates a player record in Netlify Blobs (or local persistent store)
 */
export async function savePlayer(player: PlayerProfile): Promise<void> {
  const key = `tg_${player.telegramId}`;

  // Update memory cache
  ensureLocalStore();
  memoryCache.set(key, player);
  persistLocalStore();

  if (isNetlifyBlobsAvailable()) {
    try {
      const store = await getNetlifyBlobStore();
      if (store) {
        await store.setJSON(key, player);
      }
    } catch (err) {
      console.warn(`[Storage] Netlify Blobs write error for key ${key}:`, err);
    }
  }
}

/**
 * Automatically creates or retrieves an Apex Player account.
 * If the user already exists:
 * - Updates lastActiveAt
 * - Updates Telegram details (first_name, last_name, username, photo_url)
 * - Preserves Apex-specific details (coins, gamerTag, konamiId, rankTitle, stats)
 * If new:
 * - Creates a fresh account with a 250 Coins welcome bonus and Challenger rank.
 */
export async function getOrCreatePlayer(
  tgUser: TelegramUser,
  isDevPreview = false
): Promise<{ player: PlayerProfile; isNew: boolean }> {
  const existing = await getPlayerByTelegramId(tgUser.id);
  const now = new Date().toISOString();

  if (existing) {
    // Update basic Telegram profile info without wiping Apex data
    const updated: PlayerProfile = {
      ...existing,
      firstName: tgUser.first_name || existing.firstName,
      lastName: tgUser.last_name !== undefined ? tgUser.last_name : existing.lastName,
      username: tgUser.username !== undefined ? tgUser.username : existing.username,
      photoUrl: tgUser.photo_url || existing.photoUrl,
      isPremium: tgUser.is_premium ?? existing.isPremium,
      lastActiveAt: now,
      isDevPreview: isDevPreview || existing.isDevPreview,
    };

    await savePlayer(updated);
    return { player: updated, isNew: false };
  }

  // Create new Player Profile
  const initialGamerTag = tgUser.username
    ? `Apex_${tgUser.username.replace(/[^a-zA-Z0-9_]/g, '')}`
    : `Apex_${tgUser.first_name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'Player'}`;

  const newPlayer: PlayerProfile = {
    id: `tg_${tgUser.id}`,
    telegramId: tgUser.id,
    firstName: tgUser.first_name,
    lastName: tgUser.last_name,
    username: tgUser.username,
    photoUrl: tgUser.photo_url,
    isPremium: tgUser.is_premium,

    // Apex Competitive Defaults
    apexGamerTag: initialGamerTag,
    konamiId: undefined,
    coinsBalance: 250, // Welcome bonus coins
    rankTitle: 'Apex Challenger',
    reputationScore: 100,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    role: 'player',

    createdAt: now,
    lastActiveAt: now,
    isDevPreview,
  };

  await savePlayer(newPlayer);
  return { player: newPlayer, isNew: true };
}
