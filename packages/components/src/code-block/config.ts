/* Copyright 2021, Milkdown by Mirone. */
import { $ctx } from '@milkdown/utils'
import type { Extension } from '@codemirror/state'
import type { LanguageDescription } from '@codemirror/language'
import { html } from 'atomico'
import { chevronDown, search, xCircle } from '../__internal__/icons'
import { withMeta } from '../__internal__/meta'

export interface CodeBlockConfig {
  extensions: Extension[]
  languages: LanguageDescription[]
  searchPlaceholder: string
  expandIcon: () => ReturnType<typeof html>
  searchIcon: () => ReturnType<typeof html>
  clearSearchIcon: () => ReturnType<typeof html>
  renderLanguage: (language: string, selected: boolean) => ReturnType<typeof html>
}

export const defaultConfig: CodeBlockConfig = {
  extensions: [],
  languages: [],
  searchPlaceholder: 'Search language',
  expandIcon: () => chevronDown,
  searchIcon: () => search,
  clearSearchIcon: () => xCircle,
  renderLanguage: language => html`${language}`,
}

export const codeBlockConfig = $ctx(defaultConfig, 'codeBlockConfigCtx')

withMeta(codeBlockConfig, {
  displayName: 'Config<code-block>',
  group: 'CodeBlock',
})
