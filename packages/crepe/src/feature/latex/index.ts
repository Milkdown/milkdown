import type { KatexOptions } from 'katex'
import katex from 'katex'
import { codeBlockConfig } from '@milkdown/kit/component/code-block'
import { CrepeFeature } from '../..'
import { FeaturesCtx } from '../../core/slice'
import type { DefineFeature } from '../shared'

export interface LatexConfig {
  katexOptions: KatexOptions
}

export type LatexFeatureConfig = Partial<LatexConfig>

export const defineFeature: DefineFeature<LatexFeatureConfig> = (
  editor,
  config
) => {
  editor.config((ctx) => {
    const flags = ctx.get(FeaturesCtx)
    const isCodeMirrorEnabled = flags.includes(CrepeFeature.CodeMirror)
    if (!isCodeMirrorEnabled) {
      throw new Error('CodeMirror is not enabled')
    }

    ctx.update(codeBlockConfig.key, (prev) => ({
      ...prev,
      renderPreview: (language, content) => {
        if (language.toLowerCase() === 'latex' && content.length > 0) {
          return renderLatex(content, config?.katexOptions)
        }
        const renderPreview = prev.renderPreview
        return renderPreview(language, content)
      },
    }))
  })
}

function renderLatex(content: string, options?: KatexOptions) {
  const html = katex.renderToString(content, {
    ...options,
    throwOnError: false,
    displayMode: true,
  })
  return html
}
