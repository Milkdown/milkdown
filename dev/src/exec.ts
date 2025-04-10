import { execSync } from 'node:child_process'

import { Logger } from './logger'

export function exec(
  tag: string,
  cmd: string,
  { silent }: { silent: boolean } = { silent: false }
): string {
  const logger = new Logger(tag)
  !silent && logger.info(cmd)
  const result = execSync(cmd, { encoding: 'utf8' }).trim()
  !silent && logger.log(result)
  return result
}
