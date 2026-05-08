import type { AIPromptContext } from '../feature/ai/types'

/// Default system prompt used by both `createOpenAIProvider` and
/// `createAnthropicProvider`. Constrains the model to emit raw markdown
/// suitable for the streaming + diff plugins to apply directly.
export const DEFAULT_SYSTEM_PROMPT = `You are a writing assistant embedded in a markdown editor.

Rules:
- Output markdown only. Never wrap your output in code fences (e.g. \`\`\`markdown ... \`\`\`).
- Never include preambles, explanations, or sign-offs — output only the edited or generated content itself.
- Preserve the original markdown structure (headings, lists, links, code blocks) unless the instruction explicitly asks to change it.
- If a <selection> is provided, return only the replacement for that selection — do not repeat surrounding document context.
- If no <selection> is provided, return content to insert at the cursor that flows with the surrounding document.`

/// Default user-message body. Wraps document, selection, and
/// instruction in XML-ish tags so the model can tell them apart.
export function buildDefaultUserMessage(context: AIPromptContext): string {
  const parts: string[] = [`<document>\n${context.document}\n</document>`]
  if (context.selection) {
    parts.push(`<selection>\n${context.selection}\n</selection>`)
  }
  parts.push(`<instruction>\n${context.instruction}\n</instruction>`)
  return parts.join('\n\n')
}

/// Common config shared by every built-in provider.
export interface BaseProviderConfig {
  /// API key used when calling the provider directly. Omit when routing
  /// through your own backend (set `baseURL` + `headers` instead).
  apiKey?: string

  /// Override the API base URL. Defaults to the provider's official
  /// endpoint. Point this at your own backend proxy in production
  /// deployments so the API key never reaches the browser.
  baseURL?: string

  /// Extra headers merged into every request. Use this to inject your
  /// app's session token when proxying through your backend.
  headers?: Record<string, string>

  /// Model identifier (e.g. `gpt-4o-mini`, `claude-sonnet-4-5`).
  model: string

  /// System prompt. Defaults to a markdown-output-only prompt that
  /// works well with the streaming + diff plugins. Pass a custom string
  /// to fully replace it; pass `null` to send no system prompt at all.
  systemPrompt?: string | null

  /// Required when calling the provider directly from a browser with an
  /// `apiKey`. Setting this to `true` is an explicit acknowledgement
  /// that your API key will be visible to anyone inspecting network
  /// traffic. Recommended only for desktop apps, personal tools, or
  /// BYOK setups where each user supplies their own key. Routing
  /// through a backend (via `baseURL` + `headers`) does not need this.
  dangerouslyAllowBrowser?: boolean
}

const isBrowser = typeof window !== 'undefined' && window.document !== undefined

/// Throws when `apiKey` is set in a browser environment without
/// explicit `dangerouslyAllowBrowser` opt-in. Routing through a backend
/// proxy (no `apiKey`, with `baseURL` + `headers`) bypasses this check
/// because the key never reaches the browser.
export function assertBrowserSafe(
  config: BaseProviderConfig,
  providerName: string
): void {
  if (!config.apiKey) return
  if (!isBrowser) return
  if (config.dangerouslyAllowBrowser) return
  throw new Error(
    `[${providerName}] Refusing to send your API key from a browser. ` +
      `Direct browser → provider calls expose the key to every visitor. ` +
      `Either route through your backend (set \`baseURL\` + \`headers\` ` +
      `and omit \`apiKey\`), or set \`dangerouslyAllowBrowser: true\` to ` +
      `acknowledge the risk (recommended only for desktop apps or BYOK setups).`
  )
}

/// Resolve the system prompt. `undefined` → default, `null` → omitted,
/// string → used as-is.
export function resolveSystemPrompt(
  systemPrompt: string | null | undefined
): string | null {
  if (systemPrompt === null) return null
  return systemPrompt ?? DEFAULT_SYSTEM_PROMPT
}

/// Parse an SSE stream from `response.body`. Yields the payload after
/// `data: ` for each event; ignores `event:`, `id:`, `retry:`, and
/// comment lines. Stops cleanly when the signal aborts or the stream
/// ends. Both OpenAI and Anthropic streaming endpoints use this format.
export async function* parseSSE(
  response: Response,
  signal: AbortSignal
): AsyncGenerator<string> {
  if (!response.body) return
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  try {
    while (true) {
      if (signal.aborted) return
      const { done, value } = await reader.read()
      if (signal.aborted) return
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let nl: number
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const raw = buffer.slice(0, nl)
        buffer = buffer.slice(nl + 1)
        const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw
        if (line.startsWith('data: ')) {
          yield line.slice(6)
        } else if (line.startsWith('data:')) {
          yield line.slice(5)
        }
      }
    }
    // Flush any trailing data line that wasn't newline-terminated.
    const tail = buffer.trim()
    if (tail.startsWith('data: ')) yield tail.slice(6)
    else if (tail.startsWith('data:')) yield tail.slice(5)
  } finally {
    reader.releaseLock()
  }
}

/// Throw a useful error when the API responds with a non-2xx status.
/// Reads the body once for diagnostics.
export async function readErrorBody(
  response: Response,
  providerName: string
): Promise<Error> {
  let body = ''
  try {
    body = await response.text()
  } catch {
    // ignore — we still want to throw a status-only error
  }
  return new Error(
    `[${providerName}] Request failed with status ${response.status}` +
      (body ? `: ${body.slice(0, 500)}` : '')
  )
}
