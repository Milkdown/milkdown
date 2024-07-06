import { tableEditing } from '@milkdown/prose/tables'
import { $prose } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// This plugin is wrapping the `tableEditing` plugin from [prosemirror-tables](https://github.com/ProseMirror/prosemirror-tables).
export const tableEditingPlugin = $prose(() => tableEditing({ allowTableNodeSelection: true }))

withMeta(tableEditingPlugin, {
  displayName: 'Prose<tableEditingPlugin>',
  group: 'Prose',
})
