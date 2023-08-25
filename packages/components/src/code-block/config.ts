/* Copyright 2021, Milkdown by Mirone. */
import { $ctx } from '@milkdown/utils'
import type { Extension } from '@codemirror/state'
import type { LanguageDescription } from '@codemirror/language'
import type { html } from 'atomico'
import { chevronDown, search, xCircle } from '../__internal__/icons'

export type CodeBlockConfig = {
  extensions: Extension[]
  languages: LanguageDescription[]
  expandIcon: () => ReturnType<typeof html>
  searchIcon: () => ReturnType<typeof html>
  clearSearchIcon: () => ReturnType<typeof html>
}

export const defaultConfig: CodeBlockConfig = {
  extensions: [],
  languages: [],
  expandIcon: () => chevronDown,
  searchIcon: () => search,
  clearSearchIcon: () => xCircle,
}

export const codeBlockConfig = $ctx(defaultConfig, 'codeBlockConfigCtx')
