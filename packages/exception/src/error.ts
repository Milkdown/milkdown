import type { ErrorCode } from './code'

export class MilkdownError extends Error {
  public readonly code: ErrorCode
  public override cause?: unknown
  constructor(code: ErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'MilkdownError'
    this.code = code
    if (options?.cause !== undefined) {
      this.cause = options.cause
    }
  }
}
