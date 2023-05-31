/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, SliceType, TimerType } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import type { InputRule } from '@milkdown/prose/inputrules'
import type { Plugin } from '@milkdown/prose/state'
import type { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view'
import type { RemarkParser, RemarkPlugin } from '@milkdown/transformer'
import remarkParse from 'remark-parse'
import type { Options } from 'remark-stringify'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

import type { Editor } from '../editor'
import { remarkHandlers, withMeta } from '../__internal__'
import { ConfigReady } from './config'

/// The timer which will be resolved when the init plugin is ready.
export const InitReady = createTimer('InitReady')

/// A slice which stores timers that need to be waited for before starting to run the plugin.
/// By default, it's `[ConfigReady]`.
export const initTimerCtx = createSlice([] as TimerType[], 'initTimer')

/// A slice which stores the editor instance.
export const editorCtx = createSlice({} as Editor, 'editor')

/// A slice which stores the input rules.
export const inputRulesCtx = createSlice([] as InputRule[], 'inputRules')

/// A slice which stores the prosemirror plugins.
export const prosePluginsCtx = createSlice([] as Plugin[], 'prosePlugins')

/// A slice which stores the remark plugins.
export const remarkPluginsCtx = createSlice([] as RemarkPlugin[], 'remarkPlugins')

type NodeView = [nodeId: string, view: NodeViewConstructor]

/// A slice which stores the prosemirror node views.
export const nodeViewCtx = createSlice([] as NodeView[], 'nodeView')

type MarkView = [nodeId: string, view: MarkViewConstructor]

/// A slice which stores the prosemirror mark views.
export const markViewCtx = createSlice([] as MarkView[], 'markView')

/// A slice which stores the remark instance.
export const remarkCtx: SliceType<RemarkParser, 'remark'> = createSlice(unified().use(remarkParse).use(remarkStringify), 'remark')

/// A slice which stores the remark stringify options.
export const remarkStringifyOptionsCtx = createSlice({
  handlers: remarkHandlers,
} as Options, 'remarkStringifyOptions')

/// The init plugin.
/// This plugin prepare slices that needed by other plugins. And create a remark instance.
///
/// This plugin will wait for the config plugin.
export const init = (editor: Editor): MilkdownPlugin => {
  const plugin: MilkdownPlugin = (ctx) => {
    ctx.inject(editorCtx, editor)
      .inject(prosePluginsCtx, [])
      .inject(remarkPluginsCtx, [])
      .inject(inputRulesCtx, [])
      .inject(nodeViewCtx, [])
      .inject(markViewCtx, [])
      .inject(remarkStringifyOptionsCtx, {
        handlers: remarkHandlers,
      })
      .inject(remarkCtx, unified().use(remarkParse).use(remarkStringify))
      .inject(initTimerCtx, [ConfigReady])
      .record(InitReady)

    return async () => {
      await ctx.waitTimers(initTimerCtx)
      const options = ctx.get(remarkStringifyOptionsCtx)
      ctx.set(remarkCtx, unified().use(remarkParse).use(remarkStringify, options))

      ctx.done(InitReady)

      return () => {
        ctx.remove(editorCtx)
          .remove(prosePluginsCtx)
          .remove(remarkPluginsCtx)
          .remove(inputRulesCtx)
          .remove(nodeViewCtx)
          .remove(markViewCtx)
          .remove(remarkStringifyOptionsCtx)
          .remove(remarkCtx)
          .remove(initTimerCtx)
          .clearTimer(InitReady)
      }
    }
  }
  withMeta(plugin, {
    displayName: 'Init',
  })

  return plugin
}
