import { Schema } from '@milkdown/prose/model'
import { describe, expect, it } from 'vitest'

import type { StreamingState } from '../types'

import { defaultInsertStrategy } from '../flush'
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
    insertPos: null,
    insertEndPos: null,
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

describe('insert-at-cursor state transitions', () => {
  it('sets insertPos on start with insertPos', () => {
    const originalDoc = doc(p(text('hello')))
    const state = applyStreamingAction(null, {
      type: 'start',
      originalDoc,
      insertPos: 5,
    })
    expect(state).not.toBeNull()
    expect(state!.insertPos).toBe(5)
    expect(state!.insertEndPos).toBe(5)
  })

  it('has null insertPos for normal start', () => {
    const originalDoc = doc(p(text('hello')))
    const state = applyStreamingAction(null, {
      type: 'start',
      originalDoc,
    })
    expect(state!.insertPos).toBeNull()
    expect(state!.insertEndPos).toBeNull()
  })

  it('updates insertEndPos on apply', () => {
    let state: StreamingState | null = applyStreamingAction(null, {
      type: 'start',
      originalDoc: doc(p(text('hello'))),
      insertPos: 3,
    })
    state = applyStreamingAction(state, {
      type: 'apply',
      lastApplyTime: Date.now(),
      insertEndPos: 10,
    })
    expect(state!.insertEndPos).toBe(10)
  })

  it('preserves insertEndPos when apply has no insertEndPos', () => {
    let state: StreamingState | null = applyStreamingAction(null, {
      type: 'start',
      originalDoc: doc(p(text('hello'))),
      insertPos: 3,
    })
    state = applyStreamingAction(state, {
      type: 'apply',
      lastApplyTime: Date.now(),
    })
    expect(state!.insertEndPos).toBe(3) // unchanged from initial
  })

  it('accumulates tokens in insert mode same as normal', () => {
    let state: StreamingState | null = applyStreamingAction(null, {
      type: 'start',
      originalDoc: doc(p(text('hello'))),
      insertPos: 5,
    })
    state = applyStreamingAction(state, { type: 'push', token: 'world' })
    expect(state!.buffer).toBe('world')
    expect(state!.insertPos).toBe(5)
  })

  it('returns null on end in insert mode', () => {
    let state: StreamingState | null = applyStreamingAction(null, {
      type: 'start',
      originalDoc: doc(p(text('hello'))),
      insertPos: 5,
    })
    state = applyStreamingAction(state, { type: 'push', token: 'data' })
    state = applyStreamingAction(state, { type: 'end' })
    expect(state).toBeNull()
  })

  it('returns null on abort in insert mode', () => {
    let state: StreamingState | null = applyStreamingAction(null, {
      type: 'start',
      originalDoc: doc(p(text('hello'))),
      insertPos: 5,
    })
    state = applyStreamingAction(state, { type: 'abort' })
    expect(state).toBeNull()
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

// ---------------------------------------------------------------------------
// defaultInsertStrategy
// ---------------------------------------------------------------------------

const extendedSchema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: {
      group: 'block',
      content: 'inline*',
      toDOM: () => ['p', 0] as const,
    },
    text: { group: 'inline' },
    code_block: {
      group: 'block',
      content: 'text*',
      code: true,
      toDOM: () => ['pre', ['code', 0]] as const,
    },
    table: {
      group: 'block',
      content: 'table_row+',
      toDOM: () => ['table', 0] as const,
    },
    table_row: {
      content: 'table_cell+',
      toDOM: () => ['tr', 0] as const,
    },
    table_cell: {
      content: 'inline*',
      toDOM: () => ['td', 0] as const,
    },
    heading: {
      group: 'block',
      content: 'inline*',
      attrs: { level: { default: 1 } },
      toDOM: (node: any) => [`h${node.attrs.level}`, 0] as const,
    },
    blockquote: {
      group: 'block',
      content: 'block+',
      toDOM: () => ['blockquote', 0] as const,
    },
    bullet_list: {
      group: 'block',
      content: 'list_item+',
      toDOM: () => ['ul', 0] as const,
    },
    list_item: {
      content: 'paragraph+',
      toDOM: () => ['li', 0] as const,
    },
  },
})

describe('defaultInsertStrategy', () => {
  it('returns plain-text with preserveNewlines for code block', () => {
    const docNode = extendedSchema.node('doc', null, [
      extendedSchema.node('code_block', null, [
        extendedSchema.text('some code'),
      ]),
    ])
    // Position inside code_block text
    const resolved = docNode.resolve(2)
    expect(resolved.parent.type.spec.code).toBe(true)
    expect(defaultInsertStrategy(resolved)).toEqual({
      type: 'plain-text',
      preserveNewlines: true,
    })
  })

  it('returns plain-text without preserveNewlines for table cell', () => {
    const docNode = extendedSchema.node('doc', null, [
      extendedSchema.node('table', null, [
        extendedSchema.node('table_row', null, [
          extendedSchema.node('table_cell', null, [
            extendedSchema.text('cell'),
          ]),
        ]),
      ]),
    ])
    // Position inside table_cell text: doc(1) > table(1) > table_row(1) > table_cell(1) > text
    const resolved = docNode.resolve(4)
    expect(resolved.parent.type.name).toBe('table_cell')
    expect(defaultInsertStrategy(resolved)).toEqual({
      type: 'plain-text',
      preserveNewlines: false,
    })
  })

  it('returns split-block for paragraph at depth >= 1', () => {
    const docNode = extendedSchema.node('doc', null, [
      extendedSchema.node('paragraph', null, [extendedSchema.text('hello')]),
    ])
    // Position inside paragraph text
    const resolved = docNode.resolve(2)
    expect(resolved.depth).toBeGreaterThanOrEqual(1)
    expect(defaultInsertStrategy(resolved)).toEqual({ type: 'split-block' })
  })

  it('returns split-block for heading', () => {
    const docNode = extendedSchema.node('doc', null, [
      extendedSchema.node('heading', { level: 1 }, [
        extendedSchema.text('title'),
      ]),
    ])
    const resolved = docNode.resolve(2)
    expect(resolved.parent.type.name).toBe('heading')
    expect(defaultInsertStrategy(resolved)).toEqual({ type: 'split-block' })
  })

  it('returns split-block for list item', () => {
    const docNode = extendedSchema.node('doc', null, [
      extendedSchema.node('bullet_list', null, [
        extendedSchema.node('list_item', null, [
          extendedSchema.node('paragraph', null, [extendedSchema.text('item')]),
        ]),
      ]),
    ])
    // Position inside list_item > paragraph > text
    const resolved = docNode.resolve(4)
    expect(resolved.depth).toBeGreaterThanOrEqual(1)
    expect(defaultInsertStrategy(resolved)).toEqual({ type: 'split-block' })
  })

  it('returns split-block for blockquote paragraph', () => {
    const docNode = extendedSchema.node('doc', null, [
      extendedSchema.node('blockquote', null, [
        extendedSchema.node('paragraph', null, [extendedSchema.text('quoted')]),
      ]),
    ])
    // Position inside blockquote > paragraph > text
    const resolved = docNode.resolve(3)
    expect(resolved.depth).toBeGreaterThanOrEqual(1)
    expect(defaultInsertStrategy(resolved)).toEqual({ type: 'split-block' })
  })

  it('returns block for depth 0', () => {
    const docNode = extendedSchema.node('doc', null, [
      extendedSchema.node('paragraph', null, [extendedSchema.text('hello')]),
    ])
    // Position 0 resolves at the doc level (depth 0)
    const resolved = docNode.resolve(0)
    expect(resolved.depth).toBe(0)
    expect(defaultInsertStrategy(resolved)).toEqual({ type: 'block' })
  })
})
