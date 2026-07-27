import type { AIPromptContext, AIProvider } from '../../feature/ai/types'

import {
  type BaseProviderConfig,
  assertBrowserSafe,
  buildDefaultUserMessage,
  parseSSE,
  readErrorBody,
  resolveSystemPrompt,
  stripTrailingSlashes,
} from '../shared'

const PROVIDER_NAME = 'milkdown/providers/openai'
const DEFAULT_BASE_URL = 'https://api.openai.com'

export interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenAIProviderConfig extends BaseProviderConfig {
  /// Customize the messages sent to `/v1/chat/completions`. The default
  /// builder produces a system message (when not disabled) followed by
  /// a structured user message containing the document, selection, and
  /// instruction. The defaults are passed in so callers can wrap them
  /// rather than re-deriving from scratch.
  buildMessages?: (
    context: AIPromptContext,
    defaults: { systemPrompt: string | null; userMessage: string }
  ) => OpenAIChatMessage[]

  /// Extra fields merged into the request body (e.g. `temperature`,
  /// `top_p`, `presence_penalty`, `response_format`).
  body?: Record<string, unknown>
}

interface OpenAIStreamChunk {
  choices?: Array<{
    delta?: { content?: string }
    finish_reason?: string | null
  }>
}

/// Build an `AIProvider` backed by OpenAI's `/v1/chat/completions`
/// streaming endpoint. The returned function plugs directly into
/// `Crepe.Feature.AI`'s `provider` field.
export function createOpenAIProvider(config: OpenAIProviderConfig): AIProvider {
  assertBrowserSafe(config, PROVIDER_NAME)

  return async function* openAIProvider(context, signal) {
    const systemPrompt = resolveSystemPrompt(config.systemPrompt)
    const userMessage = buildDefaultUserMessage(context)

    const messages = config.buildMessages
      ? config.buildMessages(context, { systemPrompt, userMessage })
      : defaultMessages(systemPrompt, userMessage)

    const baseURL = stripTrailingSlashes(config.baseURL ?? DEFAULT_BASE_URL)
    const url = `${baseURL}/v1/chat/completions`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      ...config.headers,
    }

    const body = JSON.stringify({
      model: config.model,
      stream: true,
      messages,
      ...config.body,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal,
    })

    if (!response.ok) {
      throw await readErrorBody(response, PROVIDER_NAME)
    }

    for await (const payload of parseSSE(response, signal)) {
      if (payload === '[DONE]') return
      let event: OpenAIStreamChunk
      try {
        event = JSON.parse(payload) as OpenAIStreamChunk
      } catch {
        continue
      }
      const delta = event.choices?.[0]?.delta?.content
      if (delta) yield delta
    }
  }
}

function defaultMessages(
  systemPrompt: string | null,
  userMessage: string
): OpenAIChatMessage[] {
  const messages: OpenAIChatMessage[] = []
  // `null` means "omit"; an empty string is still a caller-provided
  // value and should be sent as-is.
  if (systemPrompt !== null)
    messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: userMessage })
  return messages
}
