/* Copyright 2021, Milkdown by Mirone. */
import type { Component } from 'atomico'
import { c, html, useEffect, useUpdate } from 'atomico'
import type { Ctx } from '@milkdown/ctx'
import { commandsCtx, editorViewCtx } from '@milkdown/core'
import {
  emphasisSchema,
  inlineCodeSchema,
  linkSchema,
  strongSchema,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleStrongCommand,
} from '@milkdown/preset-commonmark'
import type { MarkType } from '@milkdown/prose/model'
import clsx from 'clsx'
import { linkTooltipAPI } from '@milkdown/components'
import { boldIcon, codeIcon, italicIcon, linkIcon } from './consts'

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
