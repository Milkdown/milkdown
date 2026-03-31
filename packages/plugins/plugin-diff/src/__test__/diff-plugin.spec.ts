import { Schema } from '@milkdown/prose/model'
import { EditorState } from '@milkdown/prose/state'
import { describe, expect, it } from 'vitest'

import type { DiffState } from '../types'

import { computeDocDiff } from '../diff-compute'
import {
  diffPluginKey,
  getPendingChanges,
  isChangeRejected,
} from '../diff-plugin'

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

function createDiffState(
  oldDoc: ReturnType<typeof doc>,
  newDoc: ReturnType<typeof doc>
): DiffState {
  const changes = computeDocDiff(oldDoc, newDoc)
  return {
    newDoc,
    changes,
    rejectedRanges: [],
    active: true,
  }
}

describe('isChangeRejected', () => {
  it('returns false when no rejected ranges', () => {
    expect(isChangeRejected({ fromB: 0, toB: 10 }, [])).toBe(false)
  })

  it('returns true when change overlaps a rejected range', () => {
    expect(
      isChangeRejected({ fromB: 5, toB: 15 }, [{ fromB: 10, toB: 20 }])
    ).toBe(true)
  })

  it('returns true when change is contained within a rejected range', () => {
    expect(
      isChangeRejected({ fromB: 12, toB: 18 }, [{ fromB: 10, toB: 20 }])
    ).toBe(true)
  })

  it('returns false when change is completely before rejected range', () => {
    expect(
      isChangeRejected({ fromB: 0, toB: 5 }, [{ fromB: 10, toB: 20 }])
    ).toBe(false)
  })

  it('returns false when change is completely after rejected range', () => {
    expect(
      isChangeRejected({ fromB: 25, toB: 30 }, [{ fromB: 10, toB: 20 }])
    ).toBe(false)
  })

  it('returns false when change is adjacent but not overlapping', () => {
    expect(
      isChangeRejected({ fromB: 20, toB: 25 }, [{ fromB: 10, toB: 20 }])
    ).toBe(false)
  })
})

describe('getPendingChanges', () => {
  it('returns all changes when no rejections', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('world')))
    const state = createDiffState(oldDoc, newDoc)

    const pending = getPendingChanges(state)
    expect(pending).toHaveLength(state.changes.length)
  })

  it('filters out rejected changes', () => {
    const oldDoc = doc(p(text('aaa')), p(text('bbb')))
    const newDoc = doc(p(text('xxx')), p(text('yyy')))
    const state = createDiffState(oldDoc, newDoc)

    expect(state.changes.length).toBeGreaterThanOrEqual(2)

    // Reject the first change
    const firstChange = state.changes[0]!
    const stateWithRejection: DiffState = {
      ...state,
      rejectedRanges: [{ fromB: firstChange.fromB, toB: firstChange.toB }],
    }

    const pending = getPendingChanges(stateWithRejection)
    expect(pending.length).toBeLessThan(state.changes.length)
    // Rejected change should not be in pending
    expect(pending.every((c) => c !== firstChange)).toBe(true)
  })

  it('returns empty when all changes are rejected', () => {
    const oldDoc = doc(p(text('hello')))
    const newDoc = doc(p(text('world')))
    const state = createDiffState(oldDoc, newDoc)

    // Reject everything with a very wide range
    const stateWithRejection: DiffState = {
      ...state,
      rejectedRanges: [{ fromB: 0, toB: 999 }],
    }

    const pending = getPendingChanges(stateWithRejection)
    expect(pending).toHaveLength(0)
  })
})

describe('acceptAll with rejections', () => {
  it('pending changes exclude rejected ones for selective accept', () => {
    const oldDoc = doc(p(text('first')), p(text('second')), p(text('third')))
    const newDoc = doc(p(text('FIRST')), p(text('SECOND')), p(text('THIRD')))
    const state = createDiffState(oldDoc, newDoc)

    // Reject the second change
    const changes = state.changes
    expect(changes.length).toBeGreaterThanOrEqual(2)

    const secondChange = changes[1]!
    const stateWithRejection: DiffState = {
      ...state,
      rejectedRanges: [{ fromB: secondChange.fromB, toB: secondChange.toB }],
    }

    const pending = getPendingChanges(stateWithRejection)
    // Second change should be filtered out
    expect(pending.length).toBe(changes.length - 1)
    expect(
      pending.some(
        (c) => c.fromB === secondChange.fromB && c.toB === secondChange.toB
      )
    ).toBe(false)
  })
})

describe('rejectRange', () => {
  it('range-based rejection covers multiple sub-changes', () => {
    const oldDoc = doc(p(text('aaa')), p(text('bbb')), p(text('ccc')))
    const newDoc = doc(p(text('xxx')), p(text('yyy')), p(text('zzz')))
    const state = createDiffState(oldDoc, newDoc)

    const allChanges = state.changes
    expect(allChanges.length).toBeGreaterThanOrEqual(2)

    // Reject a wide range covering the first two changes in newDoc
    const rangeEnd = allChanges[1]!.toB
    const stateWithRejection: DiffState = {
      ...state,
      rejectedRanges: [{ fromB: 0, toB: rangeEnd }],
    }

    const pending = getPendingChanges(stateWithRejection)
    // Changes within the rejected range should be filtered
    for (const c of pending) {
      expect(c.toB > rangeEnd || c.fromB >= rangeEnd).toBe(true)
    }
  })
})
