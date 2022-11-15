/* Copyright 2021, Milkdown by Mirone. */
import { describe, expect, it } from 'vitest'

import { createClock } from './clock'
import { createTimer } from './timing'

describe('timing/clock', () => {
  it('createClock', () => {
    const clock = createClock()
    const timer = createTimer('timer')
    const timerNotRegistered = createTimer('not')

    timer(clock.store)

    expect(clock.get(timer)).toBe(clock.store.get(timer.id))
    expect(() => clock.get(timerNotRegistered)).toThrow()
  })

  it('remove', () => {
    const clock = createClock()
    const timer = createTimer('timer')
    timer(clock.store)
    expect(clock.get(timer)).toBe(clock.store.get(timer.id))

    clock.remove(timer)
    expect(() => clock.get(timer)).toThrow()
  })
})
