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
import type { MarkType } from '@milkdown/kit/prose/model'
import clsx from 'clsx'
import { linkTooltipAPI } from '@milkdown/kit/component/link-tooltip'
import { strikethroughSchema, toggleStrikethroughCommand } from '@milkdown/kit/preset/gfm'
import { boldIcon, codeIcon, italicIcon, linkIcon, strikethroughIcon } from './consts'

export interface ToolbarProps {
  ctx: Ctx
  hide: () => void
  show: boolean
}

export const toolbarComponent: Component<ToolbarProps> = ({ ctx, hide, show }) => {
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
    if (!ctx)
      return false
    const view = ctx.get(editorViewCtx)
    const { state: { doc, selection } } = view
    return doc.rangeHasMark(selection.from, selection.to, mark)
  }

  return html`<host>
    <button
      class=${clsx('toolbar-item', ctx && isActive(strongSchema.type(ctx)) && 'active')}
      onmousedown=${onClick((ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleStrongCommand.key)
      })}
    >
      ${boldIcon}
    </button>
    <button
      class=${clsx('toolbar-item', ctx && isActive(emphasisSchema.type(ctx)) && 'active')}
      onmousedown=${onClick((ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleEmphasisCommand.key)
      })}
    >
      ${italicIcon}
    </button>
    <button
      class=${clsx('toolbar-item', ctx && isActive(strikethroughSchema.type(ctx)) && 'active')}
      onmousedown=${onClick((ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleStrikethroughCommand.key)
      })}
    >
      ${strikethroughIcon}
    </button>
    <div class="divider"></div>
    <button
      class=${clsx('toolbar-item', ctx && isActive(inlineCodeSchema.type(ctx)) && 'active')}
      onmousedown=${onClick((ctx) => {
        const commands = ctx.get(commandsCtx)
        commands.call(toggleInlineCodeCommand.key)
      })}
    >
      ${codeIcon}
    </button>
    <button
      class=${clsx('toolbar-item', ctx && isActive(linkSchema.type(ctx)) && 'active')}
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
      ${linkIcon}
    </button>
  </host>`
}

toolbarComponent.props = {
  ctx: Object,
  hide: Function,
  show: Boolean,
}

export const ToolbarElement = c(toolbarComponent)
