/* Copyright 2021, Milkdown by Mirone. */
import type { Container, Slice, SliceType } from '../context'
import type { Clock, TimerType } from '../timer'

/// The ctx object that can be accessed in plugin and action.
export class Ctx {
  /// @internal
  #container: Container
  /// @internal
  #clock: Clock

  /// Create a ctx object with container and clock.
  constructor(container: Container, clock: Clock) {
    this.#container = container
    this.#clock = clock
  }

  /// Add a slice into the ctx.
  readonly inject = <T>(sliceType: SliceType<T>, value?: T) => {
    const slice = sliceType.create(this.#container.sliceMap)
    if (value != null)
      slice.set(value)

    return this
  }

  /// Remove a slice from the ctx.
  readonly remove = <T, N extends string = string>(sliceType: SliceType<T, N> | N) => {
    this.#container.remove(sliceType)
    return this
  }

  /// Add a timer into the ctx.
  readonly record = (timerType: TimerType) => {
    timerType.create(this.#clock.store)
    return this
  }

  /// Remove a timer from the ctx.
  readonly clearTimer = (timerType: TimerType) => {
    this.#clock.remove(timerType)
    return this
  }

  /// Check if the ctx has a slice.
  readonly isInjected = <T, N extends string = string>(sliceType: SliceType<T, N> | N) => this.#container.has(sliceType)

  /// Check if the ctx has a timer.
  readonly isRecorded = (timerType: TimerType) => this.#clock.has(timerType)

  /// Get a slice from the ctx.
  readonly use = <T, N extends string = string>(sliceType: SliceType<T, N> | N): Slice<T, N> =>
    this.#container.get(sliceType)

  /// Get a slice value from the ctx.
  readonly get = <T, N extends string>(sliceType: SliceType<T, N> | N) => this.use(sliceType).get()

  /// Get a slice value from the ctx.
  readonly set = <T, N extends string>(sliceType: SliceType<T, N> | N, value: T) => this.use(sliceType).set(value)

  /// Update a slice value from the ctx by a callback.
  readonly update = <T, N extends string>(sliceType: SliceType<T, N> | N, updater: (prev: T) => T) =>
    this.use(sliceType).update(updater)

  /// Get a timer from the ctx.
  readonly timer = (timer: TimerType) => this.#clock.get(timer)

  /// Resolve a timer from the ctx.
  readonly done = (timer: TimerType) => this.timer(timer).done()

  /// Start a timer from the ctx.
  readonly wait = (timer: TimerType) => this.timer(timer).start()

  /// Start a list of timers from the ctx, the list is stored in a slice in the ctx.
  /// This is equivalent to
  ///
  /// ```typescript
  /// Promise.all(ctx.get(slice).map(x => ctx.wait(x))).
  /// ```
  readonly waitTimers = async (slice: SliceType<TimerType[]>) => {
    await Promise.all(this.get(slice).map(x => this.wait(x)))
  }
}
