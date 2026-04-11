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
    link: {
      attrs: { href: { default: '' }, title: { default: null } },
      toDOM: (mark: any) => ['a', { href: mark.attrs.href }, 0],
    },
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

  it('detects heading level-only change', () => {
    const oldDoc = doc(heading(1, text('Title')))
    const newDoc = doc(heading(2, text('Title')))
    const changes = computeDocDiff(oldDoc, newDoc)
    // Without ignoreAttrs, all non-default attrs are encoded, so the
    // level change is detected.
    expect(changes.length).toBeGreaterThan(0)
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

describe('computeDocDiff - marks', () => {
  it('detects bold added', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('hello', [schema.marks.bold.create()])))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('detects bold removed', () => {
    const oldDoc = doc(p(text('hello', [schema.marks.bold.create()])))
    const newDoc = doc(p(text('hello')))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('detects mark type change (bold to italic)', () => {
    const oldDoc = doc(p(text('hello', [schema.marks.bold.create()])))
    const newDoc = doc(p(text('hello', [schema.marks.italic.create()])))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('ignores identical marks', () => {
    const oldDoc = doc(p(text('hello', [schema.marks.bold.create()])))
    const newDoc = doc(p(text('hello', [schema.marks.bold.create()])))
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes).toHaveLength(0)
  })

  it('detects link href change', () => {
    const oldDoc = doc(
      p(text('click', [schema.marks.link.create({ href: 'https://old.com' })]))
    )
    const newDoc = doc(
      p(text('click', [schema.marks.link.create({ href: 'https://new.com' })]))
    )
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)
  })

  it('ignores identical links', () => {
    const oldDoc = doc(
      p(text('click', [schema.marks.link.create({ href: 'https://same.com' })]))
    )
    const newDoc = doc(
      p(text('click', [schema.marks.link.create({ href: 'https://same.com' })]))
    )
    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes).toHaveLength(0)
  })
})

describe('computeDocDiff - range-limited', () => {
  it('detects changes only within specified range', () => {
    // Same-size docs so a full-doc range is unambiguous in both.
    const oldDoc = doc(p(text('first')), p(text('second')), p(text('third')))
    const newDoc = doc(p(text('first')), p(text('SECOND')), p(text('third')))
    // Full diff should find changes
    const fullChanges = computeDocDiff(oldDoc, newDoc)
    expect(fullChanges.length).toBeGreaterThan(0)

    // Range covering the full doc should also find changes
    const rangedChanges = computeDocDiff(oldDoc, newDoc, {
      range: { from: 0, to: oldDoc.content.size },
    })
    expect(rangedChanges.length).toBeGreaterThan(0)
  })

  it('defaults omitted range fields to full document', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('hello world')))

    // Empty range object = full doc defaults
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes.length).toBeGreaterThan(0)
  })

  it('returns empty for identical range', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('hello')))
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes).toHaveLength(0)
  })

  it('sub-range excludes changes outside the range', () => {
    // Three paragraphs: first and third are changed, second is unchanged
    const oldDoc = doc(p(text('AAA')), p(text('BBB')), p(text('CCC')))
    const newDoc = doc(p(text('XXX')), p(text('BBB')), p(text('ZZZ')))

    // Full diff finds changes in both first and third paragraphs
    const fullChanges = computeDocDiff(oldDoc, newDoc)
    expect(fullChanges.length).toBeGreaterThanOrEqual(2)

    // Sub-range covering only the second paragraph (unchanged) — no changes
    // p1 nodeSize=5 (open+AAA+close), so p2 starts at pos 5 and ends at pos 10
    const subChanges = computeDocDiff(oldDoc, newDoc, {
      range: { from: 5, to: 10 },
    })
    expect(subChanges).toHaveLength(0)
  })

  it('sub-range detects changes within the range', () => {
    // Three paragraphs: only the second is changed
    const oldDoc = doc(p(text('AAA')), p(text('BBB')), p(text('CCC')))
    const newDoc = doc(p(text('AAA')), p(text('XXX')), p(text('CCC')))

    // Sub-range covering the second paragraph — should find the change
    const changes = computeDocDiff(oldDoc, newDoc, {
      range: { from: 5, to: 10 },
    })
    expect(changes.length).toBeGreaterThan(0)
  })

  it('range is clamped to document bounds', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('hello')))

    // Out-of-bounds range should not throw
    const changes = computeDocDiff(oldDoc, newDoc, {
      range: { from: -5, to: 9999 },
    })
    expect(changes).toHaveLength(0)
  })
})

