/* Copyright 2021, Milkdown by Mirone. */
import type { ClockMap } from './clock'

export class TimerType {
  readonly id: symbol
  readonly name: string
  readonly timeout: number
  constructor(name: string, timeout = 3000) {
    this.id = Symbol(`Timer-${name}`)
    this.name = name
    this.timeout = timeout
  }

  create = (clock: ClockMap): Timer => {
    return new Timer(clock, this)
  }
}

export class Timer {
  #promise: Promise<void> | null = null
  #listener: EventListener | null = null
  #eventUniqId: symbol
  type: TimerType
  constructor(clock: ClockMap, type: TimerType) {
    this.#eventUniqId = Symbol(type.name)
    this.type = type
    clock.set(type.id, this)
  }

  start = () => {
    this.#promise ??= new Promise((resolve, reject) => {
      this.#listener = (e: Event) => {
        if (!(e instanceof CustomEvent))
          return

        if (e.detail.id === this.#eventUniqId) {
          this.#removeListener()
          e.stopImmediatePropagation()
          resolve()
        }
      }

      this.#waitTimeout(() => {
        this.#removeListener()
        reject(new Error(`Timing ${this.type.name} timeout.`))
      })

      addEventListener(this.type.name, this.#listener)
    })

    return this.#promise
  }

  done = () => {
    const event = new CustomEvent(this.type.name, { detail: { id: this.#eventUniqId } })
    dispatchEvent(event)
  }

  #removeListener = () => {
    if (this.#listener)
      removeEventListener(this.type.name, this.#listener)
  }

  #waitTimeout = (ifTimeout: () => void) => {
    setTimeout(() => {
      ifTimeout()
    }, this.type.timeout)
  }
}

export const createTimer = (name: string, timeout = 3000) => new TimerType(name, timeout)
