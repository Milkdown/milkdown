import { $prose } from '@milkdown/utils'
import { imeSpan } from 'prosemirror-safari-ime-span'

import { withMeta } from '../__internal__'

/// This plugin fixes an IME composing bug in a table in the Safari browser. See
/// the
/// [original discussion](https://discuss.prosemirror.net/t/ime-composing-problems-on-td-or-th-element-in-safari-browser/4501).
export const autoInsertSpanPlugin = $prose(() => imeSpan)

withMeta(autoInsertSpanPlugin, {
  displayName: 'Prose<autoInsertSpanPlugin>',
  group: 'Prose',
})
