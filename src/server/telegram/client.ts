import 'server-only';
import { env } from '@/server/config/env';

const TIMEOUT_MS = 8_000;

export type TelegramResult = { ok: true } | { ok: false; error: string };

/**
 * Sends one plain-text message to the driver's Telegram chat.
 * Errors are returned as short codes only: the request URL contains the bot token,
 * so it must never be logged.
 */
export async function sendTelegram(text: string): Promise<TelegramResult> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return { ok: false, error: 'not_configured' };
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, error: `http_${response.status}` };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.name : 'send_failed' };
  }
}