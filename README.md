# Terpedia LLM Endpoint

Serverless API deployed on Vercel that exposes an [OpenRouter](https://openrouter.ai/) compatible `/responses` endpoint.  
The handler enriches prompts with Terpedia knowledge sources via SPARQL, PubMed RAG, and MCP integrations before producing a reply.

## Project Layout

- `api/info.ts` – health check for monitoring and Vercel previews.
- `api/responses.ts` – OpenRouter-compatible entry point.
- `src/env.ts` – environment variable contract.
- `src/handlers/openrouter.ts` – orchestration logic for context gathering and response generation.
- `src/integrations/` – connectors for SPARQL, PubMed, and MCP tooling.

## Environment Variables

Set these in Vercel (or a `.env.local` file for local development):

| Variable | Required | Description |
| --- | --- | --- |
| `TERPDIA_DEFAULT_MODEL` | optional | Default model name advertised to OpenRouter clients. |
| `SPARQL_ENDPOINT` | required | SPARQL endpoint URL for `kb.terpedia.com`. Defaults to `https://kb.terpedia.com/sparql`. |
| `PUBMED_AGENT_ENDPOINT` | optional | HTTP endpoint for Terpedia's PubMed RAG service. |
| `MCP_CONFIG_PATH` | optional | Path or URL to MCP client configuration file. |
| `OPENROUTER_API_KEY` | managed outside repo | Injected into Vercel via the OpenRouter provisioning API (rotated automatically, never committed). |
| `OPENROUTER_REFERER` | optional | Referer header required by OpenRouter rate limiting (if applicable). |
| `OPENROUTER_APP_NAME` | optional | Friendly name shared with OpenRouter. |

## Local Development

```bash
npm install
npm run dev
```

The development server proxies Vercel functions. Test the API with:

```bash
curl -X POST http://localhost:3000/responses \
  -H "Content-Type: application/json" \
  -d '{"model":"terpedia/primary","messages":[{"role":"user","content":"ping"}]}'
```

## Deploying to Vercel

1. Create a new Vercel project and link this repository (monorepo note: specify `llm.terpedia.com` as the root).
2. Set **Build & Development Settings** → Framework preset: `Other`.
3. Add environment variables listed above (including `OPENROUTER_API_KEY` directly in Vercel, not committed).
4. Deploy. Vercel provisions a `.vercel.app` preview domain.

## Custom Domain `llm.terpedia.com`

1. In Vercel project dashboard, add `llm.terpedia.com` under **Domains**.  
   Vercel exposes a target domain similar to `cname.vercel-dns.com`.
2. In AWS Route 53:
   - Open hosted zone for `terpedia.com`.
   - Create a `CNAME` record with:
     - **Name:** `llm`
     - **Value:** provided Vercel target.
3. Wait for DNS propagation and verify HTTPS.  
   Vercel auto-manages the certificate once the DNS change resolves.

## Next Integrations

- Replace MCP stub with a real client using Terpedia's MCP configuration.
- Add caching and request tracing for SPARQL and PubMed connectors.
- Implement streaming responses if/when OpenRouter streaming is needed.
