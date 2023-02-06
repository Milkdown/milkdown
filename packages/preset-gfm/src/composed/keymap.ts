/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/ctx'
import { strikethroughKeymap } from '../mark'
import { tableKeymap } from '../node'

export const keymap: MilkdownPlugin[] = [
  strikethroughKeymap,
  tableKeymap,
].flat()
