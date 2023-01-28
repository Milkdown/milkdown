/* Copyright 2021, Milkdown by Mirone. */
import type { Node, Schema } from '@milkdown/prose/model'

import type { RemarkParser } from '../utility'
import { SerializerState } from './state'

export const createSerializer
    = (schema: Schema, remark: RemarkParser) => (content: Node) => {
      const state = new SerializerState(schema)
      state.run(content)
      return state.toString(remark)
    }

export * from './types'
