import type { Extension } from '@codemirror/state'

import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { keymap } from '@codemirror/view'
import {
  codeBlockComponent,
  codeBlockConfig,
  type CodeBlockConfig,
} from '@milkdown/kit/component/code-block'
import { createSlice, type Ctx } from '@milkdown/kit/ctx'
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

interface CodeMirrorConfig extends CodeBlockConfig {
  theme: Extension
  previewToggleIcon: (previewOnlyMode: boolean) => string
  previewToggleText: (previewOnlyMode: boolean) => string
}

export type CodeMirrorFeatureConfig = Partial<CodeMirrorConfig>

const CodeMirrorThemeCtx = createSlice([] as Extension, 'CodeMirrorThemeCtx')

/// Switch the CodeMirror theme of every code block after the editor is
/// created, e.g. when the page switches between light and dark mode.
/// Pass `[]` to drop the theme. It does nothing when the CodeMirror
/// feature is disabled.
/// ```ts
/// import { setCodeMirrorTheme } from '@milkdown/crepe/feature/code-mirror'
/// crepe.editor.action(setCodeMirrorTheme(isDark ? oneDark : []))
/// ```
export function setCodeMirrorTheme(theme: Extension) {
  return (ctx: Ctx) => {
    // The string form keeps the slice out of more than one bundle entry.
    if (!ctx.isInjected('CodeMirrorThemeCtx')) return
    ctx.set<Extension, 'CodeMirrorThemeCtx'>('CodeMirrorThemeCtx', theme)
  }
}

export const codeMirror: DefineFeature<CodeMirrorFeatureConfig> = (
  editor,
  config = {}
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.CodeMirror))
    .config((ctx) => {
      const { languages = [], theme = [] } = config
      const keymapExtension = keymap.of(defaultKeymap.concat(indentWithTab))
      const buildExtensions = (theme: Extension) => [
        keymapExtension,
        basicSetup,
        theme,
        ...(config.extensions ?? []),
      ]

      ctx.inject(CodeMirrorThemeCtx, theme)
      ctx.use(CodeMirrorThemeCtx).on((theme) => {
        ctx.update(codeBlockConfig.key, (prev) => ({
          ...prev,
          extensions: buildExtensions(theme),
        }))
      })

      ctx.update(codeBlockConfig.key, (defaultConfig) => ({
        extensions: buildExtensions(theme),
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
        previewOnlyByDefault:
          config.previewOnlyByDefault ?? defaultConfig.previewOnlyByDefault,
      }))
    })
    .use(codeBlockComponent)
}
