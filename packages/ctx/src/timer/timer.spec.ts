import { describe, expect, it, vi } from 'vitest'

import { TimerType } from './timer'

describe('timing/timing', () => {
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

  it('clears its timeout once resolved', async () => {
    // A resolved timer must not leave its rejection timeout armed. That
    // callback calls the global removeEventListener. The call fails after a
    // test environment tears the globals down.
    vi.useFakeTimers()
    try {
      const timerType = new TimerType('timer', 3000)
      const timer = timerType.create(new Map())
      const started = timer.start()
      timer.done()
      await started

      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
})
