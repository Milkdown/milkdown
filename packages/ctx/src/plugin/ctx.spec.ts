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

    ctx.update(sliceType, (x) => x + 1)
    expect(ctx.get(sliceType)).toBe(1)

    ctx.update<number, 'counter'>('counter', (x) => x + 1)
    expect(ctx.get(sliceType)).toBe(2)

    ctx.set(sliceType, 100)
    expect(ctx.get(sliceType)).toBe(100)

    ctx.set<number, 'counter'>(sliceType, 200)
    expect(ctx.get(sliceType)).toBe(200)

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

  it('produce', async () => {
    const same = ctx.produce()
    expect(same).toBe(ctx)

    const different = ctx.produce({ displayName: 'test', package: 'test' })
    expect(different).not.toBe(ctx)

    const sliceType = createSlice('Foo', 'message')
    different.inject(sliceType)

    expect(same.get(sliceType)).toBe('Foo')
    expect(different.inspector?.read().injectedSlices[0]).toEqual({
      name: 'message',
      value: 'Foo',
    })

    expect(ctx.inspector?.read().injectedSlices).toBeUndefined()

    const sliceType2 = createSlice(true, 'boolean')
    same.inject(sliceType2)

    expect(different.get(sliceType2)).toBe(true)
    expect(different.inspector?.read().consumedSlices[0]).toEqual({
      name: 'boolean',
      value: true,
    })

    const timerType1 = createTimer('timer1')
    different.record(timerType1)

    setTimeout(() => {
      different.done(timerType1)
    }, 20)

    await expect(ctx.wait(timerType1)).resolves.toBeUndefined()

    expect(different.inspector?.read().recordedTimers[0].name).toBe('timer1')
    expect(
      different.inspector?.read().recordedTimers[0].duration
    ).toBeGreaterThan(0)
    expect(different.inspector?.read().recordedTimers[0].status).toBe(
      'resolved'
    )

    const timerType2 = createTimer('timer2')
    ctx.record(timerType2)

    setTimeout(() => {
      ctx.done(timerType2)
    }, 10)

    await expect(different.wait(timerType2)).resolves.toBeUndefined()

    expect(different.inspector?.read().waitTimers[0].name).toBe('timer2')
    expect(different.inspector?.read().waitTimers[0].duration).toBeGreaterThan(
      0
    )
    expect(different.inspector?.read().waitTimers[0].status).toBe('resolved')
  })
})