describe('computeDocDiff - range-limited with custom-view blocks', () => {
  it('range diff with code block content change', () => {
    const oldDoc = doc(
      p(text('before')),
      codeBlock('const x = 1'),
      p(text('after'))
    )
    const newDoc = doc(
      p(text('before')),
      codeBlock('const x = 2'),
      p(text('after'))
    )
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes.length).toBeGreaterThan(0)
  })

  it('range diff with code block added', () => {
    const oldDoc = doc(p(text('before')), p(text('after')))
    const newDoc = doc(
      p(text('before')),
      codeBlock('new code'),
      p(text('after'))
    )
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes.length).toBeGreaterThan(0)
  })

  it('range diff with image src change', () => {
    const oldDoc = doc(p(text('text')), image('old.png'))
    const newDoc = doc(p(text('text')), image('new.png'))
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes.length).toBeGreaterThan(0)
  })

  it('range diff with image added between paragraphs', () => {
    const oldDoc = doc(p(text('before')), p(text('after')))
    const newDoc = doc(p(text('before')), image('photo.png'), p(text('after')))
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes.length).toBeGreaterThan(0)
  })

  it('range diff with table cell change', () => {
    const oldDoc = doc(
      p(text('intro')),
      table(tr(th(text('A'))), tr(td(text('1')))),
      p(text('outro'))
    )
    const newDoc = doc(
      p(text('intro')),
      table(tr(th(text('A'))), tr(td(text('X')))),
      p(text('outro'))
    )
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes.length).toBeGreaterThan(0)
  })

  it('range diff with table row added', () => {
    const oldDoc = doc(table(tr(td(text('A')))))
    const newDoc = doc(table(tr(td(text('A'))), tr(td(text('B')))))
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes.length).toBeGreaterThan(0)
  })

  it('range diff with list item added', () => {
    const oldDoc = doc(ul(li(p(text('A')))))
    const newDoc = doc(ul(li(p(text('A'))), li(p(text('B')))))
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes.length).toBeGreaterThan(0)
  })

  it('range diff preserves surrounding unchanged code blocks', () => {
    const oldDoc = doc(
      codeBlock('unchanged'),
      p(text('old text')),
      codeBlock('also unchanged')
    )
    const newDoc = doc(
      codeBlock('unchanged'),
      p(text('new text')),
      codeBlock('also unchanged')
    )
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes.length).toBeGreaterThan(0)
    // The middle paragraph sits between the two code blocks.
    // Verify all changes fall within the paragraph's range.
    const paraStart = oldDoc.child(0).nodeSize // after first code block
    const paraEnd = paraStart + oldDoc.child(1).nodeSize // end of paragraph
    for (const change of changes) {
      expect(change.fromA).toBeGreaterThanOrEqual(paraStart)
      expect(change.toA).toBeLessThanOrEqual(paraEnd)
    }
  })

  it('range diff with mixed block types unchanged', () => {
    const oldDoc = doc(
      p(text('text')),
      codeBlock('code'),
      image('img.png'),
      table(tr(td(text('cell')))),
      ul(li(p(text('item'))))
    )
    const newDoc = doc(
      p(text('text')),
      codeBlock('code'),
      image('img.png'),
      table(tr(td(text('cell')))),
      ul(li(p(text('item'))))
    )
    const changes = computeDocDiff(oldDoc, newDoc, {})
    expect(changes).toHaveLength(0)
  })
})

