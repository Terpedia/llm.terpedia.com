import { randomUUID } from 'crypto';
import { assertEnv, config } from '../env.js';
import { executeSparqlQuery } from '../integrations/sparql.js';
import { fetchPubMedContext } from '../integrations/pubmed.js';
import { invokeMcpTool } from '../integrations/mcp.js';
import type { HandlerContext, OpenRouterRequest, OpenRouterResponse } from '../types/openrouter.js';

interface MetadataPayload {
  sparqlQuery?: string;
  pubmedQuery?: string;
  mcpTool?: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export async function handleOpenRouterRequest(
  payload: OpenRouterRequest,
  context: HandlerContext = {}
): Promise<OpenRouterResponse> {
  assertEnv();

  if (payload.stream) {
    throw new Error('Streaming responses are not yet supported.');
  }

  const created = Math.floor(Date.now() / 1000);
  const responseId = `or_${created}_${randomUUID()}`;
  const metadata = (payload.metadata ?? {}) as MetadataPayload;

  let sparqlPreview: string | undefined;
  if (metadata.sparqlQuery) {
    try {
      const sparqlResult = await executeSparqlQuery(metadata.sparqlQuery);
      const headVars = 'vars' in sparqlResult.head ? sparqlResult.head.vars : [];
      sparqlPreview = JSON.stringify({
        vars: headVars,
        sample: 'bindings' in sparqlResult.results ? sparqlResult.results.bindings.slice(0, 2) : sparqlResult.results
      });
    } catch (error) {
        sparqlPreview = `error: ${(error as Error).message}`;
    }
  }

  let pubmedPreview: string | undefined;
  if (metadata.pubmedQuery) {
    try {
      const pubmedItems = await fetchPubMedContext(metadata.pubmedQuery);
      pubmedPreview = JSON.stringify(pubmedItems.slice(0, 2));
    } catch (error) {
        pubmedPreview = `error: ${(error as Error).message}`;
    }
  }

  let mcpPreview: string | undefined;
  if (metadata.mcpTool) {
    try {
      const result = await invokeMcpTool(metadata.mcpTool);
      mcpPreview = JSON.stringify(result);
    } catch (error) {
        mcpPreview = `error: ${(error as Error).message}`;
    }
  }

  const assistantContent = [
    'Terpedia LLM endpoint placeholder response.',
    'Integrations status:',
    `- SPARQL: ${sparqlPreview ?? 'pending configuration'}`,
    `- PubMed RAG: ${pubmedPreview ?? 'pending configuration'}`,
    `- MCP: ${mcpPreview ?? 'pending configuration'}`
  ].join('\n');

  return {
    id: responseId,
    object: 'chat.completion',
    created,
    model: payload.model ?? config.defaultModel,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: assistantContent
        },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  };
}
