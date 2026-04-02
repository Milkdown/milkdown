import { Schema } from '@milkdown/prose/model'
import { describe, expect, it } from 'vitest'

import { computeDocDiff } from '../diff-compute'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
    heading: {
      group: 'block',
      content: 'inline*',
      attrs: { level: { default: 1 } },
      toDOM: (node) => [`h${node.attrs.level}`, 0],
    },
    text: { group: 'inline' },
    image: {
      group: 'block',
      atom: true,
      attrs: { src: { default: '' }, alt: { default: '' } },
      toDOM: (node) => ['img', { src: node.attrs.src }],
    },
    code_block: {
      group: 'block',
      content: 'text*',
      code: true,
      attrs: { language: { default: '' } },
      toDOM: () => ['pre', ['code', 0]],
    },
    table: {
      group: 'block',
      content: 'table_row+',
      toDOM: () => ['table', ['tbody', 0]],
    },
    table_row: {
      content: 'table_cell+',
      toDOM: () => ['tr', 0],
    },
    table_cell: {
      content: 'inline*',
      attrs: { header: { default: false } },
      toDOM: (node) => [node.attrs.header ? 'th' : 'td', 0],
    },
    bullet_list: {
      group: 'block',
      content: 'list_item+',
      toDOM: () => ['ul', 0],
    },
    list_item: { content: 'paragraph+', toDOM: () => ['li', 0] },
    hard_break: { group: 'inline', inline: true },
  },
  marks: {
    bold: { toDOM: () => ['strong', 0] },
    italic: { toDOM: () => ['em', 0] },
  },
})

function doc(...children: any[]) {
  return schema.node('doc', null, children)
}

function p(...content: any[]) {
  return schema.node('paragraph', null, content)
}

function heading(level: number, ...content: any[]) {
  return schema.node('heading', { level }, content)
}

function text(str: string, marks?: any[]) {
  return schema.text(str, marks)
}

function image(src: string, alt = '') {
  return schema.node('image', { src, alt })
}

function codeBlock(code: string, language = '') {
  return schema.node('code_block', { language }, code ? [text(code)] : [])
}

function table(...rows: any[]) {
  return schema.node('table', null, rows)
}

function tr(...cells: any[]) {
  return schema.node('table_row', null, cells)
}

function td(...content: any[]) {
  return schema.node('table_cell', { header: false }, content)
}

function th(...content: any[]) {
  return schema.node('table_cell', { header: true }, content)
}

function ul(...items: any[]) {
  return schema.node('bullet_list', null, items)
}

function li(...content: any[]) {
  return schema.node('list_item', null, content)
}

describe('computeDocDiff', () => {
  it('returns empty for identical documents', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('hello')))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes).toHaveLength(0)
  })

  it('detects inline text insertion', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('hello world')))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)

    const change = changes[0]!
    // Insertion: fromA === toA (no deletion), fromB < toB (insertion)
    expect(change.fromA).toBe(change.toA)
    expect(change.fromB).toBeLessThan(change.toB)
  })

  it('detects inline text deletion', () => {
    const oldDoc = doc(p(text('hello world')))
    const newDoc = doc(p(text('hello')))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)

    const change = changes[0]!
    // Deletion: fromA < toA (deletion), fromB === toB (no insertion)
    expect(change.fromA).toBeLessThan(change.toA)
    expect(change.fromB).toBe(change.toB)
  })

  it('detects text replacement', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('world')))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)

    const change = changes[0]!
    expect(change.fromA).toBeLessThan(change.toA)
    expect(change.fromB).toBeLessThan(change.toB)
  })

  it('detects new block insertion', () => {
    const oldDoc = doc(p(text('first')))
    const newDoc = doc(p(text('first')), p(text('second')))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)

    // The insertion should be in the B doc
    const hasInsertion = changes.some((c) => c.fromB < c.toB)
    expect(hasInsertion).toBe(true)
  })

  it('detects block deletion', () => {
    const oldDoc = doc(p(text('first')), p(text('second')))
    const newDoc = doc(p(text('first')))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)

    const hasDeletion = changes.some((c) => c.fromA < c.toA)
    expect(hasDeletion).toBe(true)
  })

  it('does not detect heading level-only change (known limitation)', () => {
    const oldDoc = doc(heading(1, text('Title')))
    const newDoc = doc(heading(2, text('Title')))
    const changes = computeDocDiff(oldDoc, newDoc)
    // Heading attrs are not encoded to avoid false positives from
    // runtime-generated attrs like id. Level-only changes are not detected.
    expect(changes).toHaveLength(0)
  })

  it('detects atom node attribute changes', () => {
    const oldDoc = doc(image('old.png'))
    const newDoc = doc(image('new.png'))
    const changes = computeDocDiff(oldDoc, newDoc)
    // With the custom encoder, different attrs produce different tokens
    expect(changes.length).toBeGreaterThan(0)
  })

  it('treats identical atom nodes as unchanged', () => {
    const oldDoc = doc(image('same.png'))
    const newDoc = doc(image('same.png'))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes).toHaveLength(0)
  })

  it('detects multiple changes across blocks', () => {
    const oldDoc = doc(
      heading(1, text('Title')),
      p(text('first paragraph')),
      p(text('second paragraph'))
    )
    const newDoc = doc(
      heading(1, text('New Title')),
      p(text('first paragraph')),
      p(text('updated paragraph'))
    )
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThanOrEqual(2)
  })
})

