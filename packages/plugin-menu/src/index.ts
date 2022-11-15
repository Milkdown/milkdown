/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { createCmd, rootDOMCtx } from '@milkdown/core'
import { selectParentNode } from '@milkdown/prose/commands'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { AtomList, createPlugin } from '@milkdown/utils'

import type { Config } from './default-config'
import { SelectParent, defaultConfig } from './default-config'
import { Manager } from './manager'
import type { HandleDOM } from './menubar'
import { initWrapper, menubar } from './menubar'

export const menuKey = new PluginKey('MILKDOWN_MENU')

export * from './default-config'
export type { HandleDOM, HandleDOMParams } from './menubar'

export interface Options {
  config: Config | ((ctx: Ctx) => Config)
  domHandler: HandleDOM
}

export const menuPlugin = createPlugin<string, Options>((utils, options) => {
  const domHandler = options?.domHandler

  let restoreDOM: (() => void) | null = null
  let menu: HTMLDivElement | null = null
  let menuWrapper: HTMLDivElement | null = null
  let manager: Manager | null = null

  const initIfNecessary = (ctx: Ctx, editorView: EditorView) => {
    const config: Config = options?.config
      ? typeof options.config === 'function'
        ? options.config(ctx)
        : options.config
      : defaultConfig

    if (!editorView.editable)
      return

    if (!menuWrapper) {
      menuWrapper = initWrapper(ctx, editorView)
      ctx.set(rootDOMCtx, menuWrapper)
    }

    if (!menu) {
      const [_menu, _restoreDOM] = menubar(utils, editorView, ctx, menuWrapper, domHandler)
      menu = _menu
      restoreDOM = () => {
        const milkdownDOM = _restoreDOM()
        menuWrapper = null
        menu = null
        manager = null
        restoreDOM = null
        ctx.set(rootDOMCtx, milkdownDOM)
      }
    }

    if (!manager)
      manager = new Manager(config, utils, ctx, menu, editorView)
  }

  return {
    commands: () => [createCmd(SelectParent, () => selectParentNode)],
    prosePlugins: (_, ctx) => {
      const plugin = new Plugin({
        key: menuKey,
        view: (editorView) => {
          initIfNecessary(ctx, editorView)
          if (editorView.editable)
            manager?.update(editorView)

          return {
            update: (view) => {
              initIfNecessary(ctx, editorView)
              if (editorView.editable)
                manager?.update(view)
              else
                restoreDOM?.()
            },
            destroy: () => {
              restoreDOM?.()
            },
          }
        },
      })

      return [plugin]
    },
  }
})

export const menu = AtomList.create([menuPlugin()])
