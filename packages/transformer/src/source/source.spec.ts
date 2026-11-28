import type { Node } from '@milkdown/prose/model'

import { describe, expect, it } from 'vitest'

import { getParsedSource, recordParsedSource } from './source'

const node = () => ({}) as unknown as Node

describe('markdown source', () => {
  it('gives back the source of a recorded document', () => {
    const doc = node()
    const record = recordParsedSource(doc, '- a\n- b')

    expect(record).toEqual({ source: '- a\n- b', doc })
    expect(getParsedSource(doc)).toBe(record)
  })

  it('knows nothing about a document that was not recorded', () => {
    expect(getParsedSource(node())).toBeUndefined()
  })

  it('keeps one source per document', () => {
    const a = node()
    const b = node()
    recordParsedSource(a, 'a')
    recordParsedSource(b, 'b')

    expect(getParsedSource(a)?.source).toBe('a')
    expect(getParsedSource(b)?.source).toBe('b')
  })
})
