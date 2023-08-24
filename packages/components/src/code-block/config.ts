/* Copyright 2021, Milkdown by Mirone. */
import { $ctx } from '@milkdown/utils'
import type { Extension } from '@codemirror/state'

export type CodeBlockConfig = {
  extensions: Extension[]
}

export const defaultConfig: CodeBlockConfig = {
  extensions: [],
}

export const codeBlockConfig = $ctx(defaultConfig, 'codeBlockConfigCtx')
