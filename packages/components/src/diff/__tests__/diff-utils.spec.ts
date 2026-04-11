import type { Change } from '@milkdown/prose/changeset'

import { Schema } from '@milkdown/prose/model'
import { describe, expect, it } from 'vitest'

import type { MergedChange } from '../merge-changes'

import {
  hasBlockContent,
  isBlockSpanning,
  trailingEmptyParagraphStart,
} from '../doc-utils'
import {
  anchorTrailingInsertsBeforeEmptyParagraph,
  mergeBlockChanges,
} from '../merge-changes'

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { group: 'block', content: 'inline*', toDOM: () => ['p', 0] },
    text: { group: 'inline' },
    bullet_list: {
      group: 'block',
      content: 'list_item+',
      toDOM: () => ['ul', 0],
    },
    list_item: {
      content: 'paragraph+',
      attrs: { checked: { default: false } },
      toDOM: () => ['li', 0],
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
  },
})

const t = (s: string) => schema.text(s)
const p = (...c: any[]) => schema.node('paragraph', null, c)
const doc = (...c: any[]) => schema.node('doc', null, c)
const li = (attrs: any, ...c: any[]) => schema.node('list_item', attrs, c)
const ul = (...c: any[]) => schema.node('bullet_list', null, c)
const td = (...c: any[]) => schema.node('table_cell', { header: false }, c)
const th = (...c: any[]) => schema.node('table_cell', { header: true }, c)
const row = (...c: any[]) => schema.node('table_row', null, c)
const table = (...r: any[]) => schema.node('table', null, r)

const chg = (fromA: number, toA: number, fromB: number, toB: number): Change =>
  ({ fromA, toA, fromB, toB, deleted: [], inserted: [] }) as unknown as Change

describe('hasBlockContent', () => {
  it('returns false for a 1-char edit inside a list item paragraph', () => {
    // Reproduces the task-list bug: a tiny inline edit inside a list item
    // paragraph used to return true because doc.slice() grabbed the
    // surrounding bullet_list/list_item wrappers as "block content".
    const d = doc(
      ul(
        li({ checked: false }, p(t('hello'))),
        li({ checked: false }, p(t('world')))
      )
    )
    // Inside "hello" — depth 3 (doc > bullet_list > list_item > paragraph).
    // Position 3 is inside the first paragraph.
    expect(hasBlockContent(d, 3, 4)).toBe(false)
  })

  it('returns false for a 1-char attr-token change at a list_item boundary', () => {
    // Reproduces the exact runtime case: replacing the opening token of a
    // list_item (e.g. because its `checked` attribute flipped). The slice
    // contains an open-token list_item wrapper which should NOT count as
    // block content.
    const d = doc(
      ul(li({ checked: false }, p(t('a'))), li({ checked: false }, p(t('b'))))
    )
    // Walk the doc to find a position that sits at the bullet_list depth
    // just before the second list_item — resolve(pos).depth === 1 means we
    // are at the list_item boundary inside the bullet_list.
    let boundaryPos = -1
    for (let i = 1; i < d.content.size; i++) {
      const $p = d.resolve(i)
      if ($p.depth !== 1) continue
      if ($p.parent.type.name !== 'bullet_list') continue
      if ($p.index(1) !== 1) continue
      boundaryPos = i
      break
    }
    expect(boundaryPos).toBeGreaterThan(0)
    expect(hasBlockContent(d, boundaryPos, boundaryPos + 1)).toBe(false)
  })

  it('returns true when a full top-level block is enclosed', () => {
    const d = doc(p(t('first')), p(t('second')))
    // Whole doc range must include a real block.
    expect(hasBlockContent(d, 0, d.content.size)).toBe(true)
  })

  it('returns true when a nested block (paragraph inside list_item) is enclosed', () => {
    const d = doc(
      ul(
        li({ checked: false }, p(t('first'))),
        li({ checked: false }, p(t('second')))
      )
    )
    // Range that covers the entire first list_item's content. This
    // includes a full paragraph as nested block content.
    expect(hasBlockContent(d, 0, d.content.size)).toBe(true)
  })

  it('returns false for a range inside a single textblock', () => {
    const d = doc(p(t('hello world')))
    expect(hasBlockContent(d, 2, 5)).toBe(false)
  })

  it('isBlockSpanning agrees on the list-item boundary case', () => {
    const d = doc(
      ul(li({ checked: false }, p(t('a'))), li({ checked: false }, p(t('b'))))
    )
    // All positions here are inside the same top-level bullet_list, so
    // no top-level block crossing.
    expect(isBlockSpanning(d, 3, 4)).toBe(false)
  })
})

