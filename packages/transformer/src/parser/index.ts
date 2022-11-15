/* Copyright 2021, Milkdown by Mirone. */
import type { Node, Schema } from '@milkdown/prose/model'

import type { RemarkParser } from '../utility'
import { createStack } from './stack'
import { State } from './state'
import type { InnerParserSpecMap } from './types'

export const createParser = (schema: Schema, specMap: InnerParserSpecMap, remark: RemarkParser) => {
  const state = new State(createStack(schema), schema, specMap)
  return (text: string): Node => {
    state.run(remark, text)
    return state.toDoc()
  }
}

export * from './types'
