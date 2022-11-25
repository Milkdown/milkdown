/* Copyright 2021, Milkdown by Mirone. */

import { commands } from '@milkdown/core'
import { inputrules, keymap, plugins, schema } from './composed'

export * from './node'
export * from './mark'
export * from './composed'

export const gfm = [schema, inputrules, keymap, plugins, commands].flat()
