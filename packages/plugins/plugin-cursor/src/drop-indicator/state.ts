import { $ctx } from '@milkdown/utils'

import type { ShowHandlerOptions } from './types'

import { withMeta } from '../__internal__/with-meta'

/// @internal
export type DropIndicatorState = ShowHandlerOptions | null

/// The drop indicator state to store the current drop indicator information.
export const dropIndicatorState = $ctx(
  null as DropIndicatorState,
  'dropIndicatorState'
)

withMeta(dropIndicatorState, {
  displayName: 'Ctx<dropIndicatorState>',
})

/// Configuration for the drop indicator.
export type dropIndicatorConfig = {
  /// The width of the drop indicator in pixels.
  width: number
  /// The color of the drop indicator.
  color: string | false
  /// The CSS class of the drop indicator.
  class: string
}

/// The drop indicator configuration with default values.
export const dropIndicatorConfig = $ctx(
  {
    width: 2,
    color: false,
    class: 'milkdown-drop-indicator',
  } as dropIndicatorConfig,
  'dropIndicatorConfig'
)

withMeta(dropIndicatorConfig, {
  displayName: 'Ctx<dropIndicatorConfig>',
})
