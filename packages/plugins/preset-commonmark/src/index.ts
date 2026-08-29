import type { MilkdownPlugin } from '@milkdown/ctx'

import {
  commands,
  inputRules,
  keymap,
  markInputRules,
  plugins,
  schema,
} from './composed'

export * from './node'
export * from './mark'
export * from './plugin'
export * from './composed'
export * from './commands'
export {
  EMPTY_LINE_PLACEHOLDER,
  isBrHtmlValue,
} from './__internal__/empty-line-br'

/// The commonmark preset, includes all the plugins.
export const commonmark: MilkdownPlugin[] = [
  schema,
  inputRules,
  markInputRules,
  commands,
  keymap,
  plugins,
].flat()
