/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/ctx'
import { dropCursor } from '@milkdown/prose/dropcursor'
import { gapCursor } from '@milkdown/prose/gapcursor'
import { $ctx, $prose } from '@milkdown/utils'

export type DropCursorOptions = {
  /**
    The color of the cursor. Defaults to `black`.
    */
  color?: string
  /**
    The precise width of the cursor in pixels. Defaults to 1.
    */
  width?: number
  /**
    A CSS class name to add to the cursor element.
    */
  class?: string
}

export const dropCursorConfig = $ctx<DropCursorOptions, 'dropCursorConfig'>({}, 'dropCursorConfig')
export const dropCursorPlugin = $prose(ctx => dropCursor(ctx.get(dropCursorConfig.key)))

export const gapCursorPlugin = $prose(() => gapCursor())

export const cursor: MilkdownPlugin[] = [dropCursorConfig, dropCursorPlugin, gapCursorPlugin]
