import {
  codeBlockComponent,
  codeBlockConfig,
} from '@milkdown/kit/component/code-block'
import type { LanguageDescription } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { html } from 'atomico'
import type { DefineFeature, Icon } from '../shared'
import { chevronDownIcon, clearIcon, editIcon, searchIcon } from '../../icons'
import { visibilityOffIcon } from '../../icons/visibility-off'

interface CodeMirrorConfig {
  extensions: Extension[]
  languages: LanguageDescription[]
  theme: Extension

  expandIcon: Icon
  searchIcon: Icon
  clearSearchIcon: Icon

  searchPlaceholder: string
  noResultText: string

  renderLanguage: (
    language: string,
    selected: boolean
  ) => ReturnType<typeof html> | string

  renderPreview: (
    language: string,
    content: string
  ) => string | HTMLElement | null

  previewToggleIcon: (previewOnlyMode: boolean) => ReturnType<Icon>
  previewToggleText: (previewOnlyMode: boolean) => ReturnType<typeof html>
  previewLabel: () => ReturnType<typeof html>
}
export type CodeMirrorFeatureConfig = Partial<CodeMirrorConfig>

export const defineFeature: DefineFeature<CodeMirrorFeatureConfig> = (
  editor,
  config = {}
) => {
  editor
    .config(async (ctx) => {
      let { languages, theme } = config
      if (!languages) {
        const { languages: langList } = await import(
          '@codemirror/language-data'
        )
        languages = langList
      }
      if (!theme) {
        const { oneDark } = await import('@codemirror/theme-one-dark')
        theme = oneDark
      }
      ctx.update(codeBlockConfig.key, (defaultConfig) => ({
        extensions: [
          keymap.of(defaultKeymap.concat(indentWithTab)),
          basicSetup,
          theme,
          ...(config?.extensions ?? []),
        ],
        languages,

        expandIcon: config.expandIcon || (() => chevronDownIcon),
        searchIcon: config.searchIcon || (() => searchIcon),
        clearSearchIcon: config.clearSearchIcon || (() => clearIcon),
        searchPlaceholder: config.searchPlaceholder || 'Search language',
        noResultText: config.noResultText || 'No result',
        renderLanguage: config.renderLanguage || defaultConfig.renderLanguage,
        renderPreview: config.renderPreview || defaultConfig.renderPreview,
        previewToggleButton: (previewOnlyMode) => {
          return html`
            ${config.previewToggleIcon?.(previewOnlyMode) ||
            (previewOnlyMode ? editIcon : visibilityOffIcon)}
            ${config.previewToggleText?.(previewOnlyMode) ||
            (previewOnlyMode ? 'Edit' : 'Hide')}
          `
        },
        previewLabel: config.previewLabel || defaultConfig.previewLabel,
      }))
    })
    .use(codeBlockComponent)
}
