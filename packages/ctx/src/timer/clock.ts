import { timerNotFound } from '@milkdown/exception'

import type { Timer, TimerType } from './timer'

/// @internal
export type TimerMap = Map<symbol, Timer>

/// Container is a map of timers.
export class Clock {
  /// @internal
  readonly store: TimerMap = new Map()

  /// Get a timer from the clock by timer type.
  get = (timer: TimerType) => {
    const meta = this.store.get(timer.id)
    if (!meta) throw timerNotFound(timer.name)
    return meta
  }

  /// Remove a timer from the clock by timer type.
  remove = (timer: TimerType) => {
    this.store.delete(timer.id)
  }

  // Check if the clock has a timer by timer type.
  has = (timer: TimerType) => {
    return this.store.has(timer.id)
  }
}