describe('mergeBlockChanges — pure inserts/deletes at custom block boundary', () => {
  const customBlockTypes = new Set(['table'])

  // Build a doc with: paragraph "hello", table, paragraph "after"
  // Position layout:
  //   paragraph "hello": [0, 7]   (open=0, text=1..6, close=7)
  //   table:             [7, ...]
  const oldDoc = doc(p(t('hello')), table(row(th(t('h1'))), row(td(t('v1')))))
  // newDoc is the same but also has a paragraph appended at the end.
  const newDoc = doc(
    p(t('hello')),
    table(row(th(t('h1'))), row(td(t('v1')))),
    p(t('tail'))
  )

  const tableEndA = oldDoc.content.size
  const tableEndB = oldDoc.content.size // table ends at same position in newDoc
  const newDocSize = newDoc.content.size

  it('does not expand a pure insert right after a table into the table', () => {
    // Pure insertion at the END of the old doc (right after the table).
    // fromA === toA === tableEndA.  The inserted content in newDoc starts
    // at tableEndB and extends to newDocSize (the "tail" paragraph).
    const change = chg(tableEndA, tableEndA, tableEndB, newDocSize)
    const merged = mergeBlockChanges([change], oldDoc, newDoc, customBlockTypes)
    expect(merged).toHaveLength(1)
    // The change should NOT have been promoted to a custom-block merge,
    // because the insertion is merely adjacent to the table, not inside it.
    expect(merged[0]!.isCustomBlock).toBe(false)
    // And the range must remain the original pure insertion — no expansion
    // backwards over the table.
    expect(merged[0]!.fromA).toBe(tableEndA)
    expect(merged[0]!.toA).toBe(tableEndA)
    expect(merged[0]!.fromB).toBe(tableEndB)
    expect(merged[0]!.toB).toBe(newDocSize)
  })

  it('does not expand a pure delete right before a table into the table', () => {
    // Pure deletion that removes content ending at the table's start,
    // with fromB === toB at the table's start in newDoc.
    // Build: newDoc has the same table at a later offset (after the
    // "hello" paragraph was inserted). Simulate a pure deletion where
    // fromB === toB sits exactly at the table's start in newDoc.
    const oldD = doc(p(t('xxx')), table(row(th(t('h1'))), row(td(t('v1')))))
    const newD = doc(table(row(th(t('h1'))), row(td(t('v1')))))
    // Deletion of the leading paragraph: fromA=0, toA=paragraph size,
    // fromB=toB=0 in newD (which is the start of the table).
    const paragraphEnd = oldD.child(0).nodeSize
    const change = chg(0, paragraphEnd, 0, 0)
    const merged = mergeBlockChanges([change], oldD, newD, customBlockTypes)
    expect(merged).toHaveLength(1)
    expect(merged[0]!.isCustomBlock).toBe(false)
    expect(merged[0]!.fromA).toBe(0)
    expect(merged[0]!.toA).toBe(paragraphEnd)
    expect(merged[0]!.fromB).toBe(0)
    expect(merged[0]!.toB).toBe(0)
  })

  it('still merges changes that genuinely sit inside a table', () => {
    // A non-pure change whose range actually covers content inside the
    // table should still be promoted to an isCustomBlock merged change.
    // Replace the whole table body: fromA covers the entire table, same
    // in newDoc.
    const oldD = doc(table(row(td(t('a'))), row(td(t('b')))))
    const newD = doc(table(row(td(t('x'))), row(td(t('y')))))
    const change = chg(0, oldD.content.size, 0, newD.content.size)
    const merged = mergeBlockChanges([change], oldD, newD, customBlockTypes)
    expect(merged).toHaveLength(1)
    expect(merged[0]!.isCustomBlock).toBe(true)
  })

  it('produces no overlapping custom-block entries across multiple tables', () => {
    // Invariant check: when multiple seeds touch different tables, the
    // merged output must never contain two custom-block entries whose
    // ranges overlap in either doc. Coalescing walks all existing entries
    // (not just the first) to guarantee this.
    const oldD = doc(
      table(row(td(t('a')))),
      p(t('mid')),
      table(row(td(t('b'))))
    )
    const newD = doc(
      table(row(td(t('A')))),
      p(t('MID')),
      table(row(td(t('B'))))
    )
    const t1End = oldD.child(0).nodeSize
    const midSize = oldD.child(1).nodeSize
    const t2Start = t1End + midSize
    const t2End = t2Start + oldD.child(2).nodeSize
    // Two seeds inside the tables emit independent custom-block merges.
    const seedInT1 = chg(2, 3, 2, 3)
    const seedInT2 = chg(t2Start + 2, t2Start + 3, t2Start + 2, t2Start + 3)
    // A third seed whose range pokes into both tables (last cell of table 1
    // through first cell of table 2). Both endpoints resolve inside a table
    // via their ancestor chain, so mergeBlockChanges expands it.
    const seedAcross = chg(t1End - 1, t2Start + 1, t1End - 1, t2Start + 1)
    const merged = mergeBlockChanges(
      [seedInT1, seedInT2, seedAcross],
      oldD,
      newD,
      customBlockTypes
    )
    // All three seeds should collapse into a single custom-block entry.
    const customEntries = merged.filter((m) => m.isCustomBlock)
    expect(customEntries).toHaveLength(1)
    expect(customEntries[0]!.fromA).toBeLessThanOrEqual(0)
    expect(customEntries[0]!.toA).toBeGreaterThanOrEqual(t2End)
    // And no two entries should overlap in either doc.
    for (let i = 0; i < merged.length; i++) {
      for (let j = i + 1; j < merged.length; j++) {
        const a = merged[i]!
        const b = merged[j]!
        const overlapA = a.fromA < b.toA && a.toA > b.fromA
        const overlapB = a.fromB < b.toB && a.toB > b.fromB
        expect(overlapA || overlapB).toBe(false)
      }
    }
  })

  it('coalesces two changes that expand into the same custom block', () => {
    // Two separate non-empty changes, each overlapping the table on a
    // different side, should collapse into a single merged change —
    // otherwise the decoration plugin renders the new table twice.
    const oldD = doc(
      p(t('head')),
      table(row(td(t('a'))), row(td(t('b')))),
      p(t('tail'))
    )
    const newD = doc(
      p(t('HEAD')),
      table(row(td(t('x'))), row(td(t('y')))),
      p(t('TAIL'))
    )
    // Change 1: start of doc into the first table cell.
    const c1 = chg(1, 8, 1, 8)
    // Change 2: last cell of table into the tail paragraph.
    const c2 = chg(
      oldD.content.size - 7,
      oldD.content.size - 1,
      newD.content.size - 7,
      newD.content.size - 1
    )
    const merged = mergeBlockChanges([c1, c2], oldD, newD, customBlockTypes)
    expect(merged).toHaveLength(1)
    expect(merged[0]!.isCustomBlock).toBe(true)
    // Union range spans both original changes in both docs.
    expect(merged[0]!.fromA).toBeLessThanOrEqual(1)
    expect(merged[0]!.toA).toBeGreaterThanOrEqual(oldD.content.size - 1)
    expect(merged[0]!.fromB).toBeLessThanOrEqual(1)
    expect(merged[0]!.toB).toBeGreaterThanOrEqual(newD.content.size - 1)
  })
})

