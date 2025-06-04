import type { LanguageDescription } from '@codemirror/language'
import type { Extension } from '@codemirror/state'

import { $ctx } from '@milkdown/utils'

import { withMeta } from '../__internal__/meta'

export interface CodeBlockConfig {
  extensions: Extension[]
  languages: LanguageDescription[]
  expandIcon: string
  searchIcon: string
  clearSearchIcon: string
  searchPlaceholder: string
  noResultText: string
  copiedText: string
  copyIcon: () => string
  renderLanguage: (language: string, selected: boolean) => string
  renderPreview: (
    language: string,
    content: string
  ) => null | string | HTMLElement
  previewToggleButton: (previewOnlyMode: boolean) => string
  previewLabel: string
}

export const defaultConfig: CodeBlockConfig = {
  extensions: [],
  languages: [],
  expandIcon: '⬇',
  searchIcon: '🔍',
  clearSearchIcon: '⌫',
  searchPlaceholder: 'Search language',
  noResultText: 'No result',
  copiedText: 'Copied',
  copyIcon: () => '📋',
  renderLanguage: (language) => language,
  renderPreview: () => null,
  previewToggleButton: (previewOnlyMode) => (previewOnlyMode ? 'Edit' : 'Hide'),
  previewLabel: 'Preview',
}

export const codeBlockConfig = $ctx(defaultConfig, 'codeBlockConfigCtx')

withMeta(codeBlockConfig, {
  displayName: 'Config<code-block>',
  group: 'CodeBlock',
})
