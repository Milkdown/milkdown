import type { MilkdownPlugin } from '@milkdown/ctx'
import type { Handle } from 'mdast-util-to-markdown'

import {
  ConfigReady,
  initTimerCtx,
  remarkStringifyOptionsCtx,
} from '@milkdown/core'
import { addTimer } from '@milkdown/utils'
import { defaultHandlers } from 'mdast-util-to-markdown'

import { isBulletMarker, isOrderedDelimiter, withMeta } from '../__internal__'

// Write a list with the marker it has: `marker` for a bullet list and
// `delimiter` for an ordered list. The handler of remark takes both from
// the options, so set them for the time it runs. A list inside this one
// that has no marker of its own gets the same marker.
const withListMarker =
  (list: Handle): Handle =>
  (node, parent, state, info) => {
    const { bullet, bulletOther, bulletOrdered } = state.options
    const { marker, delimiter } = node as {
      marker?: unknown
      delimiter?: unknown
    }

    if (!node.ordered && isBulletMarker(marker)) {
      state.options.bullet = marker
      // Remark takes `bulletOther` for a list that comes right after
      // another list, and wants it to differ from `bullet`. Without the
      // option it picks one that does.
      if (bulletOther === marker) state.options.bulletOther = undefined
    }
    if (node.ordered && isOrderedDelimiter(delimiter))
      state.options.bulletOrdered = delimiter

    try {
      return list(node, parent, state, info)
    } finally {
      state.options.bullet = bullet
      state.options.bulletOther = bulletOther
      state.options.bulletOrdered = bulletOrdered
    }
  }

/// This plugin makes the serializer write a list with the marker that the
/// list has: the `marker` of a bullet list and the `delimiter` of an
/// ordered list. Without this plugin every list is written with the
/// `bullet` and `bulletOrdered` options of `remarkStringifyOptionsCtx`.
///
/// It adds a handler for lists to the stringify options, around the one
/// that is already there. It does so after the config ran, so a config
/// that sets the options does not remove it.
export const listMarkerHandlerPlugin = addTimer<MilkdownPlugin>(
  async (ctx, _plugin, done) => {
    await ctx.wait(ConfigReady)
    ctx.update(remarkStringifyOptionsCtx, (options) => ({
      ...options,
      handlers: {
        ...options.handlers,
        list: withListMarker(options.handlers?.list ?? defaultHandlers.list),
      },
    }))
    done()
  },
  // The remark instance is built from the options, so it has to wait.
  initTimerCtx,
  'ListMarkerHandlerReady'
)

withMeta(listMarkerHandlerPlugin, {
  displayName: 'Plugin<listMarkerHandler>',
  group: 'List',
})