describe('computeDocDiff - ignoreAttrs', () => {
  const schemaWithId = new Schema({
    nodes: {
      doc: { content: 'block+' },
      paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
      heading: {
        group: 'block',
        content: 'inline*',
        attrs: { level: { default: 1 }, id: { default: '' } },
        toDOM: (node) => [`h${node.attrs.level}`, 0],
      },
      text: { group: 'inline' },
    },
  })

  function docId(...children: any[]) {
    return schemaWithId.node('doc', null, children)
  }

  function headingId(level: number, id: string, ...content: any[]) {
    return schemaWithId.node('heading', { level, id }, content)
  }

  function textId(str: string) {
    return schemaWithId.text(str)
  }

  it('ignores specific attrs via ignoreAttrs config', () => {
    // Without ignoreAttrs, an id change on heading produces a diff
    const oldDoc = docId(headingId(1, 'old-id', textId('Title')))
    const newDoc = docId(headingId(1, 'new-id', textId('Title')))

    const changesWithoutIgnore = computeDocDiff(oldDoc, newDoc)
    expect(changesWithoutIgnore.length).toBeGreaterThan(0)

    // With ignoreAttrs: { heading: ['id'] }, the id change is ignored
    const changesWithIgnore = computeDocDiff(oldDoc, newDoc, {
      ignoreAttrs: { heading: ['id'] },
    })
    expect(changesWithIgnore).toHaveLength(0)
  })

  it('still detects non-ignored attr changes', () => {
    // Level changes should still be detected even when id is ignored
    const oldDoc = docId(headingId(2, 'same-id', textId('Title')))
    const newDoc = docId(headingId(3, 'same-id', textId('Title')))

    const changes = computeDocDiff(oldDoc, newDoc, {
      ignoreAttrs: { heading: ['id'] },
    })
    expect(changes.length).toBeGreaterThan(0)
  })

  it('still detects text changes when attrs are ignored', () => {
    const oldDoc = docId(headingId(1, 'id-a', textId('Old Title')))
    const newDoc = docId(headingId(1, 'id-b', textId('New Title')))

    const changes = computeDocDiff(oldDoc, newDoc, {
      ignoreAttrs: { heading: ['id'] },
    })
    expect(changes.length).toBeGreaterThan(0)
  })
})

