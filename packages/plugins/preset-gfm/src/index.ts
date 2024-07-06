import { commands, inputRules, keymap, markInputRules, plugins, schema } from './composed'

export * from './node'
export * from './mark'
export * from './plugin'
export * from './composed'

/// The GFM preset, includes all the plugins.
export const gfm = [schema, inputRules, markInputRules, keymap, commands, plugins].flat()