describe('trailingEmptyParagraphStart', () => {
  it('returns doc.content.size when there is no trailing empty paragraph', () => {
    const d = doc(p(t('hello')), p(t('world')))
    expect(trailingEmptyParagraphStart(d)).toBe(d.content.size)
  })

  it('returns the start of a single trailing empty paragraph', () => {
    const d = doc(p(t('hello')), p())
    const emptySize = d.child(1).nodeSize
    expect(trailingEmptyParagraphStart(d)).toBe(d.content.size - emptySize)
  })

  it('returns the start of multiple trailing empty paragraphs', () => {
    const d = doc(p(t('hello')), p(), p(), p())
    const trailingSize =
      d.child(1).nodeSize + d.child(2).nodeSize + d.child(3).nodeSize
    expect(trailingEmptyParagraphStart(d)).toBe(d.content.size - trailingSize)
  })

  it('returns doc.content.size when last block is a non-empty paragraph', () => {
    const d = doc(p(), p(t('hello')))
    expect(trailingEmptyParagraphStart(d)).toBe(d.content.size)
  })

  it('stops at the first non-paragraph block walking backwards', () => {
    // Empty paragraph after a table is still trailing, but an empty
    // paragraph before a table is not — walking backwards must stop at
    // the table.
    const tableNode = table(row(td(t('a'))))
    const d = doc(p(), tableNode, p())
    const lastEmptySize = d.child(2).nodeSize
    expect(trailingEmptyParagraphStart(d)).toBe(d.content.size - lastEmptySize)
  })
})

