/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, Slice, Timer } from '@milkdown/ctx'
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
import { ThemeReady } from './theme'

export const InitReady = createTimer('InitReady')

export const initTimerCtx = createSlice([] as Timer[], 'initTimer')
export const editorCtx = createSlice({} as Editor, 'editor')

export const inputRulesCtx = createSlice([] as InputRule[], 'inputRules')
export const prosePluginsCtx = createSlice([] as Plugin[], 'prosePlugins')
export const remarkPluginsCtx = createSlice([] as RemarkPlugin[], 'remarkPlugins')

type NodeView = [nodeId: string, view: NodeViewConstructor]
export const nodeViewCtx = createSlice([] as NodeView[], 'nodeView')
type MarkView = [nodeId: string, view: MarkViewConstructor]
export const markViewCtx = createSlice([] as MarkView[], 'markView')

export const remarkCtx: Slice<RemarkParser> = createSlice(unified().use(remarkParse).use(remarkStringify), 'remark')
export const remarkStringifyDefaultOptions: Options = {}
export const remarkStringifyOptionsCtx = createSlice(remarkStringifyDefaultOptions, 'remarkStringifyOptions')

export const init
    = (editor: Editor): MilkdownPlugin =>
      (pre) => {
        pre.inject(editorCtx, editor)
          .inject(prosePluginsCtx)
          .inject(remarkPluginsCtx)
          .inject(inputRulesCtx)
          .inject(nodeViewCtx)
          .inject(markViewCtx)
          .inject(remarkStringifyOptionsCtx)
          .inject(remarkCtx, unified().use(remarkParse).use(remarkStringify))
          .inject(initTimerCtx, [ThemeReady])
          .record(InitReady)

        return async (ctx) => {
          await ctx.waitTimers(initTimerCtx)
          const options = ctx.get(remarkStringifyOptionsCtx)
          ctx.set(remarkCtx, unified().use(remarkParse).use(remarkStringify, options))

          ctx.done(InitReady)

          return (post) => {
            post.remove(editorCtx)
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
