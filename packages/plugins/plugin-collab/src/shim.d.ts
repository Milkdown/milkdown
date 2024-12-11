declare module 'y-prosemirror' {
  import type { Plugin, PluginKey } from '@milkdown/prose/state'
  import type { Node, Schema } from '@milkdown/prose/model'
  import type { DecorationAttrs } from '@milkdown/prose/view'
  import type * as Y from 'yjs'
  import type { Awareness } from 'y-protocols/awareness'

  interface ColorDef {
    light: string
    dark: string
  }
  interface YSyncOpts {
    colors?: Array<ColorDef>
    colorMapping?: Map<string, ColorDef>
    permanentUserData?: Y.PermanentUserData | null
    /**
     * Fired when the content from Yjs is initially rendered to ProseMirror
     */
    onFirstRender?: Function
  }
  export function prosemirrorToYDoc(doc: Node, xmlFragment?: string): Y.Doc
  export function undo(state: any): boolean
  export function redo(state: any): boolean
  export function yUndoPlugin({
    protectedNodes,
    trackedOrigins,
    undoManager,
  }?: {
    protectedNodes?: Set<string>
    trackedOrigins?: any[]
    undoManager?: any
  }): Plugin<{
    undoManager: any
    prevSel: any
    hasUndoOps: boolean
    hasRedoOps: boolean
  }>
  export function yCursorPlugin(
    awareness: Awareness,
    {
      cursorBuilder,
      selectionBuilder,
      getSelection,
    }?: {
      cursorBuilder?: (arg0: any) => HTMLElement
      selectionBuilder?: (arg0: any) => DecorationAttrs
      getSelection?: (arg0: any) => any
    },
    cursorStateField?: string
  ): any
  export const yCursorPluginKey: PluginKey<any>
  export const ySyncPluginKey: PluginKey<any>
  export const yUndoPluginKey: PluginKey<any>
  export function yXmlFragmentToProseMirrorRootNode(
    yXmlFragment: Y.XmlFragment,
    schema: Schema
  ): Node
  export function ySyncPlugin(
    yXmlFragment: Y.XmlFragment,
    { colors, colorMapping, permanentUserData, onFirstRender }?: YSyncOpts
  ): any
}
