import fs from 'fs';
import path from 'path';
import type { PlayerProfile, TelegramUser } from '../src/types/player.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const LOCAL_STORE_FILE = path.join(DATA_DIR, 'players.json');
const DEV_PREVIEW_FILE = path.join(DATA_DIR, 'dev-preview.json');

// Isolated in-memory store for Dev Preview mode - 100% independent of Vercel Blob
const devPreviewStore: Map<string, PlayerProfile> = new Map();

// In-memory cache for local developer sandbox
let localSandboxCache: Map<string, PlayerProfile> = new Map();
let isInitialized = false;

/**
 * Checks whether Vercel Blob is configured via its environment token
 */
export function isVercelBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Checks whether the app is executing in a production environment
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
}

function ensureLocalSandbox(): void {
  if (isInitialized) return;
  if (isProductionEnvironment()) {
    isInitialized = true;
    return;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const data = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      localSandboxCache = new Map(Object.entries(parsed));
    }
    if (fs.existsSync(DEV_PREVIEW_FILE)) {
      const data = fs.readFileSync(DEV_PREVIEW_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      for (const [k, v] of Object.entries(parsed)) {
        devPreviewStore.set(k, v as PlayerProfile);
      }
    }
    isInitialized = true;
  } catch (err) {
    console.error('[Storage] Error initializing local dev sandbox:', err);
    isInitialized = true;
  }
}

function persistLocalSandbox(): void {
  if (isProductionEnvironment()) return; // Never use fake permanent storage in production

  try {
    ensureLocalSandbox();
    const sandboxObj = Object.fromEntries(localSandboxCache.entries());
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(sandboxObj, null, 2), 'utf-8');

    const devObj = Object.fromEntries(devPreviewStore.entries());
    fs.writeFileSync(DEV_PREVIEW_FILE, JSON.stringify(devObj, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Failed to persist local dev sandbox:', err);
  }
}

// -------------------------------------------------------------
// DEV PREVIEW STORAGE (Independent of Vercel Blob)
// -------------------------------------------------------------

/**
 * Retrieves or initializes a player profile specifically for Dev Preview Mode.
 * This runs completely independently of Vercel Blob storage.
 */
export async function getOrCreateDevMockPlayer(
  tgUser: TelegramUser
): Promise<{ player: PlayerProfile; isNew: boolean }> {
  ensureLocalSandbox();
  const key = `tg_${tgUser.id}`;
  const now = new Date().toISOString();

  const existing = devPreviewStore.get(key);
  if (existing) {
    const updated: PlayerProfile = {
      ...existing,
      firstName: tgUser.first_name || existing.firstName,
      lastName: tgUser.last_name !== undefined ? tgUser.last_name : existing.lastName,
      username: tgUser.username !== undefined ? tgUser.username : existing.username,
      photoUrl: tgUser.photo_url || existing.photoUrl,
      lastActiveAt: now,
      isDevPreview: true,
    };
    devPreviewStore.set(key, updated);
    persistLocalSandbox();
    return { player: updated, isNew: false };
  }

  // Create clean Dev Preview player
  const tag = tgUser.username
    ? `Apex_${tgUser.username.replace(/[^a-zA-Z0-9_]/g, '')}`
    : `Apex_${tgUser.first_name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'Player'}`;

  // Configure role and rank defaults based on username/id
  const isPro = tgUser.username?.includes('viperx') || tgUser.id === 98452101;
  const isStreamer = tgUser.username?.includes('kage') || tgUser.id === 71203948;

  const newPlayer: PlayerProfile = {
    id: key,
    telegramId: tgUser.id,
    firstName: tgUser.first_name,
    lastName: tgUser.last_name,
    username: tgUser.username,
    photoUrl: tgUser.photo_url,
    isPremium: tgUser.is_premium,

    apexGamerTag: tag,
    konamiId: isPro ? 'VIPER-9921' : isStreamer ? 'KAGE-7734' : undefined,
    coinsBalance: isPro ? 2130 : isStreamer ? 4500 : 250,
    rankTitle: isPro ? 'Apex Division 1 Elite' : isStreamer ? 'Apex Master Division' : 'Apex Challenger',
    reputationScore: 100,
    matchesPlayed: isPro ? 142 : isStreamer ? 310 : 0,
    wins: isPro ? 118 : isStreamer ? 245 : 0,
    losses: isPro ? 24 : isStreamer ? 65 : 0,
    role: isPro || isStreamer ? 'verified_creator' : 'player',

    createdAt: now,
    lastActiveAt: now,
    isDevPreview: true,
  };

  devPreviewStore.set(key, newPlayer);
  persistLocalSandbox();
  return { player: newPlayer, isNew: true };
}

// -------------------------------------------------------------
// REAL PLAYER STORAGE (Vercel Blob Integration)
// -------------------------------------------------------------

/**
 * Retrieves a real player profile by Telegram User ID.
 * - If dev preview, loads from independent dev store.
 * - If real player in Vercel Blob environment, fetches from Vercel Blob.
 * - In production without Blob, does NOT return fake data.
 */
export async function getPlayerByTelegramId(telegramId: number): Promise<PlayerProfile | null> {
  const key = `tg_${telegramId}`;

  // 1. Check Dev Preview Store first (instant & decoupled)
  if (devPreviewStore.has(key)) {
    return devPreviewStore.get(key) || null;
  }

  // 2. Real Player lookup via Vercel Blob
  if (isVercelBlobConfigured()) {
    const pathname = `players/tg_${telegramId}.json`;
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: pathname, limit: 1 });
      const matched = blobs.find((b) => b.pathname === pathname) || blobs[0];

      if (matched) {
        const response = await fetch(matched.url, { cache: 'no-store' });
        if (response.ok) {
          const profile = (await response.json()) as PlayerProfile;
          return profile;
        }
      }
      return null;
    } catch (err) {
      console.warn(`[Storage] Vercel Blob read error for ${pathname}:`, err);
      return null;
    }
  }

  // 3. Fallback for local development sandbox only
  if (!isProductionEnvironment()) {
    ensureLocalSandbox();
    return localSandboxCache.get(key) || null;
  }

  // 4. In production without Vercel Blob configured:
  // "Do not use fake permanent storage in production."
  return null;
}

