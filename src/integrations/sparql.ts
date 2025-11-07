import fetch from 'node-fetch';
import { config } from '../env.js';

export interface SparqlResult {
  head: { vars: string[] };
  results: { bindings: Record<string, { type: string; value: string }> } | { boolean: boolean };
}

export async function executeSparqlQuery(query: string, signal?: AbortSignal): Promise<SparqlResult> {
  const endpoint = config.sparqlEndpoint;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      Accept: 'application/sparql-results+json'
    },
    body: query,
    signal
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SPARQL query failed with ${response.status}: ${text}`);
  }

  return (await response.json()) as SparqlResult;
}
