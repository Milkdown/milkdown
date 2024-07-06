import { $prose } from '@milkdown/utils'
import { imeSpan } from 'prosemirror-safari-ime-span'
import { withMeta } from '../__internal__'

/// This plugin is used to fix the bug of IME composing in table in Safari browser.
/// original discussion in https://discuss.prosemirror.net/t/ime-composing-problems-on-td-or-th-element-in-safari-browser/4501
export const autoInsertSpanPlugin = $prose(() => imeSpan)

withMeta(autoInsertSpanPlugin, {
  displayName: 'Prose<autoInsertSpanPlugin>',
  group: 'Prose',
})
