import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { authenticateTelegramUser, getCurrentPlayer } from './server/authService.ts';
import { savePlayer } from './server/storage.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Routes
app.post('/api/auth', async (req: Request, res: Response) => {
  try {
    const { initData, devMockUser, isDevMode } = req.body || {};
    const result = await authenticateTelegramUser({
      initData,
      devMockUser,
      isDevMode,
    });

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

app.get('/api/player/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const player = await getCurrentPlayer(token);
    if (!player) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
    }

    return res.status(200).json({ success: true, player });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

app.patch('/api/player/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const player = await getCurrentPlayer(token);
    if (!player) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
    }

    const updates = req.body || {};
    if (updates.apexGamerTag && typeof updates.apexGamerTag === 'string') {
      player.apexGamerTag = updates.apexGamerTag.trim().slice(0, 30);
    }
    if (updates.konamiId && typeof updates.konamiId === 'string') {
      player.konamiId = updates.konamiId.trim().slice(0, 30);
    }

    player.lastActiveAt = new Date().toISOString();
    await savePlayer(player);

    return res.status(200).json({ success: true, player });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

app.post('/api/orders/create', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const player = await getCurrentPlayer(token);
    if (!player) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }

    const { efootballId, packageName, packageCoins, amountUsd, paymentMethod } = req.body || {};
    if (!efootballId) {
      return res.status(400).json({ success: false, error: 'Missing efootballId' });
    }

    const { createCoinOrderInFirestore } = await import('./server/firebaseDb.ts');
    const order = await createCoinOrderInFirestore({
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName || ''}`.trim() || player.apexGamerTag,
      playerUsername: player.username || `user_${player.telegramId}`,
      efootballId: efootballId.trim(),
      packageName: packageName || 'eFootball Coins Pack',
      packageCoins: Number(packageCoins),
      amountUsd: Number(amountUsd) || 9.99,
      paymentMethod: paymentMethod || 'Card',
    });

    return res.status(201).json({ success: true, order });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

app.get('/api/orders/my-orders', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const player = await getCurrentPlayer(token);
    if (!player) {
      return res.status(401).json({ success: false, error: 'Invalid session' });
    }

    const { getCustomerCoinOrdersFromFirestore } = await import('./server/firebaseDb.ts');
    const orders = await getCustomerCoinOrdersFromFirestore(player.id);
    return res.status(200).json({ success: true, orders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

app.post('/api/tournaments/register', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const player = await getCurrentPlayer(token);
    if (!player) {
      return res.status(401).json({ success: false, error: 'Invalid session' });
    }

    const { tournamentId, teamName } = req.body || {};
    if (!tournamentId) {
      return res.status(400).json({ success: false, error: 'Missing tournamentId' });
    }

    const { registerPlayerForTournamentInFirestore } = await import('./server/firebaseDb.ts');
    const result = await registerPlayerForTournamentInFirestore(tournamentId, {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName || ''}`.trim() || player.apexGamerTag,
      username: player.username || `user_${player.telegramId}`,
      teamName: teamName || 'Apex Contender',
      avatar: player.photoUrl,
    });

    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    firebaseConfigured: true,
    firebaseProjectId: 'gen-lang-client-0726551553',
    firestoreDatabaseId: 'ai-studio-apexefootballadm-4a575541-f393-4a25-884c-ac75fb539486',
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (!isProd) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Apex eFootball] Server listening on http://0.0.0.0:${PORT} (env: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
