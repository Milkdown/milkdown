import type { Ctx } from '@milkdown/ctx'
import type { DefaultValue } from '@milkdown/core'
import {
  editorViewCtx,
  getDoc,
  parserCtx,
  prosePluginsCtx,
  schemaCtx,
} from '@milkdown/core'
import { ctxNotBind, missingYjsDoc } from '@milkdown/exception'
import { keydownHandler } from '@milkdown/prose/keymap'
import type { Node } from '@milkdown/prose/model'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { DecorationAttrs } from '@milkdown/prose/view'
import {
  prosemirrorToYDoc,
  redo,
  undo,
  yCursorPlugin,
  yCursorPluginKey,
  yXmlFragmentToProseMirrorRootNode,
  ySyncPlugin,
  ySyncPluginKey,
  yUndoPlugin,
  yUndoPluginKey,
} from 'y-prosemirror'
import type { Awareness } from 'y-protocols/awareness'
import type { Doc, PermanentUserData, XmlFragment } from 'yjs'
import { applyUpdate, encodeStateAsUpdate } from 'yjs'

/// @internal
export interface ColorDef {
  light: string
  dark: string
}

/// @internal
export interface YSyncOpts {
  colors?: Array<ColorDef>
  colorMapping?: Map<string, ColorDef>
  permanentUserData?: PermanentUserData | null
}

/// @internal
export interface yCursorOpts {
  cursorBuilder?: (arg: any) => HTMLElement
  selectionBuilder?: (arg: any) => DecorationAttrs
  getSelection?: (arg: any) => any
}

/// @internal
export interface yUndoOpts {
  protectedNodes?: Set<string>
  trackedOrigins?: any[]
  undoManager?: any
}

/// Options for the collab service.
export interface CollabServiceOptions {
  /// The field name of the yCursor plugin.
  yCursorStateField?: string

  /// Options for the ySync plugin.
  ySyncOpts?: YSyncOpts

  /// Options for the yCursor plugin.
  yCursorOpts?: yCursorOpts

  /// Options for the yUndo plugin.
  yUndoOpts?: yUndoOpts
}

/// @internal
export const CollabKeymapPluginKey = new PluginKey('MILKDOWN_COLLAB_KEYMAP')

const collabPluginKeys = [
  CollabKeymapPluginKey,
  ySyncPluginKey,
  yCursorPluginKey,
  yUndoPluginKey,
]

/// The collab service is used to manage the collaboration plugins.
/// It is used to provide the collaboration plugins to the editor.
export class CollabService {
  /// @internal
  #options: CollabServiceOptions = {}
  /// @internal
  #xmlFragment: XmlFragment | null = null
  /// @internal
  #awareness: Awareness | null = null
  /// @internal
  #ctx: Ctx | null = null
  /// @internal
  #connected = false

  /// @internal
  #valueToNode(value: DefaultValue): Node | undefined {
    if (!this.#ctx) throw ctxNotBind()

    const schema = this.#ctx.get(schemaCtx)
    const parser = this.#ctx.get(parserCtx)

    const doc = getDoc(value, parser, schema)
    return doc
  }

  /// @internal
  #createPlugins(): Plugin[] {
    if (!this.#xmlFragment) throw missingYjsDoc()
    const { ySyncOpts, yUndoOpts } = this.#options
    const plugins = [
      ySyncPlugin(this.#xmlFragment, ySyncOpts),
      yUndoPlugin(yUndoOpts),
      new Plugin({
        key: CollabKeymapPluginKey,
        props: {
          handleKeyDown: keydownHandler({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo,
          }),
        },
      }),
    ]
    if (this.#awareness) {
      const { yCursorOpts, yCursorStateField } = this.#options
      plugins.push(
        yCursorPlugin(
          this.#awareness,
          yCursorOpts as Required<yCursorOpts>,
          yCursorStateField
        )
      )
    }

    return plugins
  }

  /// @internal
  #flushEditor(plugins: Plugin[]) {
    if (!this.#ctx) throw ctxNotBind()
    this.#ctx.set(prosePluginsCtx, plugins)

    const view = this.#ctx.get(editorViewCtx)
    const newState = view.state.reconfigure({ plugins })
    view.updateState(newState)
  }

  /// Bind the context to the service.
  bindCtx(ctx: Ctx) {
    this.#ctx = ctx
    return this
  }

  /// Bind the document to the service.
  bindDoc(doc: Doc) {
    this.#xmlFragment = doc.getXmlFragment('prosemirror')
    return this
  }

  /// Bind the Yjs XmlFragment to the service.
  bindXmlFragment(xmlFragment: XmlFragment) {
    this.#xmlFragment = xmlFragment
    return this
  }

  /// Set the options of the service.
  setOptions(options: CollabServiceOptions) {
    this.#options = options
    return this
  }

  /// Merge some options to the service.
  /// The options will be merged to the existing options.
  /// THe options should be partial of the `CollabServiceOptions`.
  mergeOptions(options: Partial<CollabServiceOptions>) {
    Object.assign(this.#options, options)
    return this
  }

  /// Set the awareness of the service.
  setAwareness(awareness: Awareness) {
    this.#awareness = awareness
    return this
  }

  /// Apply the template to the document.
  applyTemplate(
    template: DefaultValue,
    condition?: (yDocNode: Node, templateNode: Node) => boolean
  ) {
    if (!this.#ctx) throw ctxNotBind()
    if (!this.#xmlFragment) throw missingYjsDoc()
    const conditionFn =
      condition || ((yDocNode) => yDocNode.textContent.length === 0)

    const node = this.#valueToNode(template)
    const schema = this.#ctx.get(schemaCtx)
    const yDocNode = yXmlFragmentToProseMirrorRootNode(
      this.#xmlFragment,
      schema
    )

    if (node && conditionFn(yDocNode, node)) {
      const fragment = this.#xmlFragment
      fragment.delete(0, fragment.length)
      const templateDoc = prosemirrorToYDoc(node)
      const template = encodeStateAsUpdate(templateDoc)
      if (fragment.doc) applyUpdate(fragment.doc, template)
      templateDoc.destroy()
    }

    return this
  }

  /// Connect the service.
  connect() {
    if (!this.#ctx) throw ctxNotBind()
    if (this.#connected) return

    const prosePlugins = this.#ctx.get(prosePluginsCtx)
    const collabPlugins = this.#createPlugins()
    const plugins = prosePlugins.concat(collabPlugins)

    this.#flushEditor(plugins)
    this.#connected = true

    return this
  }

  /// Disconnect the service.
  disconnect() {
    if (!this.#ctx) throw ctxNotBind()
    if (!this.#connected) return this

    const prosePlugins = this.#ctx.get(prosePluginsCtx)
    const plugins = prosePlugins.filter(
      (plugin) =>
        !plugin.spec.key || !collabPluginKeys.includes(plugin.spec.key)
    )

    this.#flushEditor(plugins)
    this.#connected = false

    return this
  }
}