describe('computeDocDiff - per-block matching', () => {
  it('independent paragraph edits produce separate non-overlapping changes', () => {
    const oldDoc = doc(p(text('AAA')), p(text('BBB')), p(text('CCC')))
    const newDoc = doc(p(text('XXX')), p(text('BBB')), p(text('ZZZ')))

    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThanOrEqual(2)

    // Sorted and non-overlapping
    for (let i = 1; i < changes.length; i++) {
      expect(changes[i]!.fromA).toBeGreaterThanOrEqual(changes[i - 1]!.toA)
      expect(changes[i]!.fromB).toBeGreaterThanOrEqual(changes[i - 1]!.toB)
    }

    // p1 nodeSize=5 (open+AAA+close), p2 spans [5, 10], p3 spans [10, 15]
    // None of the changes should touch the middle paragraph at [5, 10]
    for (const change of changes) {
      const overlapsMiddle = change.fromA < 10 && change.toA > 5
      expect(overlapsMiddle).toBe(false)
    }
  })

  it('insertion between unchanged paragraphs is a pure insert', () => {
    const oldDoc = doc(p(text('A')), p(text('C')))
    const newDoc = doc(p(text('A')), p(text('B')), p(text('C')))

    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBe(1)

    const change = changes[0]!
    // Pure insert: fromA === toA
    expect(change.fromA).toBe(change.toA)
    // fromB < toB: insertion
    expect(change.fromB).toBeLessThan(change.toB)
  })

  it('deletion between unchanged paragraphs is a pure delete', () => {
    const oldDoc = doc(p(text('A')), p(text('B')), p(text('C')))
    const newDoc = doc(p(text('A')), p(text('C')))

    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBe(1)

    const change = changes[0]!
    // Pure delete: fromB === toB
    expect(change.fromB).toBe(change.toB)
    // fromA < toA: deletion
    expect(change.fromA).toBeLessThan(change.toA)
  })

  it('list item text edit recurses into the list', () => {
    // bullet_list is a single top-level child, but our algorithm recurses
    // into container nodes. Editing one item's text should produce a small
    // change inside that item, not a huge one covering the whole list.
    const oldDoc = doc(ul(li(p(text('one'))), li(p(text('two')))))
    const newDoc = doc(ul(li(p(text('ONE'))), li(p(text('two')))))

    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)

    // The change(s) should not cover the entire bullet_list
    // bullet_list nodeSize for 2 items with one word each is quite small,
    // but the whole-list replacement would span [0, ul.nodeSize]
    const listOuterSize = oldDoc.child(0).nodeSize
    for (const change of changes) {
      // No single change should span the entire list
      expect(change.toA - change.fromA).toBeLessThan(listOuterSize)
    }
  })

  it('list item text edit + new list item produces two separate changes', () => {
    // The main regression test: modifying an item AND adding a new one
    // should produce two changes, not one big merged change.
    const oldDoc = doc(ul(li(p(text('one'))), li(p(text('two')))))
    const newDoc = doc(
      ul(li(p(text('ONE'))), li(p(text('two'))), li(p(text('three'))))
    )

    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThanOrEqual(2)

    // Sorted and non-overlapping
    for (let i = 1; i < changes.length; i++) {
      expect(changes[i]!.fromA).toBeGreaterThanOrEqual(changes[i - 1]!.toA)
    }
  })

  it('nested list item text edit recurses into the inner paragraph', () => {
    // Regression test for recursion through nested container nodes using
    // the existing ul/li/p structure from this test schema.
    const oldDoc = doc(ul(li(p(text('hello world')))))
    const newDoc = doc(ul(li(p(text('hello universe')))))

    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)

    // The change should be inside the inner paragraph, not the whole list
    const listOuterSize = oldDoc.child(0).nodeSize
    for (const change of changes) {
      expect(change.toA - change.fromA).toBeLessThan(listOuterSize)
    }
  })

  it('unchanged middle block is not touched by diffs', () => {
    const oldDoc = doc(
      heading(1, text('Title')),
      p(text('middle')),
      heading(2, text('End'))
    )
    const newDoc = doc(
      heading(1, text('TITLE')),
      p(text('middle')),
      heading(2, text('END'))
    )

    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThanOrEqual(2)

    // Middle paragraph 'middle' starts after h1 (nodeSize 7: open + 'Title' + close)
    // h1 nodeSize = 7, so p starts at 7, p nodeSize = 8, p ends at 15
    const h1Size = oldDoc.child(0).nodeSize
    const pSize = oldDoc.child(1).nodeSize
    const pStart = h1Size
    const pEnd = pStart + pSize
    for (const change of changes) {
      const overlapsMiddle = change.fromA < pEnd && change.toA > pStart
      expect(overlapsMiddle).toBe(false)
    }
  })

  it('table cell edit recurses into the table', () => {
    const oldDoc = doc(
      table(tr(td(text('A')), td(text('B'))), tr(td(text('1')), td(text('2'))))
    )
    const newDoc = doc(
      table(tr(td(text('A')), td(text('B'))), tr(td(text('1')), td(text('X'))))
    )

    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)

    // The change should be smaller than the entire table
    const tableSize = oldDoc.child(0).nodeSize
    for (const change of changes) {
      expect(change.toA - change.fromA).toBeLessThan(tableSize)
    }
  })

  it('reordering produces smaller changes than full replacement', () => {
    const oldDoc = doc(p(text('A')), p(text('B')), p(text('C')))
    const newDoc = doc(p(text('B')), p(text('A')), p(text('C')))

    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)

    // Sorted and non-overlapping
    for (let i = 1; i < changes.length; i++) {
      expect(changes[i]!.fromA).toBeGreaterThanOrEqual(changes[i - 1]!.toA)
    }
  })

  it('changes are sorted and non-overlapping (invariant)', () => {
    // Complex case with many independent edits
    const oldDoc = doc(
      heading(1, text('Title')),
      p(text('intro')),
      ul(li(p(text('a'))), li(p(text('b')))),
      p(text('outro'))
    )
    const newDoc = doc(
      heading(2, text('Title')), // level change
      p(text('intro updated')),
      ul(li(p(text('A'))), li(p(text('b'))), li(p(text('c')))),
      p(text('outro'))
    )

    const changes = computeDocDiff(oldDoc, newDoc)
    expect(changes.length).toBeGreaterThan(0)

    for (let i = 1; i < changes.length; i++) {
      expect(changes[i]!.fromA).toBeGreaterThanOrEqual(changes[i - 1]!.toA)
      expect(changes[i]!.fromB).toBeGreaterThanOrEqual(changes[i - 1]!.toB)
    }
  })
})

