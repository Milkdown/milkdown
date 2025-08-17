import { $ctx, $prose } from '@milkdown/utils'
import { createHighlightPlugin } from 'prosemirror-highlight'

type HighlightPluginOptions = Parameters<typeof createHighlightPlugin>[0]

/// Config for the highlight plugin.
export const highlightPluginConfig = $ctx<
  HighlightPluginOptions,
  'highlightPluginConfig'
>({} as HighlightPluginOptions, 'highlightPluginConfig')

highlightPluginConfig.meta = {
  package: '@milkdown/plugin-highlight',
  displayName: 'Ctx<highlightPluginConfig>',
}

/// Highlight plugin.
export const highlightPlugin = $prose((ctx) => {
  const config = ctx.get(highlightPluginConfig.key)
  if (!config.parser) {
    throw new Error(
      'Highlight plugin requires a parser to be set in the highlightPluginConfig.'
    )
  }
  return createHighlightPlugin(config)
})

highlightPlugin.meta = {
  package: '@milkdown/plugin-highlight',
  displayName: 'Highlight Plugin',
}
