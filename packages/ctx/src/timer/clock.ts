/* Copyright 2021, Milkdown by Mirone. */
import { timerNotFound } from '@milkdown/exception'

import type { Timer, TimerType } from './timer'

export type ClockMap = Map<symbol, Timer>

export class Clock {
  readonly store: ClockMap = new Map()

  get = (timer: TimerType) => {
    const meta = this.store.get(timer.id)
    if (!meta)
      throw timerNotFound(timer.name)
    return meta
  }

  remove = (timer: TimerType) => {
    this.store.delete(timer.id)
  }

  has = (timer: TimerType) => {
    this.store.has(timer.id)
  }
}
