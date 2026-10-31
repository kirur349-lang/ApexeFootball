import { authenticateTelegramUser } from '../../server/authService';

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  headers: Record<string, string | undefined>;
}

export const handler = async (event: NetlifyEvent) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const result = await authenticateTelegramUser({
      initData: payload.initData,
      devMockUser: payload.devMockUser,
      isDevMode: payload.isDevMode,
    });

    return {
      statusCode: result.success ? 200 : 401,
      headers,
      body: JSON.stringify(result),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: message }),
    };
  }
};