describe('anchorTrailingInsertsBeforeEmptyParagraph', () => {
  const mc = (
    fromA: number,
    toA: number,
    fromB: number,
    toB: number
  ): MergedChange => ({ fromA, toA, fromB, toB, isCustomBlock: false })

  it('remaps a pure insert at doc end to before the trailing empty paragraph', () => {
    // Reproduces the New Section regression: an insertion at the doc end
    // must anchor *before* the trailing empty paragraph, otherwise the
    // accept command splices the new content after the empty paragraph
    // and the next recompute renders it as an orphaned block deletion.
    const d = doc(p(t('hello')), p())
    const trailingStart = trailingEmptyParagraphStart(d)
    const changes: MergedChange[] = [mc(d.content.size, d.content.size, 0, 10)]
    anchorTrailingInsertsBeforeEmptyParagraph(changes, d)
    expect(changes[0]!.fromA).toBe(trailingStart)
    expect(changes[0]!.toA).toBe(trailingStart)
  })

  it('leaves inserts before the trailing empty paragraph alone', () => {
    const d = doc(p(t('hello')), p())
    const changes: MergedChange[] = [mc(1, 1, 0, 10)]
    anchorTrailingInsertsBeforeEmptyParagraph(changes, d)
    expect(changes[0]!.fromA).toBe(1)
    expect(changes[0]!.toA).toBe(1)
  })

  it('does not touch non-insert changes (deletions or replacements)', () => {
    const d = doc(p(t('hello')), p())
    const original = mc(d.content.size - 1, d.content.size, 0, 0)
    const changes: MergedChange[] = [{ ...original }]
    anchorTrailingInsertsBeforeEmptyParagraph(changes, d)
    expect(changes[0]).toEqual(original)
  })

  it('is a no-op when the doc has no trailing empty paragraph', () => {
    const d = doc(p(t('hello')), p(t('world')))
    const original = mc(d.content.size, d.content.size, 0, 10)
    const changes: MergedChange[] = [{ ...original }]
    anchorTrailingInsertsBeforeEmptyParagraph(changes, d)
    expect(changes[0]).toEqual(original)
  })

  it('remaps multiple inserts in the trailing empty region', () => {
    const d = doc(p(t('hello')), p())
    const trailingStart = trailingEmptyParagraphStart(d)
    const changes: MergedChange[] = [
      mc(d.content.size, d.content.size, 0, 5),
      mc(d.content.size, d.content.size, 5, 20),
    ]
    anchorTrailingInsertsBeforeEmptyParagraph(changes, d)
    expect(changes[0]!.fromA).toBe(trailingStart)
    expect(changes[1]!.fromA).toBe(trailingStart)
  })
})
