import type { TimerMap } from './clock'

export type TimerStatus = 'pending' | 'resolved' | 'rejected'

/// Timer is a promise that can be resolved by calling done.
export class Timer {
  /// The type of the timer.
  readonly type: TimerType

  /// @internal
  #promise: Promise<void> | null = null
  /// @internal
  #listener: EventListener | null = null
  /// @internal
  readonly #eventUniqId: symbol
  /// @internal
  #status: TimerStatus = 'pending'

  /// @internal
  constructor(clock: TimerMap, type: TimerType) {
    this.#eventUniqId = Symbol(type.name)
    this.type = type
    clock.set(type.id, this)
  }

  /// The status of the timer.
  /// Can be `pending`, `resolved` or `rejected`.
  get status() {
    return this.#status
  }

  /// Start the timer, which will return a promise.
  /// If the timer is already started, it will return the same promise.
  /// If the timer is not resolved in the timeout, it will reject the promise.
  start = () => {
    this.#promise ??= new Promise((resolve, reject) => {
      this.#listener = (e: Event) => {
        if (!(e instanceof CustomEvent)) return

        if (e.detail.id === this.#eventUniqId) {
          this.#status = 'resolved'
          this.#removeListener()
          e.stopImmediatePropagation()
          resolve()
        }
      }

      this.#waitTimeout(() => {
        if (this.#status === 'pending') this.#status = 'rejected'

        this.#removeListener()
        reject(new Error(`Timing ${this.type.name} timeout.`))
      })

      this.#status = 'pending'
      addEventListener(this.type.name, this.#listener)
    })

    return this.#promise
  }

  /// Resolve the timer.
  done = () => {
    const event = new CustomEvent(this.type.name, {
      detail: { id: this.#eventUniqId },
    })
    dispatchEvent(event)
  }

  /// @internal
  #removeListener = () => {
    if (this.#listener) removeEventListener(this.type.name, this.#listener)
  }

  /// @internal
  #waitTimeout = (ifTimeout: () => void) => {
    setTimeout(() => {
      ifTimeout()
    }, this.type.timeout)
  }
}

/// Timer type can be used to create timers in different clocks.
export class TimerType {
  /// The unique id of the timer type.
  readonly id: symbol
  /// The name of the timer type.
  readonly name: string
  /// The timeout of the timer type.
  readonly timeout: number

  /// Create a timer type with a name and a timeout.
  /// The name should be unique in the clock.
  constructor(name: string, timeout = 3000) {
    this.id = Symbol(`Timer-${name}`)
    this.name = name
    this.timeout = timeout
  }

  /// Create a timer with a clock.
  create = (clock: TimerMap): Timer => {
    return new Timer(clock, this)
  }
}

/// Create a timer type with a name and a timeout.
/// This is equivalent to `new TimerType(name, timeout)`.
export const createTimer = (name: string, timeout = 3000) =>
  new TimerType(name, timeout)
