/* Copyright 2021, Milkdown by Mirone. */
import type { Container, Slice, SliceType } from '../context'
import type { Clock, TimerType } from '../timer'

/// The ctx object that can be accessed in plugin and action.
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

  readonly use = <T, N extends string = string>(sliceType: SliceType<T, N> | N): Slice<T, N> =>
    this.#container.get(sliceType)

  readonly get = <T, N extends string>(sliceType: SliceType<T, N>) => this.use(sliceType).get()

  readonly set = <T, N extends string>(sliceType: SliceType<T, N>, value: T) => this.use(sliceType).set(value)

  readonly update = <T, N extends string>(sliceType: SliceType<T, N>, updater: (prev: T) => T) =>
    this.use(sliceType).update(updater)

  readonly timer = (timer: TimerType) => this.#clock.get(timer)

  readonly done = (timer: TimerType) => this.timer(timer).done()

  readonly wait = (timer: TimerType) => this.timer(timer).start()

  readonly waitTimers = async (slice: SliceType<TimerType[]>) => {
    await Promise.all(this.get(slice).map(x => this.wait(x)))
  }
}
