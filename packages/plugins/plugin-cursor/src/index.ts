import type { Meta, MilkdownPlugin } from '@milkdown/ctx'
import { dropCursor } from '@milkdown/prose/dropcursor'
import { gapCursor } from '@milkdown/prose/gapcursor'
import { $ctx, $prose } from '@milkdown/utils'

function withMeta<T extends MilkdownPlugin>(plugin: T, meta: Partial<Meta> & Pick<Meta, 'displayName'>): T {
  Object.assign(plugin, {
    meta: {
      package: '@milkdown/plugin-cursor',
      ...meta,
    },
  })

  return plugin
}

/// @internal
export interface DropCursorOptions {
  /**
    The color of the cursor. Defaults to `black`.
   */
  color?: string | false
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

withMeta(dropCursorConfig, {
  displayName: 'Ctx<dropCursor>',
})

/// This plugin wraps [drop cursor](https://github.com/ProseMirror/prosemirror-dropcursor).
export const dropCursorPlugin = $prose(ctx => dropCursor(ctx.get(dropCursorConfig.key)))

withMeta(dropCursorPlugin, {
  displayName: 'Prose<dropCursor>',
})

/// This plugin wraps [gap cursor](https://github.com/ProseMirror/prosemirror-gapcursor).
export const gapCursorPlugin = $prose(() => gapCursor())

withMeta(gapCursorPlugin, {
  displayName: 'Prose<gapCursor>',
})

/// All plugins exported by this package.
export const cursor: MilkdownPlugin[] = [dropCursorConfig, dropCursorPlugin, gapCursorPlugin]
