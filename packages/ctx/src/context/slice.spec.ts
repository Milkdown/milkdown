/* Copyright 2021, Milkdown by Mirone. */
import { describe, expect, it } from 'vitest'

import { createSlice } from './slice'

describe('context/slice', () => {
  it('primitive slice', () => {
    const factory = createSlice(0, 'primitive')
    const map = new Map()
    const ctx = factory(map)

    expect(factory.sliceName).toBe('primitive')
    expect(factory.id).toBeTypeOf('symbol')
    expect(ctx.name).toBe('primitive')
    expect(ctx.id).toBe(factory.id)

    expect(ctx.get()).toBe(0)

    ctx.set(20)
    expect(ctx.get()).toBe(20)

    ctx.update(x => x + 1)
    expect(ctx.get()).toBe(21)
  })

  it('structure slice', () => {
    const factory = createSlice<number[]>([], 'structure')
    expect(factory.sliceName).toBe('structure')

    const map1 = new Map()
    const ctx1 = factory(map1)
    expect(ctx1.id).toBe(factory.id)

    expect(ctx1.name).toBe('structure')

    const map2 = new Map()
    const ctx2 = factory(map2)

    expect(ctx2.name).toBe('structure')
    expect(ctx2.id).toBe(factory.id)

    expect(ctx1.get()).toEqual([])
    ctx1.set([1])
    expect(ctx1.get()).toEqual([1])

    expect(ctx2.get()).toEqual([])

    ctx1.update(x => x.concat(3))
    expect(ctx1.get()).toEqual([1, 3])

    expect(ctx2.get()).toEqual([])
  })
})
