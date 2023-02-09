/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/ctx'
import { dropCursor } from '@milkdown/prose/dropcursor'
import { gapCursor } from '@milkdown/prose/gapcursor'
import { $ctx, $prose } from '@milkdown/utils'

/// @internal
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

/// A slice that contains [options for drop cursor](https://github.com/ProseMirror/prosemirror-dropcursor#documentation).
export const dropCursorConfig = $ctx<DropCursorOptions, 'dropCursorConfig'>({}, 'dropCursorConfig')

/// This plugin wraps [drop cursor](https://github.com/ProseMirror/prosemirror-dropcursor).
export const dropCursorPlugin = $prose(ctx => dropCursor(ctx.get(dropCursorConfig.key)))

/// This plugin wraps [gap cursor](https://github.com/ProseMirror/prosemirror-gapcursor).
export const gapCursorPlugin = $prose(() => gapCursor())

/// All plugins exported by this package.
export const cursor: MilkdownPlugin[] = [dropCursorConfig, dropCursorPlugin, gapCursorPlugin]
