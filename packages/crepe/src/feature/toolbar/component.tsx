import type { Ctx } from '@milkdown/kit/ctx'
import type { MarkType, NodeType, Node } from '@milkdown/kit/prose/model'

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
import {
  NodeSelection,
  TextSelection,
  type Selection,
} from '@milkdown/kit/prose/state'
import clsx from 'clsx'
import { defineComponent, type Ref, type ShallowRef, h, Fragment } from 'vue'

import type { ToolbarFeatureConfig, ToolbarItem } from '.'

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

    const isActive = (mark: MarkType) => {
      const selection = props.selection.value
      if (!ctx || !selection) return false
      const { state } = ctx.get(editorViewCtx)
      if (!state) return false
      const { doc } = state
      return doc.rangeHasMark(selection.from, selection.to, mark)
    }

    const containsNode = (node: NodeType) => {
      const selection = props.selection.value
      if (!ctx || !selection) return false
      const { state } = ctx.get(editorViewCtx)
      if (!state) return false
      const { doc } = state
      if (selection instanceof NodeSelection) {
        return selection.node.type === node
      }

      const { from, to } = selection

      let hasNode = false
      doc.nodesBetween(from, to, (n) => {
        if (n.type === node) {
          hasNode = true
          return false
        }
        return true
      })

      return hasNode
    }

    const flags = useCrepeFeatures(ctx).get()
    const isLatexEnabled = flags?.includes(CrepeFeature.Latex)

    const toggleLatex = (ctx: Ctx) => {
      const hasLatex = containsNode(mathInlineSchema.type(ctx))
      const view = ctx.get(editorViewCtx)
      const { selection, doc, tr } = view.state
      if (!hasLatex) {
        const text = doc.textBetween(selection.from, selection.to)
        let _tr = tr.replaceSelectionWith(
          mathInlineSchema.type(ctx).create({
            value: text,
          })
        )
        view.dispatch(
          _tr.setSelection(NodeSelection.create(_tr.doc, selection.from))
        )
        return
      }

      const { from, to } = selection
      let pos = -1
      let node: Node | null = null
      doc.nodesBetween(from, to, (n, p) => {
        if (node) return false
        if (n.type === mathInlineSchema.type(ctx)) {
          pos = p
          node = n
          return false
        }
        return true
      })
      if (!node || pos < 0) return

      let _tr = tr.delete(pos, pos + 1)
      const content = (node as Node).attrs.value
      _tr = _tr.insertText(content, pos)
      view.dispatch(
        _tr.setSelection(
          TextSelection.create(_tr.doc, from, to + content.length - 1)
        )
      )
    }

    const renderCustomItem = (item: ToolbarItem) => {
      const isItemActive = item.isActive?.(ctx, props.selection.value) ?? false
      const isItemDisabled = item.isDisabled?.(ctx, props.selection.value) ?? false

      return (
        <button
          key={item.key}
          type="button"
          class={clsx(
            'toolbar-item',
            isItemActive && 'active',
            isItemDisabled && 'disabled'
          )}
          disabled={isItemDisabled}
          title={item.tooltip}
          onPointerdown={onClick(() => item.onClick(ctx))}
        >
          <Icon icon={item.icon} />
        </button>
      )
    }

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
                ctx && containsNode(mathInlineSchema.type(ctx)) && 'active'
              )}
              onPointerdown={onClick(toggleLatex)}
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
              const view = ctx.get(editorViewCtx)
              const { selection } = view.state

              if (isActive(linkSchema.type(ctx))) {
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
          {config?.customItems && config.customItems.length > 0 && (
            <>
              <div class="divider"></div>
              {config.customItems.map(renderCustomItem)}
            </>
          )}
        </>
      )
    }
  },
})