describe('computeDocDiff - image (atom node)', () => {
  it('detects image src change', () => {
    const oldDoc = doc(image('old.png'))
    const newDoc = doc(image('new.png'))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('detects image added', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('hello')), image('photo.png'))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
    expect(changes.some((c) => c.fromB < c.toB)).toBe(true)
  })

  it('detects image removed', () => {
    const oldDoc = doc(p(text('hello')), image('photo.png'))
    const newDoc = doc(p(text('hello')))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
    expect(changes.some((c) => c.fromA < c.toA)).toBe(true)
  })

  it('detects image alt attribute change', () => {
    const oldDoc = doc(image('same.png', 'old alt'))
    const newDoc = doc(image('same.png', 'new alt'))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('ignores identical images', () => {
    const oldDoc = doc(image('same.png', 'same alt'))
    const newDoc = doc(image('same.png', 'same alt'))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes).toHaveLength(0)
  })
})

describe('computeDocDiff - code block', () => {
  it('detects code content change', () => {
    const oldDoc = doc(codeBlock('const x = 1'))
    const newDoc = doc(codeBlock('const x = 2'))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('detects code block added', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('hello')), codeBlock('code'))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('ignores identical code blocks', () => {
    const oldDoc = doc(codeBlock('same code', 'ts'))
    const newDoc = doc(codeBlock('same code', 'ts'))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes).toHaveLength(0)
  })
})

describe('computeDocDiff - table', () => {
  it('detects cell content change', () => {
    const oldDoc = doc(
      table(tr(th(text('A')), th(text('B'))), tr(td(text('1')), td(text('2'))))
    )
    const newDoc = doc(
      table(tr(th(text('A')), th(text('B'))), tr(td(text('1')), td(text('X'))))
    )
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('detects new row added', () => {
    const oldDoc = doc(table(tr(td(text('A'))), tr(td(text('1')))))
    const newDoc = doc(
      table(tr(td(text('A'))), tr(td(text('1'))), tr(td(text('2'))))
    )
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
    expect(changes.some((c) => c.fromB < c.toB)).toBe(true)
  })

  it('detects new column added', () => {
    const oldDoc = doc(table(tr(th(text('A'))), tr(td(text('1')))))
    const newDoc = doc(
      table(tr(th(text('A')), th(text('B'))), tr(td(text('1')), td(text('2'))))
    )
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('ignores identical tables', () => {
    const oldDoc = doc(
      table(tr(th(text('A')), th(text('B'))), tr(td(text('1')), td(text('2'))))
    )
    const newDoc = doc(
      table(tr(th(text('A')), th(text('B'))), tr(td(text('1')), td(text('2'))))
    )
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes).toHaveLength(0)
  })
})

describe('computeDocDiff - list', () => {
  it('detects new list item', () => {
    const oldDoc = doc(ul(li(p(text('A'))), li(p(text('B')))))
    const newDoc = doc(ul(li(p(text('A'))), li(p(text('B'))), li(p(text('C')))))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
    expect(changes.some((c) => c.fromB < c.toB)).toBe(true)
  })

  it('detects list item text change', () => {
    const oldDoc = doc(ul(li(p(text('old')))))
    const newDoc = doc(ul(li(p(text('new')))))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('detects list item removed', () => {
    const oldDoc = doc(ul(li(p(text('A'))), li(p(text('B'))), li(p(text('C')))))
    const newDoc = doc(ul(li(p(text('A'))), li(p(text('C')))))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
    expect(changes.some((c) => c.fromA < c.toA)).toBe(true)
  })

  it('ignores identical lists', () => {
    const oldDoc = doc(ul(li(p(text('A'))), li(p(text('B')))))
    const newDoc = doc(ul(li(p(text('A'))), li(p(text('B')))))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes).toHaveLength(0)
  })
})
