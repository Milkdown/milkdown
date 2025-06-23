/* oxlint-disable no-console */
import chalk from 'chalk'
import { identity } from 'lodash-es'

export const newLineSeparator = /\r\n|[\n\r\x85\u2028\u2029]/g

interface StringLike {
  toString: () => string
}

export class Logger {
  log = this.getLineLogger(console.log.bind(console))
  info = this.getLineLogger(console.info.bind(console), chalk.blue)
  warn = this.getLineLogger(
    console.warn.bind(console),
    chalk.bgHex('#322b08').hex('#fadea6')
  )
  error = this.getLineLogger(
    console.error.bind(console),
    chalk.bgHex('#250201').hex('#ef8784')
  )
  success = this.getLineLogger(console.log.bind(console), chalk.green)

  constructor(private readonly tag: string = '') {}

  getLineLogger(
    logLine: (...line: string[]) => void,
    color: (...text: string[]) => string = identity
  ) {
    return (...args: StringLike[]) => {
      args.forEach((arg) => {
        arg
          .toString()
          .split(newLineSeparator)
          .forEach((line) => {
            if (line.length !== 0) {
              if (this.tag) {
                logLine(color(`[${this.tag}] ${line}`))
              } else {
                logLine(color(line))
              }
            }
          })
      })
    }
  }
}
