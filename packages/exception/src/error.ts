import type { ErrorCode } from './code'

export class MilkdownError extends Error {
  public code: string
  constructor(code: ErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'MilkdownError'
    this.code = code
  }
}
