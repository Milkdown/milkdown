/* Copyright 2021, Milkdown by Mirone. */
import { describe, expect, it } from 'vitest'

import { SliceType } from './slice'

describe('context/slice', () => {
  it('primitive slice', () => {
    const sliceType = new SliceType(0, 'primitive')
    const map = new Map()
    const ctx = sliceType.create(map)

    expect(sliceType.name).toBe('primitive')
    expect(sliceType.id).toBeTypeOf('symbol')
    expect(ctx.type.name).toBe('primitive')
    expect(ctx.type.id).toBe(sliceType.id)

    expect(ctx.get()).toBe(0)

    ctx.set(20)
    expect(ctx.get()).toBe(20)

    ctx.update(x => x + 1)
    expect(ctx.get()).toBe(21)
  })

  it('structure slice', () => {
    const sliceType = new SliceType<number[], 'structure'>([], 'structure')
    expect(sliceType.name).toBe('structure')

    const map1 = new Map()
    const slice1 = sliceType.create(map1)
    expect(slice1.type.id).toBe(sliceType.id)

    expect(slice1.type.name).toBe('structure')

    const map2 = new Map()
    const slice2 = sliceType.create(map2)

    expect(slice2.type.name).toBe('structure')
    expect(slice2.type.id).toBe(sliceType.id)

    expect(slice1.get()).toEqual([])
    slice1.set([1])
    expect(slice1.get()).toEqual([1])

    expect(slice2.get()).toEqual([])

    slice1.update(x => x.concat(3))
    expect(slice1.get()).toEqual([1, 3])

    expect(slice2.get()).toEqual([])
  })
})
