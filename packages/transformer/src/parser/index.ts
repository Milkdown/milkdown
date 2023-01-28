/* Copyright 2021, Milkdown by Mirone. */
import type { Node, Schema } from '@milkdown/prose/model'

import type { RemarkParser } from '../utility'
import { ParserState } from './state'

export const createParser = (schema: Schema, remark: RemarkParser) => {
  const state = new ParserState(schema)
  return (text: string): Node => {
    state.run(remark, text)
    return state.toDoc()
  }
}

export * from './types'
