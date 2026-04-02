import { Schema } from '@milkdown/prose/model'
import { describe, expect, it } from 'vitest'

import type { StreamingState } from '../types'

import { applyStreamingAction } from '../streaming-plugin'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
    text: { group: 'inline' },
  },
})

function doc(...children: any[]) {
  return schema.node('doc', null, children)
}

function p(...content: any[]) {
  return schema.node('paragraph', null, content)
}

function text(str: string) {
  return schema.text(str)
}

function createStreamingState(buffer = ''): StreamingState {
  return {
    buffer,
    originalDoc: doc(p(text('original'))),
    active: true,
    lastApplyTime: Date.now(),
  }
}

describe('streaming state transitions', () => {
  it('starts with null state', () => {
    const state = applyStreamingAction(null, { type: 'push', token: 'hello' })
    expect(state).toBeNull()
  })

  it('initializes on start action', () => {
    const originalDoc = doc(p(text('hello')))
    const state = applyStreamingAction(null, { type: 'start', originalDoc })
    expect(state).not.toBeNull()
    expect(state!.active).toBe(true)
    expect(state!.buffer).toBe('')
    expect(state!.originalDoc).toBe(originalDoc)
  })

  it('accumulates tokens via push', () => {
    let state: StreamingState | null = createStreamingState()
    state = applyStreamingAction(state, { type: 'push', token: 'hello' })
    expect(state!.buffer).toBe('hello')

    state = applyStreamingAction(state, { type: 'push', token: ' world' })
    expect(state!.buffer).toBe('hello world')
  })

  it('updates lastApplyTime on apply', () => {
    const state = createStreamingState()
    const now = Date.now() + 1000
    const result = applyStreamingAction(state, {
      type: 'apply',
      lastApplyTime: now,
    })
    expect(result!.lastApplyTime).toBe(now)
  })

  it('returns null on end', () => {
    const state = createStreamingState('some buffer')
    const result = applyStreamingAction(state, { type: 'end' })
    expect(result).toBeNull()
  })

  it('returns null on abort', () => {
    const state = createStreamingState('some buffer')
    const result = applyStreamingAction(state, { type: 'abort' })
    expect(result).toBeNull()
  })

  it('can restart after end', () => {
    let state: StreamingState | null = createStreamingState()
    state = applyStreamingAction(state, { type: 'end' })
    expect(state).toBeNull()

    const newDoc = doc(p(text('new start')))
    state = applyStreamingAction(state, { type: 'start', originalDoc: newDoc })
    expect(state).not.toBeNull()
    expect(state!.active).toBe(true)
    expect(state!.buffer).toBe('')
  })
})

describe('buffer accumulation', () => {
  it('builds markdown incrementally', () => {
    let state: StreamingState | null = createStreamingState()

    const tokens = ['# ', 'Hello', '\n\n', 'This is ', 'a test.']
    for (const token of tokens) {
      state = applyStreamingAction(state, { type: 'push', token })
    }

    expect(state!.buffer).toBe('# Hello\n\nThis is a test.')
  })

  it('handles empty tokens', () => {
    let state: StreamingState | null = createStreamingState()
    state = applyStreamingAction(state, { type: 'push', token: '' })
    expect(state!.buffer).toBe('')

    state = applyStreamingAction(state, { type: 'push', token: 'hello' })
    state = applyStreamingAction(state, { type: 'push', token: '' })
    expect(state!.buffer).toBe('hello')
  })
})
