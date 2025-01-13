import type { Component } from 'atomico'
import { c, html, useEffect, useUpdate } from 'atomico'
import type { Ctx } from '@milkdown/kit/ctx'
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
import type { MarkType, Node, NodeType } from '@milkdown/kit/prose/model'
import type { Selection } from '@milkdown/kit/prose/state'
import clsx from 'clsx'
import { linkTooltipAPI } from '@milkdown/kit/component/link-tooltip'
import {
  strikethroughSchema,
  toggleStrikethroughCommand,
} from '@milkdown/kit/preset/gfm'
import {
  boldIcon,
  codeIcon,
  italicIcon,
  linkIcon,
  strikethroughIcon,
} from '../../icons'
import type { ToolbarFeatureConfig } from './index'
import { functionsIcon } from '../../icons/functions'
import { NodeSelection, TextSelection } from '@milkdown/kit/prose/state'
import { mathInlineSchema } from '../latex/inline-latex'
import { FeaturesCtx } from '../../core/slice'
import { CrepeFeature } from '../..'

export interface ToolbarProps {
  ctx: Ctx
  hide: () => void
  show: boolean
  selection: Selection
  config?: ToolbarFeatureConfig
}

export const toolbarComponent: Component<ToolbarProps> = ({
  ctx,
  hide,
  show,
  config,
  selection,
}) => {
  const update = useUpdate()
  useEffect(() => {
    update()
  }, [show])

  const onClick = (fn: (ctx: Ctx) => void) => (e: MouseEvent) => {
    e.preventDefault()
    ctx && fn(ctx)
    update()
  }

  const isActive = (mark: MarkType) => {
    if (!ctx || !selection) return false
    const view = ctx.get(editorViewCtx)
    const {
      state: { doc },
    } = view
    return doc.rangeHasMark(selection.from, selection.to, mark)
  }

  const containsNode = (node: NodeType) => {
    if (!ctx || !selection) return false
    const view = ctx.get(editorViewCtx)
    const {
      state: { doc },
    } = view
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

  const flags = ctx?.get(FeaturesCtx)
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

  return html`<host>
    <button
      type="button"
      class=${clsx(
        'toolbar-item',
        ctx && isActive(strongSchema.type(ctx)) && 'active'
      )}
      onmousedown=${onClick((ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleStrongCommand.key)
      })}
    >
      ${config?.boldIcon?.() ?? boldIcon}
    </button>
    <button
      type="button"
      class=${clsx(
        'toolbar-item',
        ctx && isActive(emphasisSchema.type(ctx)) && 'active'
      )}
      onmousedown=${onClick((ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleEmphasisCommand.key)
      })}
    >
      ${config?.italicIcon?.() ?? italicIcon}
    </button>
    <button
      type="button"
      class=${clsx(
        'toolbar-item',
        ctx && isActive(strikethroughSchema.type(ctx)) && 'active'
      )}
      onmousedown=${onClick((ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleStrikethroughCommand.key)
      })}
    >
      ${config?.strikethroughIcon?.() ?? strikethroughIcon}
    </button>
    <div class="divider"></div>
    <button
      type="button"
      class=${clsx(
        'toolbar-item',
        ctx && isActive(inlineCodeSchema.type(ctx)) && 'active'
      )}
      onmousedown=${onClick((ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleInlineCodeCommand.key)
      })}
    >
      ${config?.codeIcon?.() ?? codeIcon}
    </button>
    ${isLatexEnabled &&
    html`<button
      type="button"
      class=${clsx(
        'toolbar-item',
        ctx && containsNode(mathInlineSchema.type(ctx)) && 'active'
      )}
      onmousedown=${onClick(toggleLatex)}
    >
      ${config?.latexIcon?.() ?? functionsIcon}
    </button>`}
    <button
      type="button"
      class=${clsx(
        'toolbar-item',
        ctx && isActive(linkSchema.type(ctx)) && 'active'
      )}
      onmousedown=${onClick((ctx) => {
        const view = ctx.get(editorViewCtx)
        const { selection } = view.state

        if (isActive(linkSchema.type(ctx))) {
          ctx.get(linkTooltipAPI.key).removeLink(selection.from, selection.to)
          return
        }

        ctx.get(linkTooltipAPI.key).addLink(selection.from, selection.to)
        hide?.()
      })}
    >
      ${config?.linkIcon?.() ?? linkIcon}
    </button>
  </host>`
}

toolbarComponent.props = {
  ctx: Object,
  hide: Function,
  show: Boolean,
  config: Object,
  selection: Object,
}

export const ToolbarElement = c(toolbarComponent)
