/* Copyright 2021, Milkdown by Mirone. */
import { describe, expect, it } from 'vitest'
import { Container, createSlice } from '../context'
import { Clock, createTimer } from '../timer'
import { Ctx } from './ctx'

describe('ctx', () => {
  const container = new Container()
  const clock = new Clock()
  const ctx = new Ctx(container, clock)

  it('slice', () => {
    const sliceType = createSlice(0, 'counter')

    expect(ctx.isInjected(sliceType)).toBeFalsy()
    ctx.inject(sliceType)
    expect(ctx.isInjected(sliceType)).toBeTruthy()
    expect(ctx.get(sliceType)).toBe(0)

    ctx.update(sliceType, x => x + 1)
    expect(ctx.get(sliceType)).toBe(1)

    ctx.set(sliceType, 100)
    expect(ctx.get(sliceType)).toBe(100)

    ctx.remove(sliceType)
    expect(ctx.isInjected(sliceType)).toBeFalsy()
    expect(() => ctx.get(sliceType)).toThrow()
  })

  it('timer', async () => {
    const timerType = createTimer('timer')

    expect(ctx.isRecorded(timerType)).toBeFalsy()
    ctx.record(timerType)
    expect(ctx.isRecorded(timerType)).toBeTruthy()

    setTimeout(() => {
      ctx.done(timerType)
    }, 10)

    await expect(ctx.wait(timerType)).resolves.toBeUndefined()
  })
})
