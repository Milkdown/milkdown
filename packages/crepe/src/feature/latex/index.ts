import type { KatexOptions } from 'katex'
import katex from 'katex'
import { codeBlockConfig } from '@milkdown/kit/component/code-block'
import { CrepeFeature } from '../..'
import { FeaturesCtx } from '../../core/slice'
import type { DefineFeature, Icon } from '../shared'
import { remarkMathBlockPlugin, remarkMathPlugin } from './remark'
import { mathInlineSchema } from './inline-latex'
import { defIfNotExists } from '../../utils'
import { LatexInlineEditElement } from './inline-tooltip/component'
import { inlineLatexTooltip } from './inline-tooltip/tooltip'
import { LatexInlineTooltip } from './inline-tooltip/view'
import { confirmIcon } from '../../icons'
import { mathBlockInputRule, mathInlineInputRule } from './input-rule'
import { blockLatexSchema } from './block-latex'

export interface LatexConfig {
  katexOptions: KatexOptions
  inlineEditConfirm: Icon
}

export type LatexFeatureConfig = Partial<LatexConfig>

defIfNotExists('milkdown-latex-inline-edit', LatexInlineEditElement)
export const defineFeature: DefineFeature<LatexFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config((ctx) => {
      const flags = ctx.get(FeaturesCtx)
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
            inlineEditConfirm: config?.inlineEditConfirm ?? (() => confirmIcon),
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
}

function renderLatex(content: string, options?: KatexOptions) {
  const html = katex.renderToString(content, {
    ...options,
    throwOnError: false,
    displayMode: true,
  })
  return html
}
