import type { Container, Slice, SliceType } from '../context'
import type { Clock, TimerType } from '../timer'
import { Inspector } from '../inspector'
import type { Meta } from '../inspector'

/// The ctx object that can be accessed in plugin and action.
export class Ctx {
  /// @internal
  readonly #container: Container
  /// @internal
  readonly #clock: Clock
  /// @internal
  readonly #meta?: Meta
  /// @internal
  readonly #inspector?: Inspector

  /// Create a ctx object with container and clock.
  constructor(container: Container, clock: Clock, meta?: Meta) {
    this.#container = container
    this.#clock = clock
    this.#meta = meta
    if (meta) this.#inspector = new Inspector(container, clock, meta)
  }

  /// Get metadata of the ctx.
  get meta() {
    return this.#meta
  }

  /// Get the inspector of the ctx.
  get inspector() {
    return this.#inspector
  }

  /// Produce a new ctx with metadata.
  /// The new ctx will link to the same container and clock with the current ctx.
  /// If the metadata is empty, it will return the current ctx.
  readonly produce = (meta?: Meta) => {
    if (meta && Object.keys(meta).length)
      return new Ctx(this.#container, this.#clock, { ...meta })

    return this
  }

  /// Add a slice into the ctx.
  readonly inject = <T>(sliceType: SliceType<T>, value?: T) => {
    const slice = sliceType.create(this.#container.sliceMap)
    if (value != null) slice.set(value)

    this.#inspector?.onInject(sliceType)

    return this
  }

  /// Remove a slice from the ctx.
  readonly remove = <T, N extends string = string>(
    sliceType: SliceType<T, N> | N
  ) => {
    this.#container.remove(sliceType)
    this.#inspector?.onRemove(sliceType)
    return this
  }

  /// Add a timer into the ctx.
  readonly record = (timerType: TimerType) => {
    timerType.create(this.#clock.store)
    this.#inspector?.onRecord(timerType)
    return this
  }

  /// Remove a timer from the ctx.
  readonly clearTimer = (timerType: TimerType) => {
    this.#clock.remove(timerType)
    this.#inspector?.onClear(timerType)
    return this
  }

  /// Check if the ctx has a slice.
  readonly isInjected = <T, N extends string = string>(
    sliceType: SliceType<T, N> | N
  ) => this.#container.has(sliceType)

  /// Check if the ctx has a timer.
  readonly isRecorded = (timerType: TimerType) => this.#clock.has(timerType)

  /// Get a slice from the ctx.
  readonly use = <T, N extends string = string>(
    sliceType: SliceType<T, N> | N
  ): Slice<T, N> => {
    this.#inspector?.onUse(sliceType)
    return this.#container.get(sliceType)
  }

  /// Get a slice value from the ctx.
  readonly get = <T, N extends string>(sliceType: SliceType<T, N> | N) =>
    this.use(sliceType).get()

  /// Get a slice value from the ctx.
  readonly set = <T, N extends string>(
    sliceType: SliceType<T, N> | N,
    value: T
  ) => this.use(sliceType).set(value)

  /// Update a slice value from the ctx by a callback.
  readonly update = <T, N extends string>(
    sliceType: SliceType<T, N> | N,
    updater: (prev: T) => T
  ) => this.use(sliceType).update(updater)

  /// Get a timer from the ctx.
  readonly timer = (timer: TimerType) => this.#clock.get(timer)

  /// Resolve a timer from the ctx.
  readonly done = (timer: TimerType) => {
    this.timer(timer).done()
    this.#inspector?.onDone(timer)
  }

  /// Start a timer from the ctx.
  readonly wait = (timer: TimerType) => {
    const promise = this.timer(timer).start()
    this.#inspector?.onWait(timer, promise)
    return promise
  }

  /// Start a list of timers from the ctx, the list is stored in a slice in the ctx.
  /// This is equivalent to
  ///
  /// ```typescript
  /// Promise.all(ctx.get(slice).map(x => ctx.wait(x))).
  /// ```
  readonly waitTimers = async (slice: SliceType<TimerType[]>) => {
    await Promise.all(this.get(slice).map((x) => this.wait(x)))
  }
}
