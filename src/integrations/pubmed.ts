import fetch from 'node-fetch';
import { config } from '../env.js';

export interface PubMedContext {
  id: string;
  title: string;
  summary: string;
  url?: string;
}

export async function fetchPubMedContext(query: string, signal?: AbortSignal): Promise<PubMedContext[]> {
  if (!config.pubmedEndpoint) {
    console.warn('PubMed endpoint not configured; returning empty context.');
    return [];
  }

  const response = await fetch(config.pubmedEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK: 5 }),
    signal
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PubMed RAG request failed with ${response.status}: ${text}`);
  }

  const payload = (await response.json()) as { items?: PubMedContext[] };
  return payload.items ?? [];
}
