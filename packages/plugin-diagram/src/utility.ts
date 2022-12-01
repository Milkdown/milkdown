/* Copyright 2021, Milkdown by Mirone. */
import type { Node } from '@milkdown/prose/model'
import { nanoid } from 'nanoid'

export const getId = (node?: Node) => node?.attrs?.identity || nanoid()
