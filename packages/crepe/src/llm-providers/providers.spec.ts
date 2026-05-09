import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

type FetchSig = (...args: Parameters<typeof fetch>) => Promise<Response>

import type { AIPromptContext } from '../feature/ai/types'

import { createAnthropicProvider } from './anthropic'
import { createOpenAIProvider } from './openai'
import {
  DEFAULT_SYSTEM_PROMPT,
  buildDefaultUserMessage,
  parseSSE,
  resolveSystemPrompt,
} from './shared'

const sampleContext: AIPromptContext = {
  document: '# Title\n\nHello.',
  selection: 'Hello.',
  instruction: 'Make it longer.',
}

function sseResponse(events: string[]): Response {
  const text = events.map((e) => `data: ${e}\n\n`).join('')
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text))
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

function chunkedSseResponse(rawChunks: string[]): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      for (const chunk of rawChunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

async function collect<T>(iter: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = []
  for await (const v of iter) out.push(v)
  return out
}

describe('shared helpers', () => {
  test('buildDefaultUserMessage includes selection when non-empty', () => {
    const msg = buildDefaultUserMessage(sampleContext)
    expect(msg).toContain('<document>\n# Title\n\nHello.\n</document>')
    expect(msg).toContain('<selection>\nHello.\n</selection>')
    expect(msg).toContain('<instruction>\nMake it longer.\n</instruction>')
  })

  test('buildDefaultUserMessage omits selection when empty', () => {
    const msg = buildDefaultUserMessage({ ...sampleContext, selection: '' })
    expect(msg).not.toContain('<selection>')
    expect(msg).toContain('<instruction>')
  })

  test('resolveSystemPrompt: undefined → default, null → null, string → as-is', () => {
    expect(resolveSystemPrompt(undefined)).toBe(DEFAULT_SYSTEM_PROMPT)
    expect(resolveSystemPrompt(null)).toBeNull()
    expect(resolveSystemPrompt('custom')).toBe('custom')
  })

  test('parseSSE strips `data: ` and ignores other lines', async () => {
    const response = chunkedSseResponse([
      'event: ping\n',
      'data: hello\n',
      '\n',
      ': comment\n',
      'data:nospace\n',
      '\n',
    ])
    const ac = new AbortController()
    const out = await collect(parseSSE(response, ac.signal))
    expect(out).toEqual(['hello', 'nospace'])
  })

  test('parseSSE handles a payload split across reads', async () => {
    const response = chunkedSseResponse(['data: hel', 'lo\n\ndata: world\n\n'])
    const ac = new AbortController()
    const out = await collect(parseSSE(response, ac.signal))
    expect(out).toEqual(['hello', 'world'])
  })

  test('parseSSE preserves significant whitespace in the trailing payload', async () => {
    // No trailing newline — the buffer reaches the tail flush. The
    // payload here intentionally contains leading and trailing spaces
    // (a streamed token boundary the model emitted on purpose); the
    // tail flush must not strip them.
    const response = chunkedSseResponse(['data:  hello world  '])
    const ac = new AbortController()
    const out = await collect(parseSSE(response, ac.signal))
    expect(out).toEqual([' hello world  '])
  })

  test('parseSSE stops yielding after abort', async () => {
    const ac = new AbortController()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder()
        controller.enqueue(encoder.encode('data: a\n\n'))
        await new Promise((r) => setTimeout(r, 0))
        ac.abort()
        controller.enqueue(encoder.encode('data: b\n\n'))
        controller.close()
      },
    })
    const response = new Response(stream, { status: 200 })
    const out = await collect(parseSSE(response, ac.signal))
    expect(out).toEqual(['a'])
  })
})

