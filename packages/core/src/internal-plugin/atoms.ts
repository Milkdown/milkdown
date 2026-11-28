import type { SliceType, TimerType } from '@milkdown/ctx'
import type { InputRule } from '@milkdown/prose/inputrules'
import type { EditorState, Plugin } from '@milkdown/prose/state'
import type {
  EditorView,
  MarkViewConstructor,
  NodeViewConstructor,
} from '@milkdown/prose/view'
import type { RemarkParser, RemarkPlugin } from '@milkdown/transformer'
import type { Options } from 'remark-stringify'

import { createSlice } from '@milkdown/ctx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

import type { Editor } from '../editor'

import { remarkHandlers } from '../__internal__'

/// A slice which contains the editor view instance.
export const editorViewCtx = createSlice({} as EditorView, 'editorView')

/// A slice which contains the editor state.
export const editorStateCtx = createSlice({} as EditorState, 'editorState')

/// A slice that holds the timers to wait for before the plugin
/// runs. It defaults to `[ConfigReady]`.
export const initTimerCtx = createSlice([] as TimerType[], 'initTimer')

/// A slice which stores the editor instance.
export const editorCtx = createSlice({} as Editor, 'editor')

/// A slice which stores the input rules.
export const inputRulesCtx = createSlice([] as InputRule[], 'inputRules')

/// A slice which stores the prosemirror plugins.
export const prosePluginsCtx = createSlice([] as Plugin[], 'prosePlugins')

/// A slice which stores the remark plugins.
export const remarkPluginsCtx = createSlice(
  [] as RemarkPlugin[],
  'remarkPlugins'
)

type NodeView = [nodeId: string, view: NodeViewConstructor]

/// A slice which stores the prosemirror node views.
export const nodeViewCtx = createSlice([] as NodeView[], 'nodeView')

type MarkView = [nodeId: string, view: MarkViewConstructor]

/// A slice which stores the prosemirror mark views.
export const markViewCtx = createSlice([] as MarkView[], 'markView')

/// A slice which stores the remark instance.
export const remarkCtx: SliceType<RemarkParser, 'remark'> = createSlice(
  unified().use(remarkParse).use(remarkStringify),
  'remark'
)

/// A slice which stores the remark stringify options.
///
/// These options decide how the serializer writes markdown. The ones that
/// people ask for most:
///
/// - `bullet`: the marker of a bullet list, `*` by default. Set `-` to
///   write `- item`.
/// - `bulletOrdered`: the delimiter of an ordered list, `.` by default.
/// - `rule`: the marker of a thematic break, `*` by default.
/// - `resourceLink`: write `[https://a.b](https://a.b)` instead of the
///   autolink `<https://a.b>`.
/// - `listItemIndent`, `fence`, `emphasis`, `strong`, `setext`,
///   `incrementListMarker`: see
///   [the options of mdast-util-to-markdown](https://github.com/syntax-tree/mdast-util-to-markdown#options).
///
/// Update the slice instead of replacing it, so the handlers that the
/// editor needs stay in place:
///
/// ```typescript
/// ctx.update(remarkStringifyOptionsCtx, (prev) => ({ ...prev, bullet: '-' }))
/// ```
///
/// To keep markdown as it was written instead of normalizing it, see
/// `preserveSourceCtx`.
export const remarkStringifyOptionsCtx = createSlice(
  {
    handlers: remarkHandlers,
    encode: [],
  } as Options,
  'remarkStringifyOptions'
)
