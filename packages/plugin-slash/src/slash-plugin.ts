/* Copyright 2021, Milkdown by Mirone. */
import type { Slice } from '@milkdown/core'
import type { PluginView } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import type { $Ctx, $Prose } from '@milkdown/utils'
import { $ctx, $prose } from '@milkdown/utils'

export type SlashViewFactory = (view: EditorView) => PluginView
export type SlashViewId<Id extends string> = `${Id}_SLASH_VIEW`

export type SlashPlugin<Id extends string> = [$Ctx<SlashViewFactory, SlashViewId<Id>>, $Prose] & {
  key: Slice<SlashViewFactory, SlashViewId<Id>>
  pluginKey: $Prose['key']
}

export const slashFactory = <Id extends string>(id: Id) => {
  const slashView = $ctx<SlashViewFactory, SlashViewId<Id>>(() => ({}), `${id}_SLASH_VIEW`)
  const slashPlugin = $prose((ctx) => {
    const view = ctx.get(slashView.key)
    return new Plugin({
      key: new PluginKey(`${id}_SLASH`),
      view,
    })
  })
  const result = [slashView, slashPlugin] as SlashPlugin<Id>
  result.key = slashView.key
  result.pluginKey = slashPlugin.key

  return result
}

export const slash = slashFactory('MILKDOWN')
