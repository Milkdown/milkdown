import { schemaCtx } from '@milkdown/core'
import type { Fragment, Node, Schema } from '@milkdown/prose/model'
import type { EditorState } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { Decoration, DecorationSet } from '@milkdown/prose/view'
import { $ctx, $prose } from '@milkdown/utils'

import { defaultUploader } from './default-uploader'

/// @internal
export type Uploader = UploadOptions['uploader']
interface Spec { id: symbol, pos: number }

/// The configuration for upload.
export interface UploadOptions {
  /// The uploader for upload plugin.
  /// It takes the files and schema as parameters.
  /// It should return a `Promise` of Prosemirror `Fragment` or `Node` or `Node[]`.
  uploader: (files: FileList, schema: Schema) => Promise<Fragment | Node | Node[]>
  /// Whether to enable the html file uploader.
  /// When paste files from html (for example copy images by right click context menu),
  /// this option will make the plugin to upload the image copied instead of using the original link.
  enableHtmlFileUploader: boolean
  /// The factory for upload widget.
  /// The widget will be displayed when the file is uploading.
  /// It takes the position and spec as parameters.
  /// It should return a `Decoration` of Prosemirror.
  /// By default, it will return `<span>Upload in progress...</span>`.
  uploadWidgetFactory: (pos: number, spec: Parameters<typeof Decoration.widget>[2]) => Decoration
}

/// A slice that contains the configuration for upload.
/// It should be typed of `UploadConfig`.
export const uploadConfig = $ctx<UploadOptions, 'uploadConfig'>({
  uploader: defaultUploader,
  enableHtmlFileUploader: false,
  uploadWidgetFactory: (pos, spec) => {
    const widgetDOM = document.createElement('span')
    widgetDOM.textContent = 'Upload in progress...'
    return Decoration.widget(pos, widgetDOM, spec)
  },
}, 'uploadConfig')

uploadConfig.meta = {
  package: '@milkdown/plugin-upload',
  displayName: 'Ctx<uploadConfig>',
}

/// The prosemirror plugin for upload.
export const uploadPlugin = $prose((ctx) => {
  const pluginKey = new PluginKey('MILKDOWN_UPLOAD')

  const findPlaceholder = (state: EditorState, id: symbol): number => {
    const decorations = pluginKey.getState(state)
    if (!decorations)
      return -1
    const found = decorations.find(undefined, undefined, (spec: Spec) => spec.id === id)
    if (!found.length)
      return -1
    return found[0]?.from ?? -1
  }

  const handleUpload = (view: EditorView, event: DragEvent | ClipboardEvent, files: FileList | undefined) => {
    if (!files || files.length <= 0)
      return false

    const id = Symbol('upload symbol')
    const schema = ctx.get(schemaCtx)
    const { tr } = view.state
    const insertPos = event instanceof DragEvent
      ? view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? tr.selection.from
      : tr.selection.from
    view.dispatch(tr.setMeta(pluginKey, { add: { id, pos: insertPos } }))

    const { uploader } = ctx.get(uploadConfig.key)
    uploader(files, schema)
      .then((fragment) => {
        const pos = findPlaceholder(view.state, id)
        if (pos < 0)
          return

        view.dispatch(
          view.state.tr
            .replaceWith(pos, pos, fragment)
            .setMeta(pluginKey, { remove: { id } }),
        )
      })
      .catch((e) => {
        console.error(e)
      })
    return true
  }

  return new Plugin({
    key: pluginKey,
    state: {
      init() {
        return DecorationSet.empty
      },
      apply(this: Plugin, tr, set) {
        const _set = set.map(tr.mapping, tr.doc)
        const action = tr.getMeta(this)
        if (!action)
          return _set

        if (action.add) {
          const { uploadWidgetFactory } = ctx.get(uploadConfig.key)

          const decoration = uploadWidgetFactory(action.add.pos, { id: action.add.id })
          return _set.add(tr.doc, [decoration])
        }
        if (action.remove) {
          const target = _set.find(undefined, undefined, (spec: Spec) => spec.id === action.remove.id)
          return _set.remove(target)
        }

        return _set
      },
    },
    props: {
      decorations(this: Plugin, state) {
        return this.getState(state)
      },
      handlePaste: (view, event) => {
        const { enableHtmlFileUploader } = ctx.get(uploadConfig.key)
        if (!(event instanceof ClipboardEvent))
          return false

        if (!enableHtmlFileUploader && event.clipboardData?.getData('text/html'))
          return false

        return handleUpload(view, event, event.clipboardData?.files)
      },
      handleDrop: (view, event) => {
        if (!(event instanceof DragEvent))
          return false

        return handleUpload(view, event, event.dataTransfer?.files)
      },
    },
  })
})

uploadPlugin.meta = {
  package: '@milkdown/plugin-upload',
  displayName: 'Prose<upload>',
}
