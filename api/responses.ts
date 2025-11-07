import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOpenRouterRequest } from '../src/handlers/openrouter.js';
import type { OpenRouterRequest } from '../src/types/openrouter.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const payload = parseRequestBody(req) as OpenRouterRequest;
    const openRouterResponse = await handleOpenRouterRequest(payload, {
      requestId: (req.headers['x-request-id'] as string | undefined) ?? req.headers['cf-ray']?.toString()
    });

    res.status(200).json(openRouterResponse);
  } catch (error) {
    const message = (error as Error).message ?? 'Unknown error';
    res.status(400).json({
      error: 'Bad Request',
      message
    });
  }
}

function parseRequestBody(req: VercelRequest) {
  if (typeof req.body === 'string') {
    return JSON.parse(req.body);
  }

  if (Buffer.isBuffer(req.body)) {
    return JSON.parse(req.body.toString('utf-8'));
  }

  return req.body ?? {};
}
