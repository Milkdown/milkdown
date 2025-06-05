import type { KatexOptions } from 'katex'

import { codeBlockConfig } from '@milkdown/kit/component/code-block'
import katex from 'katex'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig, useCrepeFeatures } from '../../core/slice'
import { CrepeFeature } from '../../feature'
import { confirmIcon } from '../../icons'
import { blockLatexSchema } from './block-latex'
import { toggleLatexCommand } from './command'
import { mathInlineSchema } from './inline-latex'
import { inlineLatexTooltip } from './inline-tooltip/tooltip'
import { LatexInlineTooltip } from './inline-tooltip/view'
import { mathBlockInputRule, mathInlineInputRule } from './input-rule'
import { remarkMathBlockPlugin, remarkMathPlugin } from './remark'

export interface LatexConfig {
  katexOptions: KatexOptions
  inlineEditConfirm: string
}

export type LatexFeatureConfig = Partial<LatexConfig>

export const latex: DefineFeature<LatexFeatureConfig> = (editor, config) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.Latex))
    .config((ctx) => {
      const flags = useCrepeFeatures(ctx).get()
      const isCodeMirrorEnabled = flags.includes(CrepeFeature.CodeMirror)
      if (!isCodeMirrorEnabled) {
        throw new Error('You need to enable CodeMirror to use LaTeX feature')
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

      ctx.set(inlineLatexTooltip.key, {
        view: (view) => {
          return new LatexInlineTooltip(ctx, view, {
            inlineEditConfirm: config?.inlineEditConfirm ?? confirmIcon,
            ...config,
          })
        },
      })
    })
    .use(remarkMathPlugin)
    .use(remarkMathBlockPlugin)
    .use(mathInlineSchema)
    .use(inlineLatexTooltip)
    .use(mathInlineInputRule)
    .use(mathBlockInputRule)
    .use(blockLatexSchema)
    .use(toggleLatexCommand)
}

function renderLatex(content: string, options?: KatexOptions) {
  const html = katex.renderToString(content, {
    ...options,
    throwOnError: false,
    displayMode: true,
  })
  return html
}
