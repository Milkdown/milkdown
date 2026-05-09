import type { AIPromptContext, AIProvider } from '../../feature/ai/types'

import {
  type BaseProviderConfig,
  assertBrowserSafe,
  buildDefaultUserMessage,
  parseSSE,
  readErrorBody,
  resolveSystemPrompt,
} from '../shared'

const PROVIDER_NAME = 'milkdown/providers/anthropic'
const DEFAULT_BASE_URL = 'https://api.anthropic.com'
const DEFAULT_ANTHROPIC_VERSION = '2023-06-01'
const DEFAULT_MAX_TOKENS = 4096

export interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AnthropicBuildMessagesResult {
  /// Anthropic puts the system prompt in a top-level `system` field,
  /// not in the messages array.
  system?: string
  messages: AnthropicMessage[]
}

export interface AnthropicProviderConfig extends BaseProviderConfig {
  /// Anthropic's API requires `max_tokens`. Defaults to 4096.
  maxTokens?: number

  /// `anthropic-version` header. Defaults to `2023-06-01`.
  anthropicVersion?: string

  /// Customize the request payload. The default builder maps the
  /// resolved system prompt to `system` and produces a single user
  /// message containing the document, selection, and instruction.
  buildMessages?: (
    context: AIPromptContext,
    defaults: { systemPrompt: string | null; userMessage: string }
  ) => AnthropicBuildMessagesResult

  /// Extra fields merged into the request body (e.g. `temperature`,
  /// `top_p`, `metadata`, `tool_choice`).
  body?: Record<string, unknown>
}

interface AnthropicStreamEvent {
  type: string
  delta?: {
    type?: string
    text?: string
  }
}

/// Build an `AIProvider` backed by Anthropic's `/v1/messages` streaming
/// endpoint. The returned function plugs directly into
/// `Crepe.Feature.AI`'s `provider` field.
export function createAnthropicProvider(
  config: AnthropicProviderConfig
): AIProvider {
  assertBrowserSafe(config, PROVIDER_NAME)

  return async function* anthropicProvider(context, signal) {
    const systemPrompt = resolveSystemPrompt(config.systemPrompt)
    const userMessage = buildDefaultUserMessage(context)

    const built = config.buildMessages
      ? config.buildMessages(context, { systemPrompt, userMessage })
      : {
          system: systemPrompt ?? undefined,
          messages: [
            { role: 'user' as const, content: userMessage },
          ] satisfies AnthropicMessage[],
        }

    const baseURL = (config.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
    const url = `${baseURL}/v1/messages`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'anthropic-version': config.anthropicVersion ?? DEFAULT_ANTHROPIC_VERSION,
      ...(config.apiKey ? { 'x-api-key': config.apiKey } : {}),
      // Required for direct browser → api.anthropic.com calls; harmless
      // when proxying through a backend.
      ...(config.dangerouslyAllowBrowser
        ? { 'anthropic-dangerous-direct-browser-access': 'true' }
        : {}),
      ...config.headers,
    }

    const body = JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
      stream: true,
      // Caller-supplied empty string is still a value; only `undefined`
      // (i.e. resolveSystemPrompt returned `null`) means "omit".
      ...(built.system !== undefined ? { system: built.system } : {}),
      messages: built.messages,
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
      let event: AnthropicStreamEvent
      try {
        event = JSON.parse(payload) as AnthropicStreamEvent
      } catch {
        continue
      }
      if (
        event.type === 'content_block_delta' &&
        event.delta?.type === 'text_delta' &&
        event.delta.text
      ) {
        yield event.delta.text
      }
      if (event.type === 'message_stop') return
    }
  }
}
