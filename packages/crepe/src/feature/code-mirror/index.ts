import type { Extension } from '@codemirror/state'

import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { keymap } from '@codemirror/view'
import {
  codeBlockComponent,
  codeBlockConfig,
  type CodeBlockConfig
} from '@milkdown/kit/component/code-block'
import { basicSetup } from 'codemirror'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig } from '../../core/slice'
import {
  chevronDownIcon,
  clearIcon,
  copyIcon,
  editIcon,
  searchIcon,
  visibilityOffIcon,
} from '../../icons'
import { CrepeFeature } from '../index'

interface CodeMirrorConfig extends CodeBlockConfig{
  theme: Extension
  previewToggleIcon: (previewOnlyMode: boolean) => string
  previewToggleText: (previewOnlyMode: boolean) => string
}

export type CodeMirrorFeatureConfig = Partial<CodeMirrorConfig>

export const codeMirror: DefineFeature<CodeMirrorFeatureConfig> = (
  editor,
  config = {}
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.CodeMirror))
    .config((ctx) => {
      const { languages = [], theme } = config
      const extensions = [
        keymap.of(defaultKeymap.concat(indentWithTab)),
        basicSetup,
      ]
      if (theme) {
        extensions.push(theme)
      }
      if (config.extensions) {
        extensions.push(...config.extensions)
      }

      ctx.update(codeBlockConfig.key, (defaultConfig) => ({
        extensions,
        languages,

        expandIcon: config.expandIcon || chevronDownIcon,
        searchIcon: config.searchIcon || searchIcon,
        clearSearchIcon: config.clearSearchIcon || clearIcon,
        searchPlaceholder: config.searchPlaceholder || 'Search language',
        copyText: config.copyText || 'Copy',
        copyIcon: config.copyIcon || copyIcon,
        onCopy: config.onCopy || (() => {}),
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
        previewLoading: config.previewLoading || defaultConfig.previewLoading,
        previewOnlyByDefault: config.previewOnlyByDefault ?? defaultConfig.previewOnlyByDefault,
      }))
    })
    .use(codeBlockComponent)
}
