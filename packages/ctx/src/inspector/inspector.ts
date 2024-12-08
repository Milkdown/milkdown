import type { Container, SliceType } from '../context'
import type { Clock, TimerStatus, TimerType } from '../timer'
import type { Meta } from './meta'

export interface Telemetry {
  metadata: Meta
  injectedSlices: { name: string; value: unknown }[]
  consumedSlices: { name: string; value: unknown }[]
  recordedTimers: { name: string; duration: number; status: TimerStatus }[]
  waitTimers: { name: string; duration: number; status: TimerStatus }[]
}

/// The inspector object that is used to inspect the runtime environment of a ctx.
export class Inspector {
  /// @internal
  readonly #meta: Meta

  /// @internal
  readonly #container: Container

  /// @internal
  readonly #clock: Clock

  /// @internal
  readonly #injectedSlices: Set<SliceType | string> = new Set()

  /// @internal
  readonly #consumedSlices: Set<SliceType | string> = new Set()

  /// @internal
  readonly #recordedTimers: Map<
    TimerType,
    { duration: number; start: number }
  > = new Map()

  /// @internal
  readonly #waitTimers: Map<TimerType, { duration: number }> = new Map()

  /// Create an inspector with container, clock and metadata.
  constructor(container: Container, clock: Clock, meta: Meta) {
    this.#container = container
    this.#clock = clock
    this.#meta = meta
  }

  /// Read the runtime telemetry as an object of the ctx.
  read = (): Telemetry => {
    return {
      metadata: this.#meta,
      injectedSlices: [...this.#injectedSlices].map((slice) => ({
        name: typeof slice === 'string' ? slice : slice.name,
        value: this.#getSlice(slice),
      })),
      consumedSlices: [...this.#consumedSlices].map((slice) => ({
        name: typeof slice === 'string' ? slice : slice.name,
        value: this.#getSlice(slice),
      })),
      recordedTimers: [...this.#recordedTimers].map(
        ([timer, { duration }]) => ({
          name: timer.name,
          duration,
          status: this.#getTimer(timer),
        })
      ),
      waitTimers: [...this.#waitTimers].map(([timer, { duration }]) => ({
        name: timer.name,
        duration,
        status: this.#getTimer(timer),
      })),
    }
  }

  /// @internal
  readonly onRecord = (timerType: TimerType) => {
    this.#recordedTimers.set(timerType, { start: Date.now(), duration: 0 })
  }

  /// @internal
  readonly onClear = (timerType: TimerType) => {
    this.#recordedTimers.delete(timerType)
  }

  /// @internal
  readonly onDone = (timerType: TimerType) => {
    const timer = this.#recordedTimers.get(timerType)
    if (!timer) return
    timer.duration = Date.now() - timer.start
  }

  /// @internal
  readonly onWait = (timerType: TimerType, promise: Promise<void>) => {
    const start = Date.now()
    promise.finally(() => {
      this.#waitTimers.set(timerType, { duration: Date.now() - start })
    })
  }

  /// @internal
  readonly onInject = (sliceType: SliceType | string) => {
    this.#injectedSlices.add(sliceType)
  }

  /// @internal
  readonly onRemove = (sliceType: SliceType | string) => {
    this.#injectedSlices.delete(sliceType)
  }

  /// @internal
  readonly onUse = (sliceType: SliceType | string) => {
    this.#consumedSlices.add(sliceType)
  }

  /// @internal
  #getSlice = (sliceType: SliceType | string) => {
    return this.#container.get(sliceType).get()
  }

  /// @internal
  #getTimer = (timerType: TimerType) => {
    return this.#clock.get(timerType).status
  }
}