describe('createOpenAIProvider', () => {
  let originalFetch: typeof fetch
  beforeEach(() => {
    originalFetch = globalThis.fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test('refuses apiKey in browser without dangerouslyAllowBrowser', () => {
    expect(() =>
      createOpenAIProvider({ apiKey: 'sk-test', model: 'gpt-4o-mini' })
    ).toThrow(/Refusing to send your API key/)
  })

  test('allows browser apiKey with dangerouslyAllowBrowser', () => {
    expect(() =>
      createOpenAIProvider({
        apiKey: 'sk-test',
        model: 'gpt-4o-mini',
        dangerouslyAllowBrowser: true,
      })
    ).not.toThrow()
  })

  test('does not require dangerouslyAllowBrowser when apiKey is absent', () => {
    expect(() =>
      createOpenAIProvider({
        baseURL: 'https://my-proxy.example.com',
        headers: { Authorization: 'Bearer session-token' },
        model: 'gpt-4o-mini',
      })
    ).not.toThrow()
  })

  test('refuses apiKey in worker context (no DOM, WorkerGlobalScope present)', () => {
    // Simulate Service/Web/Shared Worker: no `document`, but
    // `WorkerGlobalScope` is the global type.
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('WorkerGlobalScope', class {})
    try {
      expect(() =>
        createOpenAIProvider({ apiKey: 'sk-test', model: 'gpt-4o-mini' })
      ).toThrow(/Refusing to send your API key/)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  test('does not flag Node/SSR (no DOM, no WorkerGlobalScope)', () => {
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('WorkerGlobalScope', undefined)
    try {
      expect(() =>
        createOpenAIProvider({ apiKey: 'sk-test', model: 'gpt-4o-mini' })
      ).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  test('streams text from delta.content and stops at [DONE]', async () => {
    const fetchMock = vi.fn<FetchSig>(async () =>
      sseResponse([
        JSON.stringify({ choices: [{ delta: { content: 'Hello' } }] }),
        JSON.stringify({ choices: [{ delta: { content: ', world' } }] }),
        JSON.stringify({ choices: [{ delta: {} }] }),
        '[DONE]',
        JSON.stringify({ choices: [{ delta: { content: 'never' } }] }),
      ])
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createOpenAIProvider({
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
      dangerouslyAllowBrowser: true,
    })
    const out = await collect(
      provider(sampleContext, new AbortController().signal)
    )
    expect(out.join('')).toBe('Hello, world')
  })

  test('sends Authorization, model, stream:true, and default messages', async () => {
    const fetchMock = vi.fn<FetchSig>(async () => sseResponse(['[DONE]']))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createOpenAIProvider({
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
      dangerouslyAllowBrowser: true,
    })
    await collect(provider(sampleContext, new AbortController().signal))

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.openai.com/v1/chat/completions')
    const headers = (init as RequestInit).headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer sk-test')
    expect(headers['Content-Type']).toBe('application/json')
    const body = JSON.parse(String((init as RequestInit).body))
    expect(body.model).toBe('gpt-4o-mini')
    expect(body.stream).toBe(true)
    expect(body.messages[0].role).toBe('system')
    expect(body.messages[0].content).toBe(DEFAULT_SYSTEM_PROMPT)
    expect(body.messages[1].role).toBe('user')
    expect(body.messages[1].content).toContain('<instruction>')
  })

  test('honors baseURL, custom headers, and extra body fields', async () => {
    const fetchMock = vi.fn<FetchSig>(async () => sseResponse(['[DONE]']))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createOpenAIProvider({
      baseURL: 'https://my-proxy.example.com/',
      headers: { Authorization: 'Bearer session-token' },
      model: 'gpt-4o-mini',
      body: { temperature: 0.2 },
    })
    await collect(provider(sampleContext, new AbortController().signal))

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://my-proxy.example.com/v1/chat/completions')
    const headers = (init as RequestInit).headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer session-token')
    const body = JSON.parse(String((init as RequestInit).body))
    expect(body.temperature).toBe(0.2)
  })

  test('omits system message when systemPrompt is null', async () => {
    const fetchMock = vi.fn<FetchSig>(async () => sseResponse(['[DONE]']))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createOpenAIProvider({
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
      systemPrompt: null,
      dangerouslyAllowBrowser: true,
    })
    await collect(provider(sampleContext, new AbortController().signal))
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body))
    expect(body.messages).toHaveLength(1)
    expect(body.messages[0].role).toBe('user')
  })

  test('keeps an empty-string systemPrompt instead of omitting it', async () => {
    const fetchMock = vi.fn<FetchSig>(async () => sseResponse(['[DONE]']))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createOpenAIProvider({
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
      systemPrompt: '',
      dangerouslyAllowBrowser: true,
    })
    await collect(provider(sampleContext, new AbortController().signal))
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body))
    expect(body.messages).toHaveLength(2)
    expect(body.messages[0]).toEqual({ role: 'system', content: '' })
    expect(body.messages[1].role).toBe('user')
  })

  test('throws on non-2xx with body included', async () => {
    globalThis.fetch = vi.fn(
      async () =>
        new Response('rate limited', {
          status: 429,
          headers: { 'Content-Type': 'text/plain' },
        })
    ) as unknown as typeof fetch

    const provider = createOpenAIProvider({
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
      dangerouslyAllowBrowser: true,
    })
    await expect(
      collect(provider(sampleContext, new AbortController().signal))
    ).rejects.toThrow(/429.*rate limited/)
  })

  test('passes the abort signal through to fetch', async () => {
    const fetchMock = vi.fn<FetchSig>(async () => sseResponse(['[DONE]']))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createOpenAIProvider({
      apiKey: 'sk-test',
      model: 'gpt-4o-mini',
      dangerouslyAllowBrowser: true,
    })
    const ac = new AbortController()
    await collect(provider(sampleContext, ac.signal))
    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(init.signal).toBe(ac.signal)
  })
})

describe('createAnthropicProvider', () => {
  let originalFetch: typeof fetch
  beforeEach(() => {
    originalFetch = globalThis.fetch
  })
  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test('streams text from text_delta and stops at message_stop', async () => {
    const fetchMock = vi.fn<FetchSig>(async () =>
      sseResponse([
        JSON.stringify({ type: 'message_start' }),
        JSON.stringify({ type: 'content_block_start' }),
        JSON.stringify({
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Hello' },
        }),
        JSON.stringify({
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: ', world' },
        }),
        JSON.stringify({ type: 'content_block_stop' }),
        JSON.stringify({ type: 'message_stop' }),
        // Anything after message_stop must be ignored.
        JSON.stringify({
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'never' },
        }),
      ])
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createAnthropicProvider({
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-5',
      dangerouslyAllowBrowser: true,
    })
    const out = await collect(
      provider(sampleContext, new AbortController().signal)
    )
    expect(out.join('')).toBe('Hello, world')
  })

  test('sends x-api-key, anthropic-version, max_tokens, and system field', async () => {
    const fetchMock = vi.fn<FetchSig>(async () =>
      sseResponse([JSON.stringify({ type: 'message_stop' })])
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createAnthropicProvider({
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-5',
      maxTokens: 2048,
      dangerouslyAllowBrowser: true,
    })
    await collect(provider(sampleContext, new AbortController().signal))

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    const headers = (init as RequestInit).headers as Record<string, string>
    expect(headers['x-api-key']).toBe('sk-ant-test')
    expect(headers['anthropic-version']).toBe('2023-06-01')
    expect(headers['anthropic-dangerous-direct-browser-access']).toBe('true')
    const body = JSON.parse(String((init as RequestInit).body))
    expect(body.model).toBe('claude-sonnet-4-5')
    expect(body.max_tokens).toBe(2048)
    expect(body.stream).toBe(true)
    expect(body.system).toBe(DEFAULT_SYSTEM_PROMPT)
    expect(body.messages).toHaveLength(1)
    expect(body.messages[0].role).toBe('user')
  })

  test('omits system field when systemPrompt is null', async () => {
    const fetchMock = vi.fn<FetchSig>(async () =>
      sseResponse([JSON.stringify({ type: 'message_stop' })])
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createAnthropicProvider({
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-5',
      systemPrompt: null,
      dangerouslyAllowBrowser: true,
    })
    await collect(provider(sampleContext, new AbortController().signal))
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body))
    expect(body.system).toBeUndefined()
  })

  test('keeps an empty-string systemPrompt instead of omitting it', async () => {
    const fetchMock = vi.fn<FetchSig>(async () =>
      sseResponse([JSON.stringify({ type: 'message_stop' })])
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createAnthropicProvider({
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-5',
      systemPrompt: '',
      dangerouslyAllowBrowser: true,
    })
    await collect(provider(sampleContext, new AbortController().signal))
    const body = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body))
    expect(body.system).toBe('')
  })

  test('proxy mode: omits x-api-key and direct-browser-access header', async () => {
    const fetchMock = vi.fn<FetchSig>(async () =>
      sseResponse([JSON.stringify({ type: 'message_stop' })])
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const provider = createAnthropicProvider({
      baseURL: 'https://my-proxy.example.com',
      headers: { Authorization: 'Bearer session-token' },
      model: 'claude-sonnet-4-5',
    })
    await collect(provider(sampleContext, new AbortController().signal))

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://my-proxy.example.com/v1/messages')
    const headers = (init as RequestInit).headers as Record<string, string>
    expect(headers['x-api-key']).toBeUndefined()
    expect(headers['anthropic-dangerous-direct-browser-access']).toBeUndefined()
    expect(headers.Authorization).toBe('Bearer session-token')
  })

  test('throws on non-2xx with body included', async () => {
    globalThis.fetch = vi.fn(
      async () =>
        new Response('overloaded', {
          status: 529,
          headers: { 'Content-Type': 'text/plain' },
        })
    ) as unknown as typeof fetch

    const provider = createAnthropicProvider({
      apiKey: 'sk-ant-test',
      model: 'claude-sonnet-4-5',
      dangerouslyAllowBrowser: true,
    })
    await expect(
      collect(provider(sampleContext, new AbortController().signal))
    ).rejects.toThrow(/529.*overloaded/)
  })
})
