import { describe, expect, it } from 'vitest'

import { Clock } from './clock'
import { TimerType } from './timer'

describe('timing/clock', () => {
  it('createClock', () => {
    const clock = new Clock()
    const timer = new TimerType('timer')
    const timerNotRegistered = new TimerType('not')

    timer.create(clock.store)

    expect(clock.get(timer)).toBe(clock.store.get(timer.id))
    expect(() => clock.get(timerNotRegistered)).toThrow()
  })

  it('remove', () => {
    const clock = new Clock()
    const timer = new TimerType('timer')
    timer.create(clock.store)
    expect(clock.get(timer)).toBe(clock.store.get(timer.id))

    clock.remove(timer)
    expect(() => clock.get(timer)).toThrow()
  })
})
