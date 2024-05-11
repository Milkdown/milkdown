import type { Attrs } from '../../model'
import type { Transaction } from '../../state'

/// @internal
export interface Captured {
  group: string | undefined
  fullMatch: string
  start: number
  end: number
}

/// @internal
export interface BeforeDispatch {
  match: string[]
  start: number
  end: number
  tr: Transaction
}

/// @internal
export interface Options {
  getAttr?: (match: RegExpMatchArray) => Attrs
  updateCaptured?: (captured: Captured) => Partial<Captured>
  beforeDispatch?: (options: BeforeDispatch) => void
}
