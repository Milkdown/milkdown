import type { Node, Schema } from '@milkdown/prose/model'

import { describe, expect, it } from 'vitest'

import {
  collectStyleSequence,
  calculateOptimalNesting,
  type StylePosition,
} from './mark-optimizer'

describe('Mark Optimizer', () => {
  it('should collect style sequence from fake fragment', () => {
    const mockNodes: Node[] = [
      {
        isText: true,
        marks: [{ type: { name: 'strong' } }, { type: { name: 'emphasis' } }],
        text: 'test',
      } as any,
      {
        isText: true,
        marks: [{ type: { name: 'strong' } }],
        text: 'more',
      } as any,
    ]

    const fakeFragment = {
      forEach: (callback: (node: Node) => void) => {
        mockNodes.forEach(callback)
      },
    }

    const sequence = collectStyleSequence(fakeFragment)

    expect(sequence).toHaveLength(2)
    expect(sequence[0]?.marks).toContain('strong')
    expect(sequence[0]?.marks).toContain('emphasis')
    expect(sequence[1]?.marks).toContain('strong')
    expect(sequence[1]?.marks).not.toContain('emphasis')
  })

  it('should calculate optimal nesting with priorities', () => {
    const mockSequence = [
      {
        position: 0,
        marks: new Set(['strong', 'emphasis']),
        node: {},
        markObjects: [],
      },
      {
        position: 1,
        marks: new Set(['strong']),
        node: {},
        markObjects: [],
      },
    ] as unknown as StylePosition[]

    const mockSchema = {
      marks: {
        strong: { spec: { priority: 60 } },
        emphasis: { spec: { priority: 40 } },
      },
    } as unknown as Schema

    const result = calculateOptimalNesting(mockSequence, {}, mockSchema)

    expect(result).toHaveLength(2)
    expect(result[0]?.orderedMarks).toContain('emphasis')
    expect(result[0]?.orderedMarks).toContain('strong')
    expect(result[1]?.orderedMarks).toEqual(['strong'])
  })

  it('should handle empty sequence', () => {
    const mockSchema = { marks: {} } as Schema
    const result = calculateOptimalNesting([], {}, mockSchema)
    expect(result).toEqual([])
  })

  it('should optimize complex nesting scenario - avoid redundant delimiters', () => {
    // Simulates the problem: ***abc*def**
    // Without optimization: ***abc*** + ***def** = redundant *** operations
    // With optimization: should minimize transitions
    const mockSequence = [
      {
        position: 0,
        marks: new Set(['strong', 'emphasis']), // Both bold and italic
        node: { text: 'abc' },
        markObjects: [],
      },
      {
        position: 1,
        marks: new Set(['strong']), // Only bold - this causes the issue
        node: { text: 'def' },
        markObjects: [],
      },
    ] as unknown as StylePosition[]

    const mockSchema = {
      marks: {
        strong: { spec: { priority: 60 } },
        emphasis: { spec: { priority: 40 } },
      },
    } as unknown as Schema

    const result = calculateOptimalNesting(mockSequence, {}, mockSchema)

    expect(result).toHaveLength(2)

    expect(result[0]?.orderedMarks).toContain('strong')
    expect(result[0]?.orderedMarks).toContain('emphasis')
    expect(result[1]?.orderedMarks).toEqual(['strong'])

    expect(result[0]?.cost).toBeDefined()
    expect(result[1]?.cost).toBeDefined()
  })

  it('should handle multiple mark transitions efficiently', () => {
    // Test case: [bold+italic] -> [bold] -> [bold+code] -> [code]
    // This tests the DP algorithm's ability to find globally optimal solution
    const mockSequence = [
      {
        position: 0,
        marks: new Set(['strong', 'emphasis']),
        node: { text: 'text1' } as any,
        markObjects: [],
      },
      {
        position: 1,
        marks: new Set(['strong']),
        node: { text: 'text2' } as any,
        markObjects: [],
      },
      {
        position: 2,
        marks: new Set(['strong', 'code']),
        node: { text: 'text3' } as any,
        markObjects: [],
      },
      {
        position: 3,
        marks: new Set(['code']),
        node: { text: 'text4' } as any,
        markObjects: [],
      },
    ]

    const mockSchema = {
      marks: {
        strong: { spec: { priority: 60 } },
        emphasis: { spec: { priority: 40 } },
        code: { spec: { priority: 70 } },
      },
    } as unknown as Schema

    const result = calculateOptimalNesting(mockSequence, {}, mockSchema)

    expect(result).toHaveLength(4)

    result.forEach((ordering, index) => {
      expect(ordering?.position).toBe(index)
      expect(ordering?.orderedMarks).toBeDefined()
      expect(Array.isArray(ordering?.orderedMarks)).toBe(true)
    })

    expect(result[0]?.orderedMarks).toEqual(
      expect.arrayContaining(['strong', 'emphasis'])
    )
    expect(result[1]?.orderedMarks).toEqual(['strong'])
    expect(result[2]?.orderedMarks).toEqual(
      expect.arrayContaining(['strong', 'code'])
    )
    expect(result[3]?.orderedMarks).toEqual(['code'])
  })

  it('should respect mark priorities in optimal solution', () => {
    const mockSequence = [
      {
        position: 0,
        marks: new Set(['code', 'emphasis', 'strong']), // All three marks
        node: { text: 'text' } as any,
        markObjects: [],
      },
    ]

    const mockSchema = {
      marks: {
        strong: { spec: { priority: 60 } }, // Middle priority
        emphasis: { spec: { priority: 40 } }, // Lower priority (should be inner)
        code: { spec: { priority: 70 } }, // Higher priority (should be outer)
      },
    } as unknown as Schema

    const result = calculateOptimalNesting(mockSequence, {}, mockSchema)

    expect(result).toHaveLength(1)
    expect(result[0]?.orderedMarks).toHaveLength(3)

    const ordering = result[0]?.orderedMarks || []

    expect(ordering).toContain('emphasis')
    expect(ordering).toContain('strong')
    expect(ordering).toContain('code')
  })
})