describe('computeDocDiff - range option, per-block', () => {
  it('sub-range produces per-block granular changes (not one merged change)', () => {
    // Crown-jewel test for the per-block range path. Two adjacent list
    // items inside the same bullet_list both change. Under the legacy
    // single-step path the changeset library merges adjacent edits
    // inside one container into a single change covering the whole ul;
    // per-block must surface them as independent changes anchored to
    // each li.
    const oldDoc = doc(
      p(text('header')),
      ul(li(p(text('a'))), li(p(text('b'))), li(p(text('c'))))
    )
    const newDoc = doc(
      p(text('header')),
      ul(li(p(text('A'))), li(p(text('B'))), li(p(text('c'))))
    )

    // p('header') nodeSize = 8; ul nodeSize = 17 (3 li @ 5 each + 2).
    // Range covers exactly the ul: from = 8, to = 25.
    const changes = computeDocDiff(oldDoc, newDoc, {
      range: { from: 8, to: 25 },
    })

    expect(changes.length).toBeGreaterThanOrEqual(2)
    for (const change of changes) {
      expect(change.fromA).toBeGreaterThanOrEqual(8)
      expect(change.toA).toBeLessThanOrEqual(25)
      expect(change.fromB).toBeGreaterThanOrEqual(8)
      expect(change.toB).toBeLessThanOrEqual(25)
      // No single change should span both modified list items (which
      // would be the legacy merging behaviour). Each li is 5 wide.
      expect(change.toA - change.fromA).toBeLessThan(10)
    }
  })

  it('sub-range inside a list matches list-item boundaries', () => {
    // Exercises a non-doc shared ancestor (the bullet_list).
    const oldDoc = doc(ul(li(p(text('a'))), li(p(text('b'))), li(p(text('c')))))
    const newDoc = doc(ul(li(p(text('a'))), li(p(text('X'))), li(p(text('c')))))

    // ul content starts at pos 1; li1 [1,6), li2 [6,11), li3 [11,16).
    // Range covers exactly li2.
    const changes = computeDocDiff(oldDoc, newDoc, {
      range: { from: 6, to: 11 },
    })

    expect(changes.length).toBeGreaterThan(0)
    for (const change of changes) {
      expect(change.fromA).toBeGreaterThanOrEqual(6)
      expect(change.toA).toBeLessThanOrEqual(11)
    }
  })

  it('sub-range exactly aligned with one unchanged block returns no changes', () => {
    // Same shape as the legacy `sub-range excludes changes outside the
    // range` test — must keep working under the per-block path.
    const oldDoc = doc(p(text('AAA')), p(text('BBB')), p(text('CCC')))
    const newDoc = doc(p(text('XXX')), p(text('BBB')), p(text('ZZZ')))

    const changes = computeDocDiff(oldDoc, newDoc, {
      range: { from: 5, to: 10 },
    })
    expect(changes).toHaveLength(0)
  })

  it('sub-range mid-textblock throws RangeError', () => {
    // Range endpoints inside a single paragraph → shared ancestor is a
    // textblock → strict preconditions reject the range. Callers must
    // widen the range to a block boundary.
    const oldDoc = doc(p(text('hello world')))
    const newDoc = doc(p(text('hello brave world')))

    expect(() =>
      computeDocDiff(oldDoc, newDoc, { range: { from: 4, to: 8 } })
    ).toThrow(RangeError)
  })

  it('sub-range with sharedDepth divergence throws RangeError', () => {
    // Same numeric range resolves to a different sharedDepth in old vs
    // new, so the strict preconditions reject the range.
    //
    // In oldDoc (single paragraph 'hi there'), positions 3 and 4 both
    // resolve inside the paragraph at depth 1, so sharedDepth = 1.
    //
    // In newDoc (two paragraphs 'hi' and ' there'), p('hi').nodeSize = 4,
    // so position 3 is inside p1 at depth 1 but position 4 sits at the
    // boundary between paragraphs at depth 0, so sharedDepth = 0.
    const oldDoc = doc(p(text('hi there')))
    const newDoc = doc(p(text('hi')), p(text(' there')))

    expect(() =>
      computeDocDiff(oldDoc, newDoc, { range: { from: 3, to: 4 } })
    ).toThrow(RangeError)
  })

  it('out-of-bounds range is silently clamped to the smaller doc', () => {
    // Raw `to` is past the end of the smaller doc; the API clamps both
    // endpoints to the smaller doc's size and runs per-block strictly
    // within. The "extra" content of the larger doc is outside the
    // (clamped) range and is correctly invisible to the diff.
    const oldDoc = doc(p(text('hi')))
    const newDoc = doc(p(text('hi')), p(text('extra')))

    const changes = computeDocDiff(oldDoc, newDoc, {
      range: { from: 0, to: 50 },
    })
    // Inside the clamped window [0, 4], both docs are identical.
    expect(changes).toHaveLength(0)
  })

  it('sub-range with mismatched ancestor start position throws RangeError', () => {
    // Both docs have a bullet_list with the same children, but the
    // prefix paragraph differs in size, so the ul sits at different
    // absolute positions in the two docs. The same numeric range
    // [16, 21] still resolves to depth 1 inside the ul in both docs
    // (sharedDepth = 1) and lies on li boundaries in both, but
    //
    //   $oldFrom.start(1) = 11   (old ul.content starts at 11)
    //   $newFrom.start(1) = 16   (new ul.content starts at 16)
    //
    // Without the absolute-start check the cut would use mismatched
    // local offsets and silently compare the wrong content; the strict
    // preconditions throw a RangeError instead.
    const oldDoc = doc(
      p(text('xxxxxxxx')),
      ul(li(p(text('a'))), li(p(text('b'))))
    )
    const newDoc = doc(
      p(text('xxxxxxxxxxxxx')),
      ul(li(p(text('a'))), li(p(text('b'))))
    )

    expect(() =>
      computeDocDiff(oldDoc, newDoc, { range: { from: 16, to: 21 } })
    ).toThrow(RangeError)
  })

  it('empty sub-range returns no changes', () => {
    const oldDoc = doc(p(text('a')), p(text('b')))
    const newDoc = doc(p(text('a')), p(text('B')))

    const changes = computeDocDiff(oldDoc, newDoc, {
      range: { from: 3, to: 3 },
    })
    expect(changes).toHaveLength(0)
  })

  it('sub-range changes are sorted and non-overlapping', () => {
    // Two adjacent paragraphs change inside the range; the per-block
    // path must keep its sorted, non-overlapping invariant for both
    // axes (mergeBlockChanges depends on it).
    const oldDoc = doc(p(text('A')), p(text('B')), p(text('C')), p(text('D')))
    const newDoc = doc(p(text('A')), p(text('X')), p(text('Y')), p(text('D')))

    const changes = computeDocDiff(oldDoc, newDoc, {
      range: { from: 3, to: 9 },
    })
    expect(changes.length).toBeGreaterThanOrEqual(2)
    for (let i = 1; i < changes.length; i++) {
      expect(changes[i]!.fromA).toBeGreaterThanOrEqual(changes[i - 1]!.toA)
      expect(changes[i]!.fromB).toBeGreaterThanOrEqual(changes[i - 1]!.toB)
    }
  })
})

