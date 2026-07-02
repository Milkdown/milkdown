import { describe, expect, it } from 'vitest'

import type { Node as ProseNode } from '../model'
import type { Selection } from '../state'

import { Schema } from '../model'
import {
  AllSelection,
  EditorState,
  NodeSelection,
  TextSelection,
} from '../state'
import {
  getSelectionSnapshot,
  posToTextOffset,
  textOffsetToPos,
} from '../toolkit/prose/snapshot'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*' },
    blockquote: { group: 'block', content: 'block+' },
    hr: { group: 'block' },
    image: { group: 'inline', inline: true, atom: true },
    text: { group: 'inline' },
  },
  marks: {},
})

function doc(...children: ProseNode[]) {
  return schema.node('doc', null, children)
}

function p(...children: (ProseNode | string)[]) {
  return schema.node(
    'paragraph',
    null,
    children.map((child) =>
      typeof child === 'string' ? schema.text(child) : child
    )
  )
}

function snapshot(docNode: ProseNode, selection: Selection) {
  return getSelectionSnapshot(EditorState.create({ doc: docNode, selection }))
}

describe('getSelectionSnapshot', () => {
  it('should draw a caret inside a paragraph', () => {
    const d = doc(p('abcd'))
    expect(snapshot(d, TextSelection.create(d, 3))).toBe('ab┃cd')
  })

  it('should draw a range across paragraphs', () => {
    const d = doc(p('ab'), p('cd'))
    expect(snapshot(d, TextSelection.create(d, 2, 6))).toBe('a❰b\nc❱d')
  })

  it('should draw a caret in an empty paragraph', () => {
    const d = doc(p('a'), p(), p('b'))
    expect(snapshot(d, TextSelection.create(d, 4))).toBe('a\n┃\nb')
  })

  it('should draw a node selection around an inline atom', () => {
    const d = doc(p('a', schema.node('image'), 'b'))
    expect(snapshot(d, NodeSelection.create(d, 2))).toBe('a❰□❱b')
  })

  it('should render a leaf block with separators', () => {
    const d = doc(p('a'), schema.node('hr'), p('b'))
    expect(snapshot(d, TextSelection.create(d, 5))).toBe('a\n□\n┃b')
  })

  it('should separate nested textblocks', () => {
    const d = doc(schema.node('blockquote', null, [p('a'), p('b')]), p('c'))
    expect(snapshot(d, TextSelection.create(d, 3))).toBe('a┃\nb\nc')
  })

  it('should draw a whole-document selection', () => {
    const d = doc(p('ab'))
    expect(snapshot(d, new AllSelection(d))).toBe('❰ab❱')
  })

  it('should honor custom separator and leaf text', () => {
    const d = doc(p('a', schema.node('image')), p('b'))
    const state = EditorState.create({
      doc: d,
      selection: TextSelection.create(d, 2),
    })
    expect(
      getSelectionSnapshot(state, { blockSeparator: '¶', leafText: '<img>' })
    ).toBe('a┃<img>¶b')
  })
})

describe('text offset mapping', () => {
  it('should round-trip offsets and positions inside text', () => {
    const d = doc(p('ab'), p('cd'))
    // string: 'ab\ncd'
    expect(textOffsetToPos(d, 0)).toBe(1)
    expect(textOffsetToPos(d, 1)).toBe(2)
    expect(textOffsetToPos(d, 2)).toBe(3)
    expect(textOffsetToPos(d, 3)).toBe(5)
    expect(textOffsetToPos(d, 5)).toBe(7)

    expect(posToTextOffset(d, 1)).toBe(0)
    expect(posToTextOffset(d, 3)).toBe(2)
    expect(posToTextOffset(d, 5)).toBe(3)
    expect(posToTextOffset(d, 7)).toBe(5)
  })

  it('should resolve an offset at a separator into the empty block', () => {
    const d = doc(p('a'), p(), p('b'))
    // string: 'a\n\nb', offset 2 sits between the separators
    expect(textOffsetToPos(d, 2)).toBe(4)
    expect(posToTextOffset(d, 4)).toBe(2)
  })

  it('should resolve offsets around a leaf placeholder', () => {
    const d = doc(p('a', schema.node('image'), 'b'))
    // string: 'a□b'; the placeholder maps to the position before the atom
    expect(textOffsetToPos(d, 1)).toBe(2)
    expect(textOffsetToPos(d, 2)).toBe(3)
    expect(posToTextOffset(d, 2)).toBe(1)
    expect(posToTextOffset(d, 3)).toBe(2)
  })
})
