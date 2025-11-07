export interface McpToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface McpToolResult {
  name: string;
  output: unknown;
}

export async function invokeMcpTool(call: McpToolCall): Promise<McpToolResult> {
  // TODO: Wire up MCP SDK integration once configuration is available.
  console.warn('MCP invocation not implemented yet. Requested tool:', call.name);
  return {
    name: call.name,
    output: {
      status: 'not_implemented',
      detail: 'MCP integration pending.'
    }
  };
}
