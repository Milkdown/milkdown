import { $ctx } from '@milkdown/utils'
import type { Extension } from '@codemirror/state'
import type { LanguageDescription } from '@codemirror/language'
import { html } from 'atomico'
import { withMeta } from '../__internal__/meta'

export interface CodeBlockConfig {
  extensions: Extension[]
  languages: LanguageDescription[]
  expandIcon: () => ReturnType<typeof html> | string
  searchIcon: () => ReturnType<typeof html> | string
  clearSearchIcon: () => ReturnType<typeof html> | string
  searchPlaceholder: string
  noResultText: string
  renderLanguage: (
    language: string,
    selected: boolean
  ) => ReturnType<typeof html>
  renderPreview: (
    language: string,
    content: string
  ) => null | string | HTMLElement
  previewToggleButton: (previewOnlyMode: boolean) => ReturnType<typeof html>
  previewLabel: () => ReturnType<typeof html>
}

export const defaultConfig: CodeBlockConfig = {
  extensions: [],
  languages: [],
  expandIcon: () => '⬇',
  searchIcon: () => '🔍',
  clearSearchIcon: () => '⌫',
  searchPlaceholder: 'Search language',
  noResultText: 'No result',
  renderLanguage: (language) => html`${language}`,
  renderPreview: () => null,
  previewToggleButton: (previewOnlyMode) => (previewOnlyMode ? 'Edit' : 'Hide'),
  previewLabel: () => 'Preview',
}

export const codeBlockConfig = $ctx(defaultConfig, 'codeBlockConfigCtx')

withMeta(codeBlockConfig, {
  displayName: 'Config<code-block>',
  group: 'CodeBlock',
})
