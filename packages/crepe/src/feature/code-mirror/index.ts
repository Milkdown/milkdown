import type { LanguageDescription } from '@codemirror/language'
import type { Extension } from '@codemirror/state'

import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { keymap } from '@codemirror/view'
import {
  codeBlockComponent,
  codeBlockConfig,
} from '@milkdown/kit/component/code-block'
import { basicSetup } from 'codemirror'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig } from '../../core/slice'
import { chevronDownIcon, clearIcon, editIcon, searchIcon } from '../../icons'
import { visibilityOffIcon } from '../../icons/visibility-off'
import { CrepeFeature } from '../index'

interface CodeMirrorConfig {
  extensions: Extension[]
  languages: LanguageDescription[]
  theme: Extension

  expandIcon: string
  searchIcon: string
  clearSearchIcon: string

  searchPlaceholder: string
  noResultText: string

  renderLanguage: (language: string, selected: boolean) => string

  renderPreview: (
    language: string,
    content: string
  ) => string | HTMLElement | null

  previewToggleIcon: (previewOnlyMode: boolean) => string
  previewToggleText: (previewOnlyMode: boolean) => string
  previewLabel: string
}
export type CodeMirrorFeatureConfig = Partial<CodeMirrorConfig>

export const codeMirror: DefineFeature<CodeMirrorFeatureConfig> = (
  editor,
  config = {}
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.CodeMirror))
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

        expandIcon: config.expandIcon || chevronDownIcon,
        searchIcon: config.searchIcon || searchIcon,
        clearSearchIcon: config.clearSearchIcon || clearIcon,
        searchPlaceholder: config.searchPlaceholder || 'Search language',
        noResultText: config.noResultText || 'No result',
        renderLanguage: config.renderLanguage || defaultConfig.renderLanguage,
        renderPreview: config.renderPreview || defaultConfig.renderPreview,
        previewToggleButton: (previewOnlyMode) => {
          const icon =
            config.previewToggleIcon?.(previewOnlyMode) ||
            (previewOnlyMode ? editIcon : visibilityOffIcon)
          const text =
            config.previewToggleText?.(previewOnlyMode) ||
            (previewOnlyMode ? 'Edit' : 'Hide')
          return [icon, text].map((v) => v.trim()).join(' ')
        },
        previewLabel: config.previewLabel || defaultConfig.previewLabel,
      }))
    })
    .use(codeBlockComponent)
}
