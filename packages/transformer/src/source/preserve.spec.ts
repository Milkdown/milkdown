import { describe, expect, it, vi } from 'vitest'

import type { SerializedSegments } from '../serializer/segments'
import type { DetachedSource, SourceBlock } from './source'

import { preserveSource } from './preserve'

// A source made of parts. A block is `[text, key, requires?]`: the text it
// has in the source, what the serializer writes for it, and the detached
// pieces it needs. A string is the text between two blocks, and
// `{ detach }` is a piece of text with no node, here a link definition.
type Part =
  | string
  | [text: string, key: string, requires?: string[]]
  | { detach: string }

function sourceOf(...parts: Part[]) {
  let source = ''
  const blocks: SourceBlock[] = []
  const detached: DetachedSource[] = []
  const keys: string[] = []
  let tail = 0

  parts.forEach((part) => {
    const from = source.length
    if (typeof part === 'string') {
      source += part
      return
    }
    if (Array.isArray(part)) {
      const [text, key, requires = []] = part
      source += text
      blocks.push({ from, to: source.length, requires })
      keys.push(key)
    } else {
      source += `[${part.detach}]: /url`
      detached.push({ from, to: source.length, id: part.detach })
    }
    tail = source.length
  })

  return { source, blocks, detached, keys, tail }
}

// What the serializer wrote for the document as it is now.
function segmentsOf(...texts: string[]): SerializedSegments {
  return {
    full: `${texts.join('\n\n')}\n`,
    texts,
    keys: texts,
    separators: texts.slice(1).map(() => '\n\n'),
    nodes: null,
  }
}

const accept = () => true

