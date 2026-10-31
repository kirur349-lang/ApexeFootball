import fs from 'fs';
import path from 'path';
import type { PlayerProfile, TelegramUser } from '../src/types/player.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const LOCAL_STORE_FILE = path.join(DATA_DIR, 'players.json');
const DEV_PREVIEW_FILE = path.join(DATA_DIR, 'dev-preview.json');

// Isolated in-memory store for Dev Preview mode - 100% independent of Vercel Blob
const devPreviewStore: Map<string, PlayerProfile> = new Map();

// In-memory store for authenticated Real Telegram players while Vercel Blob is pending setup
// This ensures the application NEVER blocks the homepage when BLOB_READ_WRITE_TOKEN is not yet attached
const sessionRealPlayerStore: Map<string, PlayerProfile> = new Map();

// In-memory cache for local developer sandbox
let localSandboxCache: Map<string, PlayerProfile> = new Map();
let isInitialized = false;

/**
 * Checks whether Vercel Blob is configured via its environment token
 */
export function isVercelBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN.trim());
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
  if (isProductionEnvironment()) return; // Never write to disk in serverless production

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
      isBlobPending: false,
    };
    devPreviewStore.set(key, updated);
    persistLocalSandbox();
    return { player: updated, isNew: false };
  }

  // Create clean Dev Preview player
  const tag = tgUser.username
    ? `Apex_${tgUser.username.replace(/[^a-zA-Z0-9_]/g, '')}`
    : `Apex_${tgUser.first_name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'Player'}`;

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
    isBlobPending: false,
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
 * - If Vercel Blob is not yet attached, retrieves from authenticated session memory.
 */
export async function getPlayerByTelegramId(telegramId: number): Promise<PlayerProfile | null> {
  const key = `tg_${telegramId}`;

  // 1. Check Dev Preview Store
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
          profile.isBlobPending = false;
          return profile;
        }
      }
    } catch (err) {
      console.warn(`[Storage] Vercel Blob read notice for ${pathname}:`, err);
    }
  }

  // 3. Fallback to active session player memory (for real authenticated users while Blob is pending)
  if (sessionRealPlayerStore.has(key)) {
    const profile = sessionRealPlayerStore.get(key) || null;
    if (profile) {
      profile.isBlobPending = !isVercelBlobConfigured();
    }
    return profile;
  }

  // 4. Fallback for local development sandbox
  if (!isProductionEnvironment()) {
    ensureLocalSandbox();
    return localSandboxCache.get(key) || null;
  }

  return null;
}

/**
 * Saves or updates a player record.
 * - If dev preview, writes to devPreviewStore without touching Vercel Blob.
 * - If real player and Vercel Blob is configured, persists to Vercel Blob.
 * - If Vercel Blob is not yet attached, holds safely in session memory without throwing errors.
 */
export async function savePlayer(player: PlayerProfile): Promise<void> {
  const key = `tg_${player.telegramId}`;

  // 1. Dev Preview Player
  if (player.isDevPreview) {
    devPreviewStore.set(key, player);
    persistLocalSandbox();
    return;
  }

  // Always update the active session store for fast access
  sessionRealPlayerStore.set(key, player);

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
      // Keep in session memory so user isn't disrupted
    }
  }

  // 3. Local Developer Sandbox (non-production)
  if (!isProductionEnvironment()) {
    ensureLocalSandbox();
    localSandboxCache.set(key, player);
    persistLocalSandbox();
    return;
  }
}

/**
 * Automatically creates or retrieves an Apex Player account.
 * For Dev Preview: uses getOrCreateDevMockPlayer.
 * For Real Telegram Users: uses Vercel Blob if configured, or session storage if pending.
 */
export async function getOrCreatePlayer(
  tgUser: TelegramUser,
  isDevPreview = false
): Promise<{ player: PlayerProfile; isNew: boolean }> {
  if (isDevPreview) {
    return getOrCreateDevMockPlayer(tgUser);
  }

  const existing = await getPlayerByTelegramId(tgUser.id);
  const now = new Date().toISOString();
  const blobPending = !isVercelBlobConfigured();

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
      isBlobPending: blobPending,
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
    isBlobPending: blobPending,
  };

  await savePlayer(newPlayer);
  return { player: newPlayer, isNew: true };
}
