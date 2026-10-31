# Apex eFootball — Telegram Mini App (Vercel Edition)

**Apex eFootball** is a competitive esports platform and community hub designed exclusively as a Telegram Mini App with an Apple-inspired glassmorphism interface.

- **Production Live URL:** [https://apexefootball.vercel.app](https://apexefootball.vercel.app)
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend:** Vercel Serverless Functions (`api/auth.ts`, `api/player/me.ts`, `api/health.ts`)
- **Persistent Storage:** Vercel Blob (`@vercel/blob`)
- **Authentication:** Telegram Mini App Cryptographic HMAC-SHA256 (`initData`)

---

## 1. System Architecture

```
Telegram Client (Mobile / Desktop)
   │
   ▼
[ window.Telegram.WebApp.initData ] (Cryptographically signed by Telegram)
   │
   ▼
POST /api/auth (Vercel Serverless Function)
   ├── 1. Validates HMAC-SHA256 signature using TELEGRAM_BOT_TOKEN
   ├── 2. Verifies auth_date timestamp (< 24h) to reject replay attacks
   ├── 3. Extracts verified Telegram User ID & profile metadata
   ├── 4. Provisions or retrieves player record from Vercel Blob (@vercel/blob)
   └── 5. Issues signed session token (HMAC-SHA256)
   │
   ▼
Authenticated Apex Player Account
   ├── Stored in Vercel Blob as `players/tg_<telegramId>.json`
   ├── Default 250 Welcome Coins bonus
   ├── Ranked as "Apex Challenger"
   └── Editable Gamer Tag & Konami ID
```

---

## 2. Vercel Deployment Guide

### Step 1: Push Code to GitHub / GitLab / Bitbucket
Ensure your repository contains:
- `api/` directory (Vercel Serverless Functions)
- `vercel.json` (Vercel routing and Telegram iframe security headers)
- `src/` & `server/` (React frontend & shared business logic)

### Step 2: Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." &rarr; "Project"**.
2. Select your repository and choose framework preset: **Vite**.
3. Build command: `npm run build`
4. Output directory: `dist`

### Step 3: Attach Vercel Blob Store (Storage)
1. In your Vercel Project dashboard, navigate to the **Storage** tab.
2. Click **Create Database** &rarr; select **Blob**.
3. Name your store (e.g., `apex-efootball-blobs`).
4. Click **Create & Attach**.
5. Vercel automatically injects the `BLOB_READ_WRITE_TOKEN` environment variable into your project environments.

### Step 4: Configure Environment Variables
In your Vercel Project Settings &rarr; **Environment Variables**, add:

| Variable | Value | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | `123456789:ABCdefGhI...` | **Required.** Secret bot token from @BotFather. Kept strictly server-side. |
| `APP_URL` | `https://apexefootball.vercel.app` | **Required.** Public URL of your deployed Mini App. |
| `BLOB_READ_WRITE_TOKEN` | *Auto-configured by Vercel* | Token for persistent player records storage in Vercel Blob. |

Click **Redeploy** to apply the environment variables.

---

## 3. Telegram Bot & Mini App Configuration

To connect your bot and allow users to launch the Mini App inside Telegram:

### 1. Create your Bot with @BotFather
- In Telegram, open **[@BotFather](https://t.me/BotFather)**.
- Send `/newbot`.
- Choose a name (e.g., `Apex eFootball`) and username (e.g., `Apexify_eFootball_bot`).
- Copy the provided **HTTP API Token** and paste it into Vercel as `TELEGRAM_BOT_TOKEN`.

### 2. Register the Mini App
- In @BotFather, send `/newapp`.
- Select your bot.
- Set title: `Apex eFootball`.
- Set short description: `Competitive eFootball tournaments, coins top-ups and live arena`.
- Upload a 640x360 banner image.
- When asked for the **Web App URL**, enter:
  ```
  https://apexefootball.vercel.app
  ```
- Choose a short name (e.g. `play` or `app`).
- BotFather will generate your direct link: `t.me/Apexify_eFootball_bot/app`.

### 3. Set the Bot Menu Button
- In @BotFather, send `/setmenubutton`.
- Select your bot.
- Set the button text: `Play Apex eFootball`.
- Enter the URL: `https://apexefootball.vercel.app`.

---

## 4. Security & Best Practices

1. **Zero-Password Authentication**: Players never need to create or remember a password. Identity is cryptographically established using Telegram's signed `initData`.
2. **Server-Side Verification**: The client's `initDataUnsafe` is never trusted for security. Only the server with `TELEGRAM_BOT_TOKEN` can verify the signature.
3. **Bot Token Privacy**: The bot token is never exposed to the client bundle or network payload.
4. **Replay Attack Defense**: `auth_date` is checked to ensure signatures older than 24 hours are rejected.
5. **No LocalStorage Dependency**: Permanent player records reside in Vercel Blob, surviving browser clearing and device switches.
6. **Iframe Security**: `vercel.json` permits embedding inside Telegram webviews (`web.telegram.org` and native clients) while preventing unauthorized clickjacking.

---

## 5. Development & Local Testing

In local development, the app runs via an Express server (`server.ts`) with Vite dev middleware:

```bash
# Install dependencies
npm install

# Start local full-stack server
npm run dev

# Run TypeScript checks
npm run lint

# Build for production
npm run build
```

When opened in a standard desktop browser or preview environment without Telegram, the built-in **Dev Preview Mode** activates automatically.

### Dev Preview Mode (Decoupled from Vercel Blob)
- **Zero Configuration Needed to Preview:** Dev Preview Mode runs completely independently of Vercel Blob. You do NOT need `BLOB_READ_WRITE_TOKEN` to test the homepage, interactive carousels, tournaments, coin purchase flow, or profile customizer.
- **Mock Player Presets:** Switch between realistic player profiles (**Alex** / Rookie, **ViperX** / Pro, **Kage** / Streamer) using the top Dev Preview banner.
- **Unblocked Experience:** The homepage and all views remain 100% accessible and responsive even before configuring Vercel Blob.

### Real Player Storage (Production Ready)
- When ready to accept real Telegram players, simply create and attach a **Vercel Blob** database under the **Storage** tab in your Vercel Dashboard.
- Once `BLOB_READ_WRITE_TOKEN` is attached, all real Telegram players authenticated via Telegram's signed `initData` are stored in Vercel Blob (`players/tg_<id>.json`).
- Fake permanent storage is strictly prohibited in production; accounts are persisted reliably in Vercel Blob once enabled.
