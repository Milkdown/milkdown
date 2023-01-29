/* Copyright 2021, Milkdown by Mirone. */
import type { Container, Slice, SliceType } from '../context'
import type { Clock, TimerType } from '../timer'

/**
 * The ctx object that can be accessed in plugin and action.
 */
export class Ctx {
  #container: Container
  #clock: Clock

  constructor(container: Container, clock: Clock) {
    this.#container = container
    this.#clock = clock
  }

  readonly inject = <T>(sliceType: SliceType<T>, value?: T) => {
    const slice = sliceType.create(this.#container.sliceMap)
    if (value != null)
      slice.set(value)

    return this
  }

  readonly remove = <T, N extends string = string>(sliceType: SliceType<T, N> | N) => {
    this.#container.remove(sliceType)
    return this
  }

  readonly record = (timerType: TimerType) => {
    timerType.create(this.#clock.store)
    return this
  }

  readonly clearTimer = (timerType: TimerType) => {
    this.#clock.remove(timerType)
    return this
  }

  readonly isInjected = <T, N extends string = string>(sliceType: SliceType<T, N> | N) => this.#container.has(sliceType)

  readonly isRecorded = (timerType: TimerType) => this.#clock.has(timerType)

  /**
      * Get the slice instance.
      *
      * @param slice - The slice or slice name that needs to be used.
      * @returns The slice instance.
      */
  readonly use = <T, N extends string = string>(sliceType: SliceType<T, N> | N): Slice<T, N> =>
    this.#container.get(sliceType)

  /**
      * Get the slice value.
      *
      * @param slice - The slice needs to be used.
      * @returns The slice value.
      */
  readonly get = <T, N extends string>(sliceType: SliceType<T, N>) => this.use(sliceType).get()

  /**
      * Set the slice value.
      *
      * @param slice - The slice needs to be used.
      * @param value - The default value.
      * @returns
      */
  readonly set = <T, N extends string>(sliceType: SliceType<T, N>, value: T) => this.use(sliceType).set(value)

  /**
      * Update the slice by its current value.
      *
      * @example
      * ```
      * update(NumberSlice, x => x + 1);
      * ```
      *
      * @param sliceType - The slice needs to be used.
      * @param updater - The update function, gets current value as parameter and returns new value.
      * @returns
      */
  readonly update = <T, N extends string>(sliceType: SliceType<T, N>, updater: (prev: T) => T) =>
    this.use(sliceType).update(updater)

  /**
      * Get the timer instance.
      *
      * @param timer - The timer needs to be used.
      * @returns The timer instance.
      */
  readonly timer = (timer: TimerType) => this.#clock.get(timer)

  /**
      * Finish a timer
      *
      * @param timer - The timer needs to be finished.
      * @returns
      */
  readonly done = (timer: TimerType) => this.timer(timer).done()

  /**
      * Wait for a timer to finish.
      *
      * @param timer - The timer needs to be used.
      * @returns A promise that will be resolved when timer finish.
      */
  readonly wait = (timer: TimerType) => this.timer(timer).start()

  /**
      * Wait for a list of timers in target slice to be all finished.
      *
      * @param slice - The slice that holds a list of timer.
      * @returns A promise that will be resolved when all timers finish.
      */
  readonly waitTimers = async (slice: SliceType<TimerType[]>) => {
    await Promise.all(this.get(slice).map(x => this.wait(x)))
  }
}
