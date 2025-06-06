import type { Ctx } from '@milkdown/kit/ctx'
import type { Selection } from '@milkdown/kit/prose/state'

import { Icon } from '@milkdown/kit/component'
import { toggleLinkCommand } from '@milkdown/kit/component/link-tooltip'
import { commandsCtx, editorCtx, EditorStatus } from '@milkdown/kit/core'
import {
  emphasisSchema,
  inlineCodeSchema,
  isMarkSelectedCommand,
  isNodeSelectedCommand,
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
import { MarkType, type NodeType } from '@milkdown/kit/prose/model'
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
    const { ctx, config } = props

    const onClick = (fn: (ctx: Ctx) => void) => (e: MouseEvent) => {
      e.preventDefault()
      ctx && fn(ctx)
    }

    function isActive(type: NodeType | MarkType) {
      // make sure the function subscribed to vue reactive
      props.selection.value
      // Check if the edtior is ready
      const status = ctx.get(editorCtx).status
      if (status !== EditorStatus.Created) return false

      const commands = ctx.get(commandsCtx)
      if (type instanceof MarkType) {
        return commands.call(isMarkSelectedCommand.key, type)
      }

      return commands.call(isNodeSelectedCommand.key, type)
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
              ctx && isActive(strongSchema.type(ctx)) && 'active'
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
              ctx && isActive(emphasisSchema.type(ctx)) && 'active'
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
              ctx && isActive(strikethroughSchema.type(ctx)) && 'active'
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
              ctx && isActive(inlineCodeSchema.type(ctx)) && 'active'
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
                ctx && isActive(mathInlineSchema.type(ctx)) && 'active'
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
              ctx && isActive(linkSchema.type(ctx)) && 'active'
            )}
            onPointerdown={onClick((ctx) => {
              const commands = ctx.get(commandsCtx)
              commands.call(toggleLinkCommand.key)
            })}
          >
            <Icon icon={config?.linkIcon ?? linkIcon} />
          </button>
        </>
      )
    }
  },
})
