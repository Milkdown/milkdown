import { $prose } from '@milkdown/utils'
import {
  createDropIndicatorPlugin,
  type ShowHandler,
} from 'prosemirror-drop-indicator'

import { withMeta } from '../__internal__/with-meta'
import { dropIndicatorState } from './state'

/// Drop indicator plugin to update the drop indicator state.
export const dropIndicatorPlugin = $prose((ctx) => {
  const onShow: ShowHandler = (options) => {
    ctx.set(dropIndicatorState.key, options)
  }
  const onHide: VoidFunction = () => {
    ctx.set(dropIndicatorState.key, null)
  }

  const plugin = createDropIndicatorPlugin({
    onShow,
    onHide,
    onDrag: () => true,
  })

  return plugin
})

withMeta(dropIndicatorPlugin, {
  displayName: 'Prose<dropIndicator>',
})
