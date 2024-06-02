import type { Node } from '@milkdown/prose/model'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefg', 8)

export const getId = (node?: Node) => node?.attrs?.identity || nanoid()
