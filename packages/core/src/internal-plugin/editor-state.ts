import type { MilkdownPlugin, TimerType } from '@milkdown/ctx'
import type { Schema } from '@milkdown/prose/model'
import type { JSONRecord, Parser } from '@milkdown/transformer'

import { createSlice, createTimer } from '@milkdown/ctx'
import { docTypeError } from '@milkdown/exception'
import { customInputRules as createInputRules } from '@milkdown/prose'
import { keymap as createKeymap } from '@milkdown/prose/keymap'
import { DOMParser, Node } from '@milkdown/prose/model'
import { EditorState, Plugin, PluginKey } from '@milkdown/prose/state'

import { withMeta } from '../__internal__'
import { editorStateCtx, inputRulesCtx, prosePluginsCtx } from './atoms'
import { CommandsReady } from './commands'
import { keymapCtx, KeymapReady } from './keymap'
import { ParserReady, parserCtx } from './parser'
import { schemaCtx } from './schema'
import { SerializerReady } from './serializer'

/// @internal
export type DefaultValue =
  | string
  | { type: 'html'; dom: HTMLElement }
  | { type: 'json'; value: JSONRecord }
type StateOptions = Parameters<typeof EditorState.create>[0]
type StateOptionsOverride = (prev: StateOptions) => StateOptions

/// A slice which contains the default value of the editor.
/// Can be markdown string, html string or json.
export const defaultValueCtx = createSlice('' as DefaultValue, 'defaultValue')

/// A slice which contains the options which is used to create the editor state.
export const editorStateOptionsCtx = createSlice<StateOptionsOverride>(
  (x) => x,
  'stateOptions'
)

/// A slice which stores timers that need to be waited for before starting to run the plugin.
/// By default, it's `[ParserReady, SerializerReady, CommandsReady]`.
export const editorStateTimerCtx = createSlice(
  [] as TimerType[],
  'editorStateTimer'
)

/// The timer which will be resolved when the editor state plugin is ready.
export const EditorStateReady = createTimer('EditorStateReady')

/// @internal
export function getDoc(
  defaultValue: DefaultValue,
  parser: Parser,
  schema: Schema
) {
  if (typeof defaultValue === 'string') return parser(defaultValue)

  if (defaultValue.type === 'html')
    return DOMParser.fromSchema(schema).parse(defaultValue.dom)

  if (defaultValue.type === 'json')
    return Node.fromJSON(schema, defaultValue.value)

  throw docTypeError(defaultValue)
}

const key = new PluginKey('MILKDOWN_STATE_TRACKER')

/// The editor state plugin.
/// This plugin will create a prosemirror editor state.
///
/// This plugin will wait for the parser plugin, serializer plugin and commands plugin.
export const editorState: MilkdownPlugin = (ctx) => {
  ctx
    .inject(defaultValueCtx, '')
    .inject(editorStateCtx, {} as EditorState)
    .inject(editorStateOptionsCtx, (x) => x)
    .inject(editorStateTimerCtx, [
      ParserReady,
      SerializerReady,
      CommandsReady,
      KeymapReady,
    ])
    .record(EditorStateReady)

  return async () => {
    await ctx.waitTimers(editorStateTimerCtx)

    const schema = ctx.get(schemaCtx)
    const parser = ctx.get(parserCtx)
    const rules = ctx.get(inputRulesCtx)
    const optionsOverride = ctx.get(editorStateOptionsCtx)
    const prosePlugins = ctx.get(prosePluginsCtx)
    const defaultValue = ctx.get(defaultValueCtx)
    const doc = getDoc(defaultValue, parser, schema)
    const km = ctx.get(keymapCtx)
    const disposeBaseKeymap = km.addBaseKeymap()

    const plugins = [
      ...prosePlugins,
      new Plugin({
        key,
        state: {
          init: () => {
            // do nothing
          },
          apply: (_tr, _value, _oldState, newState) => {
            ctx.set(editorStateCtx, newState)
          },
        },
      }),
      createInputRules({ rules }),
      createKeymap(km.build()),
    ]

    ctx.set(prosePluginsCtx, plugins)

    const options = optionsOverride({
      schema,
      doc,
      plugins,
    })

    const state = EditorState.create(options)
    ctx.set(editorStateCtx, state)
    ctx.done(EditorStateReady)

    return () => {
      disposeBaseKeymap()
      ctx
        .remove(defaultValueCtx)
        .remove(editorStateCtx)
        .remove(editorStateOptionsCtx)
        .remove(editorStateTimerCtx)
        .clearTimer(EditorStateReady)
    }
  }
}

withMeta(editorState, {
  displayName: 'EditorState',
})
