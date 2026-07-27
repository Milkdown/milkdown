import { describe, expect, it } from 'vitest'

import type { Mark, Node as ProseNode } from '../model'

import { Schema } from '../model'
import { getMarkRange } from '../toolkit/prose/mark'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*' },
    text: { group: 'inline' },
  },
  marks: {
    strong: {},
    em: {},
    link: { attrs: { href: {} } },
  },
})

const { strong, em, link } = schema.marks

function paragraph(...children: ProseNode[]) {
  return schema.node('doc', null, [schema.node('paragraph', null, children)])
}

function text(content: string, ...marks: Mark[]) {
  return schema.text(content, marks)
}

describe('getMarkRange', () => {
  it('should find the whole run from a caret inside it', () => {
    // <p>[strong "bold"] "text"</p> -> strong covers [1, 5)
    const doc = paragraph(text('bold', strong.create()), text('text'))
    const range = getMarkRange(doc.resolve(3), strong)
    expect(range).toMatchObject({ from: 1, to: 5 })
    expect(range?.mark.type).toBe(strong)
  })

  it('should include both edges of the run', () => {
    const doc = paragraph(text('ab'), text('cd', strong.create()), text('ef'))
    // strong covers [3, 5): caret at the left edge and the right edge both hit
    expect(getMarkRange(doc.resolve(3), strong)).toMatchObject({
      from: 3,
      to: 5,
    })
    expect(getMarkRange(doc.resolve(5), strong)).toMatchObject({
      from: 3,
      to: 5,
    })
  })

  it('should find a run ending at the parent boundary', () => {
    const doc = paragraph(text('ab'), text('cd', strong.create()))
    // caret at the very end of the paragraph, run before it
    expect(getMarkRange(doc.resolve(5), strong)).toMatchObject({
      from: 3,
      to: 5,
    })
  })

  it('should return undefined when the position carries no such mark', () => {
    const doc = paragraph(text('ab', strong.create()), text('cd'))
    expect(getMarkRange(doc.resolve(5), strong)).toBeUndefined()
    expect(getMarkRange(doc.resolve(2), em)).toBeUndefined()
  })

  it('should span text nodes split by a nested mark', () => {
    // **a *b* c** -> [strong "a "][strong+em "b"][strong " c"]
    const doc = paragraph(
      text('a ', strong.create()),
      text('b', strong.create(), em.create()),
      text(' c', strong.create())
    )
    expect(getMarkRange(doc.resolve(4), strong)).toMatchObject({
      from: 1,
      to: 6,
    })
    // while the em run stays confined to its own segment
    expect(getMarkRange(doc.resolve(4), em)).toMatchObject({ from: 3, to: 4 })
  })

  it('should keep adjacent same-type marks with different attrs apart', () => {
    // [a](x)[b](y) -> two link runs touching at position 2
    const doc = paragraph(
      text('a', link.create({ href: 'x' })),
      text('b', link.create({ href: 'y' }))
    )
    // tie-break goes to the run after the caret
    const range = getMarkRange(doc.resolve(2), link)
    expect(range).toMatchObject({ from: 2, to: 3 })
    expect(range?.mark.attrs.href).toBe('y')
    // and the runs never merge from an interior position either
    expect(getMarkRange(doc.resolve(1), link)).toMatchObject({
      from: 1,
      to: 2,
    })
  })

  it('should merge adjacent runs of equal marks', () => {
    const doc = paragraph(
      text('a', link.create({ href: 'x' })),
      text('b', link.create({ href: 'x' }), em.create()),
      text('c', link.create({ href: 'x' }))
    )
    expect(getMarkRange(doc.resolve(2), link)).toMatchObject({
      from: 1,
      to: 4,
    })
  })
})
