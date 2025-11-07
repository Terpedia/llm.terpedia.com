export interface ServiceConfig {
  openRouterKey?: string;
  openRouterReferer?: string;
  openRouterAppName?: string;
  defaultModel: string;
  sparqlEndpoint: string;
  pubmedEndpoint?: string;
  mcpConfigPath?: string;
}

export const config: ServiceConfig = {
  openRouterKey: process.env.OPENROUTER_API_KEY,
  openRouterReferer: process.env.OPENROUTER_REFERER,
  openRouterAppName: process.env.OPENROUTER_APP_NAME ?? 'Terapedia LLM Endpoint',
  defaultModel: process.env.TERPDIA_DEFAULT_MODEL ?? 'terpedia/primary',
  sparqlEndpoint: process.env.SPARQL_ENDPOINT ?? 'https://kb.terpedia.com/sparql',
  pubmedEndpoint: process.env.PUBMED_AGENT_ENDPOINT,
  mcpConfigPath: process.env.MCP_CONFIG_PATH
};

export function assertEnv() {
  if (!config.openRouterKey) {
    console.warn('OPENROUTER_API_KEY is not set; outbound OpenRouter calls will fail.');
  }

  if (!config.pubmedEndpoint) {
    console.warn('PUBMED_AGENT_ENDPOINT is not set; PubMed RAG integration will be disabled.');
  }

  if (!config.mcpConfigPath) {
    console.warn('MCP_CONFIG_PATH is not set; MCP tool discovery will be limited.');
  }
}
