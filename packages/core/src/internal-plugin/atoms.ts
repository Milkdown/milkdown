import { createSlice } from '@milkdown/ctx'
import type { EditorState, Plugin } from '@milkdown/prose/state'
import type {
  EditorView,
  MarkViewConstructor,
  NodeViewConstructor,
} from '@milkdown/prose/view'
import type { SliceType, TimerType } from '@milkdown/ctx'
import type { InputRule } from '@milkdown/prose/inputrules'
import type { RemarkParser, RemarkPlugin } from '@milkdown/transformer'
import remarkParse from 'remark-parse'
import type { Options } from 'remark-stringify'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import type { Editor } from '../editor'
import { remarkHandlers } from '../__internal__'

/// A slice which contains the editor view instance.
export const editorViewCtx = createSlice({} as EditorView, 'editorView')

/// A slice which contains the editor state.
export const editorStateCtx = createSlice({} as EditorState, 'editorState')

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
export const remarkStringifyOptionsCtx = createSlice(
  {
    handlers: remarkHandlers,
  } as Options,
  'remarkStringifyOptions'
)
