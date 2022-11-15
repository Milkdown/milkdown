/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { ThemeIcon, commandsCtx, schemaCtx, themeManagerCtx } from '@milkdown/core'
import type { Icon } from '@milkdown/design-system'
import type { MarkType } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'

import { hasMark, isTextAndNotHasMark } from './utility'

export type Pred = (view: EditorView) => boolean
export type Updater = (view: EditorView, $: HTMLElement) => void
export type Event2Command = (e: Event) => void

export type OnClick = (ctx: Ctx) => void

export interface Item {
  icon: Icon | ((ctx: Ctx) => HTMLElement)
  onClick: string | ((ctx: Ctx) => () => void)
  isHidden: (ctx: Ctx) => Pred
  isActive: (ctx: Ctx) => Pred
  canAddToDOM: (ctx: Ctx) => Pred
}

export interface ButtonItem {
  $: HTMLElement
  command: () => void
  active: Pred
  disable?: Pred
  enable: Pred
}

export const createToggleIcon = (icon: Icon, onClick: string, mark?: MarkType, disableForMark?: MarkType): Item => ({
  icon,
  onClick,
  isHidden: () => (view: EditorView) => isTextAndNotHasMark(view.state, disableForMark),
  isActive: () => (view: EditorView) => hasMark(view.state, mark),
  canAddToDOM: () => (view: EditorView) => !!mark && !!view.state.schema.marks[mark.name],
})

export const defaultButtons = (ctx: Ctx) => {
  const marks = ctx.get(schemaCtx).marks
  return [
    createToggleIcon('bold', 'ToggleBold', marks.strong),
    createToggleIcon('italic', 'ToggleItalic', marks.em),
    createToggleIcon('strikeThrough', 'ToggleStrikeThrough', marks.strike_through),
    createToggleIcon('code', 'ToggleInlineCode', marks.code_inline),
    createToggleIcon('link', 'ToggleLink', marks.link),
  ]
}

export type ButtonList = ButtonItem[]

export interface TooltipOptions {
  bottom: boolean
  items: (ctx: Ctx) => Array<Item>
}

export const buttonMap = (ctx: Ctx, items: (ctx: Ctx) => Array<Item> = defaultButtons): ButtonList => {
  const toButton = ({ icon, onClick, isHidden, isActive, canAddToDOM }: Item): ButtonItem => ({
    $: typeof icon === 'function' ? icon(ctx) : (ctx.get(themeManagerCtx).get(ThemeIcon, icon)?.dom as HTMLElement),
    command: typeof onClick === 'string' ? () => ctx.get(commandsCtx).call(onClick) : onClick(ctx),
    disable: isHidden(ctx),
    active: isActive(ctx),
    enable: canAddToDOM(ctx),
  })
  return items(ctx).map(toButton)
}
