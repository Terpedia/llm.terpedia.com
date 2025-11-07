import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    name: 'Terpedia LLM Endpoint',
    status: 'ok',
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev',
    description: 'OpenRouter-compatible interface for Terpedia LLM services.'
  });
}
