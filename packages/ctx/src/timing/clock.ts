/* Copyright 2021, Milkdown by Mirone. */
import { timerNotFound } from '@milkdown/exception'

import type { Timing } from './timing'

export type ClockMap = Map<symbol, Timing>

export interface Timer {
  (store: ClockMap): Timing
  id: symbol
  timerName: string
}

export interface Clock {
  store: ClockMap
  get: (timer: Timer) => Timing
  remove: (timer: Timer) => void
}

export const createClock = (): Clock => {
  const store: ClockMap = new Map()
  const get = (timer: Timer) => {
    const meta = store.get(timer.id)
    if (!meta)
      throw timerNotFound(timer.timerName)
    return meta
  }

  const remove = (timer: Timer) => {
    store.delete(timer.id)
  }

  return {
    store,
    get,
    remove,
  }
}
