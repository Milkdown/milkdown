/* Copyright 2021, Milkdown by Mirone. */

import { commands, inputrules, keymap, plugins, schema } from './composed'

export * from './node'
export * from './mark'
export * from './plugin'
export * from './composed'

/// The GFM preset, includes all the plugins.
export const gfm = [schema, inputrules, keymap, plugins, commands].flat()
