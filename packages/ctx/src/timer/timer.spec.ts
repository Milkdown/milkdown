import { describe, expect, it } from 'vitest'

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
})