// Schema with a container node (`blockquote`) carrying attrs, used for
// the encoder/ignoreAttrs precondition tests below. The main test schema
// has no container node with attrs, so we need a small bespoke schema
// to exercise the ancestor-encoder check.
describe('computeDocDiff - range option, ancestor attrs precondition', () => {
  const blockquoteSchema = new Schema({
    nodes: {
      doc: { content: 'block+' },
      paragraph: {
        group: 'block',
        content: 'inline*',
        toDOM: () => ['p', 0],
      },
      text: { group: 'inline' },
      blockquote: {
        group: 'block',
        content: 'block+',
        attrs: { kind: { default: 'default' } },
        toDOM: () => ['blockquote', 0],
      },
    },
  })

  const docBQ = (...children: any[]) =>
    blockquoteSchema.node('doc', null, children)
  const pBQ = (...content: any[]) =>
    blockquoteSchema.node('paragraph', null, content)
  const tBQ = (str: string) => blockquoteSchema.text(str)
  const blockquote = (kind: string, ...content: any[]) =>
    blockquoteSchema.node('blockquote', { kind }, content)

  // Both docs share an outer blockquote whose `kind` attr differs but
  // whose inner content is identical. Range covers the inner two
  // paragraphs (boundary-aligned at the blockquote's content level).
  // Position math:
  //   p('a') and p('b') each nodeSize = 3, blockquote.content = 6,
  //   blockquote.nodeSize = 8, doc.content.size = 8.
  //   Range [1, 7] is inside blockquote.content at depth 1 in both docs.

  it('honours ignoreAttrs on ancestor and runs the per-block path', () => {
    // The ancestor blockquote's `kind` differs ('note' vs 'warning'),
    // but ignoreAttrs tells the encoder to skip it. encodeNodeStart
    // returns the same string for both ancestors → precondition passes
    // → per-block runs → no changes (the inner paragraphs are equal).
    const oldDoc = docBQ(blockquote('note', pBQ(tBQ('a')), pBQ(tBQ('b'))))
    const newDoc = docBQ(blockquote('warning', pBQ(tBQ('a')), pBQ(tBQ('b'))))

    const changes = computeDocDiff(oldDoc, newDoc, {
      range: { from: 1, to: 7 },
      ignoreAttrs: { blockquote: ['kind'] },
    })
    expect(changes).toHaveLength(0)
  })

  it('throws RangeError when a non-ignored ancestor attr differs', () => {
    // Same docs as above but without ignoreAttrs. encodeNodeStart now
    // returns different strings for the two blockquotes, so the
    // precondition rejects the range.
    const oldDoc = docBQ(blockquote('note', pBQ(tBQ('a')), pBQ(tBQ('b'))))
    const newDoc = docBQ(blockquote('warning', pBQ(tBQ('a')), pBQ(tBQ('b'))))

    expect(() =>
      computeDocDiff(oldDoc, newDoc, { range: { from: 1, to: 7 } })
    ).toThrow(RangeError)
  })
})
