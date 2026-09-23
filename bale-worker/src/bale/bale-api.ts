const BALE_API = 'https://tapi.bale.ai';

export interface BaleUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface BaleChat {
  id: number;
  type: string;
}

export interface BalePhotoSize {
  file_id: string;
}

export interface BaleVoice {
  file_id: string;
}

export interface BaleMessage {
  message_id: number;
  from?: BaleUser;
  chat: BaleChat;
  text?: string;
  photo?: BalePhotoSize[];
  voice?: BaleVoice;
}

export interface BaleUpdate {
  update_id: number;
  message?: BaleMessage;
  callback_query?: {
    id: string;
    from: BaleUser;
    data?: string;
    message?: { message_id: number; chat: BaleChat };
  };
}

function apiUrl(token: string, method: string): string {
  return `${BALE_API}/bot${token}/${method}`;
}

async function balePost(token: string, method: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch(apiUrl(token, method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function sendBaleMessage(
  token: string,
  chatId: number | string,
  text: string,
  replyMarkup?: object
): Promise<Response> {
  return balePost(token, 'sendMessage', {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
  });
}

export async function sendBalePhoto(
  token: string,
  chatId: number | string,
  photo: string,
  caption?: string
): Promise<Response> {
  return balePost(token, 'sendPhoto', {
    chat_id: chatId,
    photo,
    ...(caption ? { caption } : {}),
  });
}

export async function sendBaleVoice(
  token: string,
  chatId: number | string,
  voice: string,
  caption?: string
): Promise<Response> {
  return balePost(token, 'sendVoice', {
    chat_id: chatId,
    voice,
    ...(caption ? { caption } : {}),
  });
}

export async function proxyBaleFile(token: string, fileId: string): Promise<Response> {
  const fileResponse = await fetch(apiUrl(token, `getFile?file_id=${encodeURIComponent(fileId)}`));
  const fileData = await fileResponse.json<{ ok?: boolean; result?: { file_path?: string } }>().catch(() => null);
  if (!fileData?.ok || !fileData.result?.file_path) {
    return new Response(JSON.stringify({ error: 'File unavailable' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  const mediaResponse = await fetch(`https://tapi.bale.ai/file/bot${token}/${fileData.result.file_path}`);
  if (!mediaResponse.ok || !mediaResponse.body) {
    return new Response(JSON.stringify({ error: 'File unavailable' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(mediaResponse.body, {
    headers: {
      'Content-Type': mediaResponse.headers.get('Content-Type') || 'application/octet-stream',
      'Cache-Control': 'private, max-age=300',
    },
  });
}
export async function answerBaleCallbackQuery(
  token: string,
  callbackQueryId: string,
  text?: string
): Promise<Response> {
  return balePost(token, 'answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
  });
}

export async function setBaleWebhook(token: string, url: string): Promise<Response> {
  return balePost(token, 'setWebhook', { url });
}

export async function getBaleMe(token: string): Promise<Response> {
  return fetch(apiUrl(token, 'getMe'));
}

export function buildBaleMiniAppButton(url: string) {
  return {
    inline_keyboard: [[{ text: 'باز کنید', web_app: { url } }]],
  };
}
