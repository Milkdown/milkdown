/* Copyright 2021, Milkdown by Mirone. */
import type { Schema } from '@milkdown/prose/model'
import { describe, expect, it } from 'vitest'
import { SerializerState } from './state'

const schema = {
  text: (text, marks) => ({ text, marks, isText: true }),
} as Schema

describe('serializer-state', () => {
  it('node', () => {
    const state = new SerializerState(schema)
    state.openNode('doc')
    state.openNode('paragraph', 'paragraph node value', { foo: 'bar' })
    state.addNode('text', [], 'text node value')
    state.closeNode()

    expect(state.top()).toMatchObject({
      type: 'doc',
      children: [
        {
          type: 'paragraph',
          value: 'paragraph node value',
          children: [
            {
              type: 'text',
              value: 'text node value',
            },
          ],
        },
      ],
    })
  })
})