describe('preserveSource', () => {
  const base = sourceOf(
    ['- a', '* a'],
    '\n\n\n',
    ['Title\n===', '# Title'],
    '\n',
    ['text', 'text']
  )

  it('keeps the text of the blocks that did not change', () => {
    const result = preserveSource({
      ...base,
      current: segmentsOf('* a', '# Title', 'text changed'),
      verify: accept,
    })

    expect(result).toBe('- a\n\n\nTitle\n===\n\ntext changed')
  })

  it('keeps what was between two blocks only when both are kept', () => {
    const result = preserveSource({
      ...base,
      current: segmentsOf('* a', '# Changed', 'text'),
      verify: accept,
    })

    expect(result).toBe('- a\n\n# Changed\n\ntext')
  })

  it('writes a new block with the separator of the serializer', () => {
    const current = segmentsOf('* a', 'new', '# Title', 'text')
    current.separators[0] = '\n\n<!---->\n\n'

    const result = preserveSource({ ...base, current, verify: accept })

    expect(result).toBe('- a\n\n<!---->\n\nnew\n\nTitle\n===\ntext')
  })

  it('keeps the start and the end of the source', () => {
    const source = sourceOf('\n\n', ['a', 'a'], '\n\n', ['b', 'b'], '\n\n\n')

    const result = preserveSource({
      ...source,
      current: segmentsOf('a', 'b changed'),
      verify: accept,
    })

    expect(result).toBe('\n\na\n\nb changed\n\n\n')
  })

  it('keeps the text of a block that moved', () => {
    const result = preserveSource({
      ...base,
      current: segmentsOf('text', '* a', '# Title'),
      verify: accept,
    })

    expect(result).toBe('text\n\n- a\n\n\nTitle\n===')
  })

  it('tells the check which blocks it reused', () => {
    const verify = vi.fn(accept)

    preserveSource({
      ...base,
      current: segmentsOf('new', 'text', '* a'),
      verify,
    })

    expect(verify).toHaveBeenCalledWith('new\n\ntext\n\n- a', [null, 2, 0])
  })

  it('follows the line endings of the source', () => {
    const source = sourceOf(['- a', '* a'], '\r\n\r\n', ['b', 'b'], '\r\n')

    const result = preserveSource({
      ...source,
      current: segmentsOf('* a', 'b\nc', 'd'),
      verify: accept,
    })

    expect(result).toBe('- a\r\n\r\nb\r\nc\r\n\r\nd\r\n')
  })

  describe('blocks with the same text', () => {
    const twins = sourceOf(['---', '***'], '\n\n', ['text', 'text'], '\n\n', [
      '* * *',
      '***',
    ])

    it('takes them in the order of the source', () => {
      const result = preserveSource({
        ...twins,
        current: segmentsOf('***', 'text changed', '***'),
        verify: accept,
      })

      expect(result).toBe('---\n\ntext changed\n\n* * *')
    })

    it('prefers the block that is the same node', () => {
      const verify = vi.fn(accept)

      const result = preserveSource({
        ...twins,
        // The first block was removed. The one that is left is the last.
        current: segmentsOf('text', '***'),
        sameBlock: (index) => [1, 2][index],
        verify,
      })

      expect(result).toBe('text\n\n* * *')
      expect(verify).toHaveBeenCalledWith('text\n\n* * *', [1, 2])
    })
  })

  describe('detached pieces', () => {
    const linked = sourceOf(
      ['[a][x]', '[a](/url)', ['x']],
      '\n\n',
      { detach: 'x' },
      '\n\n',
      ['text', 'text'],
      '\n\n',
      { detach: 'unused' },
      '\n'
    )

    it('keeps a piece that a kept block needs', () => {
      const result = preserveSource({
        ...linked,
        current: segmentsOf('[a](/url)', 'text changed'),
        verify: accept,
      })

      expect(result).toBe('[a][x]\n\n[x]: /url\n\ntext changed\n')
    })

    it('drops a piece when no kept block needs it', () => {
      const result = preserveSource({
        ...linked,
        current: segmentsOf('[a](/url) changed', 'text'),
        verify: accept,
      })

      expect(result).toBe('[a](/url) changed\n\ntext\n\n[unused]: /url\n')
    })

    it('keeps a piece that no block ever needed next to its neighbor', () => {
      const result = preserveSource({
        ...linked,
        current: segmentsOf('[a](/url)', 'new', 'text'),
        verify: accept,
      })

      expect(result).toBe(
        '[a][x]\n\n[x]: /url\n\nnew\n\ntext\n\n[unused]: /url\n'
      )
    })

    it('puts a piece before the first kept block after it', () => {
      const source = sourceOf(['a', 'a'], '\n\n', { detach: 'x' }, '\n\n', [
        '[b][x]',
        '[b](/url)',
        ['x'],
      ])

      const result = preserveSource({
        ...source,
        current: segmentsOf('a changed', '[b](/url)'),
        verify: accept,
      })

      expect(result).toBe('a changed\n\n[x]: /url\n\n[b][x]')
    })
  })

  describe('when the check fails', () => {
    it('serializes the blocks next to a change and tries again', () => {
      const source = sourceOf(
        ['a', 'a'],
        '\n',
        ['- b', '* b'],
        '\n',
        ['- c', '* c'],
        '\n',
        ['d', 'd']
      )
      // The block between the two lists is gone.
      const lists = sourceOf(
        ['a', 'a'],
        '\n',
        ['- b', '* b'],
        '\n',
        ['x', 'x'],
        '\n',
        ['- c', '* c'],
        '\n',
        ['d', 'd']
      )
      const verify = vi.fn(
        (markdown: string) => !markdown.includes('- b\n\n- c')
      )

      const result = preserveSource({
        ...lists,
        current: segmentsOf('a', '* b', '- c', 'd'),
        verify,
      })

      expect(verify).toHaveBeenCalledTimes(2)
      expect(result).toBe('a\n\n* b\n\n- c\n\nd')
      // With nothing removed, every block keeps its text.
      expect(
        preserveSource({
          ...source,
          current: segmentsOf('a', '* b', '* c', 'd changed'),
          verify,
        })
      ).toBe('a\n- b\n- c\n\nd changed')
    })

    it('gives up after the second try', () => {
      const verify = vi.fn(() => false)

      const result = preserveSource({
        ...base,
        current: segmentsOf('* a', 'new', '# Title', 'text'),
        verify,
      })

      expect(result).toBeNull()
      expect(verify).toHaveBeenCalledTimes(2)
    })
  })

  it('has nothing to keep when no block is the same', () => {
    const verify = vi.fn(accept)

    const result = preserveSource({
      ...base,
      current: segmentsOf('all', 'new'),
      verify,
    })

    expect(result).toBeNull()
    expect(verify).not.toHaveBeenCalled()
  })

  it('does not check a result that is what the serializer wrote', () => {
    const source = sourceOf(['a', 'a'], '\n\n', ['b', 'b'], '\n')
    const verify = vi.fn(accept)

    const result = preserveSource({
      ...source,
      current: segmentsOf('a', 'b', 'c'),
      verify,
    })

    expect(result).toBe('a\n\nb\n\nc\n')
    expect(verify).not.toHaveBeenCalled()
  })
})
