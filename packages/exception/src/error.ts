import type { ErrorCode } from './code'

export class MilkdownError extends Error {
  public code: string
  constructor(code: ErrorCode, message: string) {
    super(message)
    this.name = 'MilkdownError'
    this.code = code
  }
}
