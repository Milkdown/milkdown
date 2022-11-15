/* Copyright 2021, Milkdown by Mirone. */
import type { ClockMap, Timer } from './clock'

export interface Timing {
  (): Promise<void>
  done: () => void
}

export const createTimer = (name: string, timeout = 3000): Timer => {
  const id = Symbol('Timer')

  const timer = (store: ClockMap) => {
    let promise: Promise<void> | null = null
    let listener: EventListener

    const data = Symbol(name)

    const timing: Timing = () =>
      (promise ??= new Promise((resolve, reject) => {
        listener = (e: Event) => {
          if (!(e instanceof CustomEvent))
            return

          if (e.detail.id === data) {
            removeEventListener(name, listener)
            e.stopImmediatePropagation()
            resolve()
          }
        }
        setTimeout(() => {
          reject(new Error(`Timing ${name} timeout.`))
          removeEventListener(name, listener)
        }, timeout)
        addEventListener(name, listener)
      }))
    timing.done = () => {
      const event = new CustomEvent(name, { detail: { id: data } })
      dispatchEvent(event)
    }

    store.set(id, timing)

    return timing
  }
  timer.id = id
  timer.timerName = name

  return timer
}