/**
 * Saves or updates a player record.
 * - If dev preview, writes to devPreviewStore without touching Vercel Blob.
 * - If real player and Vercel Blob is configured, persists to Vercel Blob.
 * - In production without Vercel Blob, fails explicitly rather than faking permanent storage.
 */
export async function savePlayer(player: PlayerProfile): Promise<void> {
  const key = `tg_${player.telegramId}`;

  // 1. Dev Preview Player: Save to independent in-memory store
  if (player.isDevPreview) {
    devPreviewStore.set(key, player);
    persistLocalSandbox();
    return;
  }

  // 2. Real Player with Vercel Blob configured
  if (isVercelBlobConfigured()) {
    const pathname = `players/tg_${player.telegramId}.json`;
    try {
      const { put } = await import('@vercel/blob');
      await put(pathname, JSON.stringify(player, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      return;
    } catch (err) {
      console.error(`[Storage] Vercel Blob write error for ${pathname}:`, err);
      throw err;
    }
  }

  // 3. Local Developer Sandbox (non-production only)
  if (!isProductionEnvironment()) {
    ensureLocalSandbox();
    localSandboxCache.set(key, player);
    persistLocalSandbox();
    return;
  }

  // 4. Production without Vercel Blob configured:
  // Do NOT write to fake permanent storage in production.
  throw new Error(
    'Cannot persist real player in production: BLOB_READ_WRITE_TOKEN is missing. Please configure Vercel Blob in your Vercel Dashboard.'
  );
}

/**
 * Automatically creates or retrieves an Apex Player account.
 * For Dev Preview: uses getOrCreateDevMockPlayer.
 * For Real Telegram Users: uses Vercel Blob.
 */
export async function getOrCreatePlayer(
  tgUser: TelegramUser,
  isDevPreview = false
): Promise<{ player: PlayerProfile; isNew: boolean }> {
  if (isDevPreview) {
    return getOrCreateDevMockPlayer(tgUser);
  }

  // Real player account handling
  const existing = await getPlayerByTelegramId(tgUser.id);
  const now = new Date().toISOString();

  if (existing) {
    const updated: PlayerProfile = {
      ...existing,
      firstName: tgUser.first_name || existing.firstName,
      lastName: tgUser.last_name !== undefined ? tgUser.last_name : existing.lastName,
      username: tgUser.username !== undefined ? tgUser.username : existing.username,
      photoUrl: tgUser.photo_url || existing.photoUrl,
      isPremium: tgUser.is_premium ?? existing.isPremium,
      lastActiveAt: now,
      isDevPreview: false,
    };

    await savePlayer(updated);
    return { player: updated, isNew: false };
  }

  // Create new real Player Profile
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

    apexGamerTag: initialGamerTag,
    konamiId: undefined,
    coinsBalance: 250, // 250 welcome bonus coins
    rankTitle: 'Apex Challenger',
    reputationScore: 100,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    role: 'player',

    createdAt: now,
    lastActiveAt: now,
    isDevPreview: false,
  };

  await savePlayer(newPlayer);
  return { player: newPlayer, isNew: true };
}
