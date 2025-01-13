import { $inputRule } from '@milkdown/kit/utils'
import { nodeRule } from '@milkdown/kit/prose'
import { mathInlineSchema } from './inline-latex'

/// Input rule for inline math.
/// When you type $E=MC^2$, it will create an inline math node.
export const mathInlineInputRule = $inputRule((ctx) =>
  nodeRule(/(?:\$)([^$]+)(?:\$)$/, mathInlineSchema.type(ctx), {
    getAttr: (match) => {
      return {
        value: match[1] ?? '',
      }
    }
  })
)
