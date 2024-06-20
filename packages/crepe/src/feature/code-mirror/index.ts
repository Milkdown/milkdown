import { codeBlockComponent, codeBlockConfig } from '@milkdown/components/code-block'
import type { LanguageDescription } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { html } from 'atomico'
import type { DefineFeature } from '../shared'

const clearIcon = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clip-path="url(#clip0_1098_15553)">
      <path d="M18.3007 5.70973C17.9107 5.31973 17.2807 5.31973 16.8907 5.70973L12.0007 10.5897L7.1107 5.69973C6.7207 5.30973 6.0907 5.30973 5.7007 5.69973C5.3107 6.08973 5.3107 6.71973 5.7007 7.10973L10.5907 11.9997L5.7007 16.8897C5.3107 17.2797 5.3107 17.9097 5.7007 18.2997C6.0907 18.6897 6.7207 18.6897 7.1107 18.2997L12.0007 13.4097L16.8907 18.2997C17.2807 18.6897 17.9107 18.6897 18.3007 18.2997C18.6907 17.9097 18.6907 17.2797 18.3007 16.8897L13.4107 11.9997L18.3007 7.10973C18.6807 6.72973 18.6807 6.08973 18.3007 5.70973Z" fill="#817567"/>
    </g>
    <defs>
      <clipPath id="clip0_1098_15553">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
`

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
