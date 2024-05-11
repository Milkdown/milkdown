import { columnResizing } from '@milkdown/prose/tables'
import { $prose } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// This plugin is wrapping the `columnResizing` plugin from [prosemirror-tables](https://github.com/ProseMirror/prosemirror-tables).
export const columnResizingPlugin = $prose(() => columnResizing({}))

withMeta(columnResizingPlugin, {
  displayName: 'Prose<columnResizingPlugin>',
  group: 'Prose',
})
