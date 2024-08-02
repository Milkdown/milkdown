import { codeBlockComponent, codeBlockConfig } from '@milkdown/kit/component/code-block'
import type { LanguageDescription } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import type { DefineFeature } from '../shared'
import { clearIcon } from '../../icons'

interface CodeMirrorConfig {
  languages: LanguageDescription[]
  theme: Extension
}
export type CodeMirrorFeatureConfig = Partial<CodeMirrorConfig>

export const defineFeature: DefineFeature<CodeMirrorFeatureConfig> = (editor, config = {}) => {
  editor
    .config(async (ctx) => {
      let {
        languages,
        theme,
      } = config
      if (!languages) {
        const { languages: langList } = await import('@codemirror/language-data')
        languages = langList
      }
      if (!theme) {
        const { nord } = await import('@uiw/codemirror-theme-nord')
        theme = nord
      }
      ctx.update(codeBlockConfig.key, defaultConfig => ({
        ...defaultConfig,
        languages,
        clearSearchIcon: () => clearIcon,
        extensions: [basicSetup, keymap.of(defaultKeymap.concat(indentWithTab)), theme],
      }))
    })
    .use(codeBlockComponent)
}
