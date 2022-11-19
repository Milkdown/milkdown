/* Copyright 2021, Milkdown by Mirone. */
import type { Container, Slice, SliceValue } from '../context'
import type { Clock, Timer } from '../timing'

export class Env {
  #container: Container
  #clock: Clock

  constructor(container: Container, clock: Clock) {
    this.#container = container
    this.#clock = clock
  }

  /**
      * Inject a context into current editor.
      *
      * @param ctx - The context needs to be injected.
      * @param defaultValue - The default value of this context.
      * @returns Env.
      */
  readonly inject = <T>(ctx: Slice<T>, defaultValue?: T) => {
    ctx(this.#container.sliceMap, defaultValue)
    return this
  }

  /**
      * Remove a context from current editor.
      *
      * @param ctx - The context needs to be removed.
      * @returns Env.
      */
  readonly remove = <T, N extends string = string>(ctx: Slice<T, N> | N) => {
    this.#container.removeSlice(ctx)
    return this
  }

  /**
      * Start to record for a timer.
      *
      * @param timer - The timer needs to be recorded.
      * @returns Env.
      */
  readonly record = (timer: Timer) => {
    timer(this.#clock.store)
    return this
  }

  /**
      * Clear a timer record.
      *
      * @param timer - The timer needs to be cleared.
      * @returns Env.
      */
  readonly clearTimer = (timer: Timer) => {
    this.#clock.remove(timer)
    return this
  }

  /**
      * Get the slice instance.
      *
      * @param slice - The slice or slice name that needs to be used.
      * @returns The slice instance.
      */
  readonly use = <T, N extends string = string>(slice: Slice<T, N> | N): SliceValue<T, N> =>
    this.#container.getSlice(slice)

  /**
      * Get the slice value.
      *
      * @param slice - The slice needs to be used.
      * @returns The slice value.
      */
  readonly get = <T, N extends string>(slice: Slice<T, N>) => this.use(slice).get()

  /**
      * Set the slice value.
      *
      * @param slice - The slice needs to be used.
      * @param value - The default value.
      * @returns
      */
  readonly set = <T, N extends string>(slice: Slice<T, N>, value: T) => this.use(slice).set(value)

  /**
      * Update the slice by its current value.
      *
      * @example
      * ```
      * update(NumberSlice, x => x + 1);
      * ```
      *
      * @param slice - The slice needs to be used.
      * @param updater - The update function, gets current value as parameter and returns new value.
      * @returns
      */
  readonly update = <T, N extends string>(slice: Slice<T, N>, updater: (prev: T) => T) =>
    this.use(slice).update(updater)

  /**
      * Get the timer instance.
      *
      * @param timer - The timer needs to be used.
      * @returns The timer instance.
      */
  readonly timing = (timer: Timer) => this.#clock.get(timer)

  /**
      * Wait for a timer to finish.
      *
      * @param timer - The timer needs to be used.
      * @returns A promise that will be resolved when timer finish.
      */
  readonly wait = (timer: Timer) => this.timing(timer)()

  /**
      * Finish a timer
      *
      * @param timer - The timer needs to be finished.
      * @returns
      */
  readonly done = (timer: Timer) => this.timing(timer).done()

  /**
      * Wait for a list of timers in target slice to be all finished.
      *
      * @param slice - The slice that holds a list of timer.
      * @returns A promise that will be resolved when all timers finish.
      */
  readonly waitTimers = async (slice: Slice<Timer[]>) => {
    await Promise.all(this.get(slice).map(x => this.wait(x)))
  }
}
