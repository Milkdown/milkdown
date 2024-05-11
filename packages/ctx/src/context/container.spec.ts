import { describe, expect, it } from 'vitest'

import { Container, SliceType } from '.'

describe('context/container', () => {
  it('sliceMap', () => {
    const container = new Container()

    expect(container.sliceMap).toEqual(new Map())
  })

  it('getSlice', () => {
    const container = new Container()
    const ctx = new SliceType(0, 'num')

    ctx.create(container.sliceMap)

    expect(container.get(ctx).type.id).toBe(ctx.id)
    expect(container.get(ctx).get()).toBe(0)

    container.get(ctx).set(10)

    expect(container.get(ctx).get()).toBe(10)

    expect(container.get<number>('num').get()).toBe(10)
  })

  it('removeSlice', () => {
    const container = new Container()
    const ctx = new SliceType(0, 'num')

    ctx.create(container.sliceMap)

    expect(container.get(ctx).type.id).toBe(ctx.id)
    expect(container.get(ctx).get()).toBe(0)

    container.remove(ctx)

    expect(() => container.get(ctx)).toThrow()
  })

  it('hasSlice', () => {
    const container = new Container()
    const ctx = new SliceType(0, 'num')

    ctx.create(container.sliceMap)

    expect(container.has(ctx)).toBeTruthy()

    container.remove(ctx)

    expect(container.has(ctx)).toBeFalsy()
  })
})
