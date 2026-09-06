import { afterEach, describe, expect, it, vi } from 'vitest'

import { TimerType } from './timer'

describe('timing/timing', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('createTimer', async () => {
    const timerType = new TimerType('timer')
    const map = new Map()
    const timer = timerType.create(map)
    setTimeout(() => {
      timer.done()
    }, 10)

    await expect(timer.start()).resolves.toBeUndefined()

    // should still can be waited after it's resolved
    await expect(timer.start()).resolves.toBeUndefined()
  })

  it('timeout', async () => {
    const timerType = new TimerType('timer', 10)
    const map = new Map()
    const timer = timerType.create(map)

    await expect(timer.start()).rejects.toStrictEqual(
      new Error('Timing timer timeout.')
    )
  })

  it('cancels the timeout after resolving', async () => {
    vi.useFakeTimers()
    const removeEventListener = vi.spyOn(globalThis, 'removeEventListener')
    const timerType = new TimerType('timer', 10)
    const map = new Map()
    const timer = timerType.create(map)

    const result = timer.start()
    timer.done()

    await expect(result).resolves.toBeUndefined()
    expect(removeEventListener).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)

    await vi.advanceTimersByTimeAsync(10)

    expect(removeEventListener).toHaveBeenCalledOnce()
    expect(timer.status).toBe('resolved')
  })
})
