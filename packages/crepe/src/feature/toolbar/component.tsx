import type { Ctx } from '@milkdown/kit/ctx'
import type { MarkType, NodeType } from '@milkdown/kit/prose/model'
import type { Selection } from '@milkdown/kit/prose/state'

import { Icon } from '@milkdown/kit/component'
import { linkTooltipAPI } from '@milkdown/kit/component/link-tooltip'
import { commandsCtx, editorViewCtx } from '@milkdown/kit/core'
import {
  emphasisSchema,
  inlineCodeSchema,
  linkSchema,
  strongSchema,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,
} from '@milkdown/kit/preset/commonmark'
import {
  strikethroughSchema,
  toggleStrikethroughCommand,
} from '@milkdown/kit/preset/gfm'
import { findNodeInSelection } from '@milkdown/kit/prose'
import clsx from 'clsx'
import { defineComponent, type Ref, type ShallowRef, h, Fragment } from 'vue'

import type { ToolbarFeatureConfig } from '.'

import { useCrepeFeatures } from '../../core/slice'
import { CrepeFeature } from '../../feature'
import {
  boldIcon,
  codeIcon,
  functionsIcon,
  italicIcon,
  linkIcon,
  strikethroughIcon,
} from '../../icons'
import { toggleLatexCommand } from '../latex/command'
import { mathInlineSchema } from '../latex/inline-latex'

h
Fragment

type ToolbarProps = {
  ctx: Ctx
  hide: () => void
  show: Ref<boolean>
  selection: ShallowRef<Selection>
  config?: ToolbarFeatureConfig
}

export const Toolbar = defineComponent<ToolbarProps>({
  props: {
    ctx: {
      type: Object,
      required: true,
    },
    hide: {
      type: Function,
      required: true,
    },
    show: {
      type: Object,
      required: true,
    },
    selection: {
      type: Object,
      required: true,
    },
    config: {
      type: Object,
      required: false,
    },
  },
  setup(props) {
    const { ctx, hide, config } = props

    const onClick = (fn: (ctx: Ctx) => void) => (e: MouseEvent) => {
      e.preventDefault()
      ctx && fn(ctx)
    }

    const isMarkActive = (mark: MarkType) => {
      // make sure the function subscribed to vue reactive
      props.selection.value

      if (!ctx) return false
      const { state } = ctx.get(editorViewCtx)
      if (!state) return false
      const { doc, selection } = state
      return doc.rangeHasMark(selection.from, selection.to, mark)
    }

    const isInlineNodeActive = (node: NodeType) => {
      // make sure the function subscribed to vue reactive
      props.selection.value

      if (!ctx) return false
      const state = ctx.get(editorViewCtx).state
      if (!state) return false

      const result = findNodeInSelection(ctx.get(editorViewCtx).state, node)
      return result.hasNode
    }

    const flags = useCrepeFeatures(ctx).get()
    const isLatexEnabled = flags?.includes(CrepeFeature.Latex)

    return () => {
      return (
        <>
          <button
            type="button"
            class={clsx(
              'toolbar-item',
              ctx &&
                props.selection &&
                isMarkActive(strongSchema.type(ctx)) &&
                'active'
            )}
            onPointerdown={onClick((ctx) => {
              const commands = ctx.get(commandsCtx)
              commands.call(toggleStrongCommand.key)
            })}
          >
            <Icon icon={config?.boldIcon ?? boldIcon} />
          </button>
          <button
            type="button"
            class={clsx(
              'toolbar-item',
              ctx && isMarkActive(emphasisSchema.type(ctx)) && 'active'
            )}
            onPointerdown={onClick((ctx) => {
              const commands = ctx.get(commandsCtx)
              commands.call(toggleEmphasisCommand.key)
            })}
          >
            <Icon icon={config?.italicIcon ?? italicIcon} />
          </button>
          <button
            type="button"
            class={clsx(
              'toolbar-item',
              ctx && isMarkActive(strikethroughSchema.type(ctx)) && 'active'
            )}
            onPointerdown={onClick((ctx) => {
              const commands = ctx.get(commandsCtx)
              commands.call(toggleStrikethroughCommand.key)
            })}
          >
            <Icon icon={config?.strikethroughIcon ?? strikethroughIcon} />
          </button>
          <div class="divider"></div>
          <button
            type="button"
            class={clsx(
              'toolbar-item',
              ctx && isMarkActive(inlineCodeSchema.type(ctx)) && 'active'
            )}
            onPointerdown={onClick((ctx) => {
              const commands = ctx.get(commandsCtx)
              commands.call(toggleInlineCodeCommand.key)
            })}
          >
            <Icon icon={config?.codeIcon ?? codeIcon} />
          </button>
          {isLatexEnabled && (
            <button
              type="button"
              class={clsx(
                'toolbar-item',
                ctx &&
                  isInlineNodeActive(mathInlineSchema.type(ctx)) &&
                  'active'
              )}
              onPointerdown={onClick((ctx) => {
                const commands = ctx.get(commandsCtx)
                commands.call(toggleLatexCommand.key)
              })}
            >
              <Icon icon={config?.latexIcon ?? functionsIcon} />
            </button>
          )}
          <button
            type="button"
            class={clsx(
              'toolbar-item',
              ctx && isMarkActive(linkSchema.type(ctx)) && 'active'
            )}
            onPointerdown={onClick((ctx) => {
              const view = ctx.get(editorViewCtx)
              const { selection } = view.state

              if (isMarkActive(linkSchema.type(ctx))) {
                ctx
                  .get(linkTooltipAPI.key)
                  .removeLink(selection.from, selection.to)
                return
              }

              ctx.get(linkTooltipAPI.key).addLink(selection.from, selection.to)
              hide?.()
            })}
          >
            <Icon icon={config?.linkIcon ?? linkIcon} />
          </button>
        </>
      )
    }
  },
})
