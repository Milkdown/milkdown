import { describe, expect, it, vi } from 'vitest'

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

    ctx.update((x) => x + 1)
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

    slice1.update((x) => x.concat(3))
    expect(slice1.get()).toEqual([1, 3])

    expect(slice2.get()).toEqual([])
  })

  it('add watcher for slice', () => {
    const sliceType = new SliceType(0, 'primitive')
    const map = new Map()
    const ctx = sliceType.create(map)

    let recordedValue1: number
    let recordedValue2: number
    let recordedValue3: number
    let recordedValue4: number
    const watcher1 = vi.fn((value: number) => {
      recordedValue1 = value
    })
    const watcher2 = vi.fn((value: number) => {
      recordedValue2 = value
    })
    const watcher3 = vi.fn((value: number) => {
      recordedValue3 = value
    })
    const watcher4 = vi.fn((value: number) => {
      recordedValue4 = value
    })
    const off = ctx.on(watcher1)
    ctx.on(watcher2)
    ctx.once(watcher3)
    ctx.on(watcher4)

    ctx.set(20)
    expect(watcher1).toBeCalledTimes(1)
    expect(recordedValue1).toBe(20)
    expect(watcher2).toBeCalledTimes(1)
    expect(recordedValue2).toBe(20)
    expect(watcher3).toBeCalledTimes(1)
    expect(recordedValue3).toBe(20)

    ctx.set(100)
    expect(watcher1).toBeCalledTimes(2)
    expect(recordedValue1).toBe(100)
    expect(watcher2).toBeCalledTimes(2)
    expect(recordedValue2).toBe(100)
    expect(watcher3).toBeCalledTimes(1)
    expect(recordedValue3).toBe(20)

    off()
    ctx.set(1000)
    expect(watcher1).toBeCalledTimes(2)
    expect(recordedValue1).toBe(100)
    expect(watcher2).toBeCalledTimes(3)
    expect(recordedValue2).toBe(1000)
    expect(watcher3).toBeCalledTimes(1)
    expect(recordedValue3).toBe(20)

    ctx.off(watcher2)
    ctx.set(0)
    expect(watcher2).toBeCalledTimes(3)
    expect(recordedValue2).toBe(1000)
    expect(watcher4).toBeCalledTimes(4)
    expect(recordedValue4).toBe(0)

    ctx.offAll()
    ctx.set(5)
    expect(watcher4).toBeCalledTimes(4)
    expect(recordedValue4).toBe(0)
  })
})
