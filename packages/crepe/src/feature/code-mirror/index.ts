import { codeBlockComponent, codeBlockConfig } from '@milkdown/kit/component/code-block'
import type { LanguageDescription } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import type { html } from 'atomico'
import type { DefineFeature, Icon } from '../shared'
import { chevronDownIcon, clearIcon, searchIcon } from '../../icons'
import { languages as langList } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'

interface CodeMirrorConfig {
  extensions: Extension[]
  languages: LanguageDescription[]
  theme: Extension

  expandIcon: Icon
  searchIcon: Icon
  clearSearchIcon: Icon

  searchPlaceholder: string
  noResultText: string

  renderLanguage: (language: string, selected: boolean) => ReturnType<typeof html> | string | HTMLElement
}
export type CodeMirrorFeatureConfig = Partial<CodeMirrorConfig>

export const defineFeature: DefineFeature<CodeMirrorFeatureConfig> = (editor, config = {}) => {
  editor
    .config((ctx) => {
      let {
        languages,
        theme,
      } = config
      if (!languages) {
        languages = langList
      }
      if (!theme) {
        theme = oneDark
      }
      ctx.update(codeBlockConfig.key, defaultConfig => ({
        extensions: [
          keymap.of(defaultKeymap.concat(indentWithTab)),
          basicSetup,
          theme,
          ...config?.extensions ?? [],
        ],
        languages,

        expandIcon: config.expandIcon || (() => chevronDownIcon),
        searchIcon: config.searchIcon || (() => searchIcon),
        clearSearchIcon: config.clearSearchIcon || (() => clearIcon),
        searchPlaceholder: config.searchPlaceholder || 'Search language',
        noResultText: config.noResultText || 'No result',
        renderLanguage: config.renderLanguage || defaultConfig.renderLanguage,
      }))
    })
    .use(codeBlockComponent)
}
