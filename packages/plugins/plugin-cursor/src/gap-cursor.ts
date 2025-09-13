import { gapCursor } from '@milkdown/prose/gapcursor'
import { $prose } from '@milkdown/utils'

import { withMeta } from './__internal__/with-meta'

/// This plugin wraps [gap cursor](https://github.com/ProseMirror/prosemirror-gapcursor).
export const gapCursorPlugin = $prose(() => gapCursor())

withMeta(gapCursorPlugin, {
  displayName: 'Prose<gapCursor>',
})
