/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView, NodeView } from '@milkdown/prose/view'
import type { KeyBinding, ViewUpdate } from '@codemirror/view'
import { EditorView as CodeMirror, keymap as cmKeymap } from '@codemirror/view'
import type { Node } from '@milkdown/prose/model'
import { defaultKeymap } from '@codemirror/commands'
import { redo, undo } from '@milkdown/prose/history'
import type { Line, SelectionRange } from '@codemirror/state'
import { exitCode } from '@milkdown/prose/commands'
import { TextSelection } from '@milkdown/prose/state'

import type { CodeBlockConfig } from '../config'
import type { CodeComponentProps } from './component'

export class CodeMirrorBlock implements NodeView {
  dom: HTMLElement
  cm: CodeMirror

  updating = false

  constructor(
    public node: Node,
    public view: EditorView,
    public getPos: () => number | undefined,
    public config: CodeBlockConfig,
  ) {
    this.cm = new CodeMirror({
      doc: this.node.textContent,
      extensions: [
        cmKeymap.of([...this.codeMirrorKeymap(), ...defaultKeymap]),
        ...config.extensions,
        CodeMirror.updateListener.of(update => this.forwardUpdate(update)),
      ],
    })
    const dom = document.createElement('milkdown-code-block') as HTMLElement & CodeComponentProps
    dom.codemirror = this.cm
    this.dom = dom
  }

  private codeMirrorKeymap = (): KeyBinding[] => {
    const view = this.view
    return [
      { key: 'ArrowUp', run: () => this.maybeEscape('line', -1) },
      { key: 'ArrowLeft', run: () => this.maybeEscape('char', -1) },
      { key: 'ArrowDown', run: () => this.maybeEscape('line', 1) },
      { key: 'ArrowRight', run: () => this.maybeEscape('char', 1) },
      {
        key: 'Mod-Enter',
        run: () => {
          if (!exitCode(view.state, view.dispatch))
            return false

          view.focus()
          return true
        },
      },
      { key: 'Mod-z', run: () => undo(view.state, view.dispatch) },
      { key: 'Shift-Mod-z', run: () => redo(view.state, view.dispatch) },
      { key: 'Mod-y', run: () => redo(view.state, view.dispatch) },
    ]
  }

  maybeEscape = (unit: 'line' | 'char', dir: -1 | 1): boolean => {
    const { state } = this.cm
    let main: SelectionRange | Line = state.selection.main
    if (!main.empty)
      return false
    if (unit === 'line')
      main = state.doc.lineAt(main.head)
    if (dir < 0 ? main.from > 0 : main.to < state.doc.length)
      return false

    const targetPos = (this.getPos() ?? 0) + (dir < 0 ? 0 : this.node.nodeSize)
    const selection = TextSelection.near(this.view.state.doc.resolve(targetPos), dir)
    const tr = this.view.state.tr.setSelection(selection).scrollIntoView()
    this.view.dispatch(tr)
    this.view.focus()
    return true
  }

  forwardUpdate(update: ViewUpdate) {
    if (this.updating || !this.cm.hasFocus)
      return
    const { main } = update.state.selection
    let offset = (this.getPos() ?? 0) + 1
    const selFrom = offset + main.from
    const selTo = offset + main.to
    const pmSel = this.view.state.selection
    if (update.docChanged || pmSel.from !== selFrom || pmSel.to !== selTo) {
      const tr = this.view.state.tr
      update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
        if (text.length)
          tr.replaceWith(offset + fromA, offset + toA, this.view.state.schema.text(text.toString()))
        else tr.delete(offset + fromA, offset + toA)
        offset += toB - fromB - (toA - fromA)
      })
      tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo))
      this.view.dispatch(tr)
    }
  }

  setSelection(anchor: number, head: number) {
    if (!this.cm.dom.isConnected) {
      requestAnimationFrame(() => this.setSelection(anchor, head))
      return
    }
    this.cm.focus()
    this.updating = true
    this.cm.dispatch({ selection: { anchor, head } })
    this.updating = false
  }

  update(node: Node) {
    if (node.type !== this.node.type)
      return false
    this.node = node
    if (this.updating)
      return true
    const newText = node.textContent
    const curText = this.cm.state.doc.toString()
    if (newText !== curText) {
      let start = 0
      let curEnd = curText.length
      let newEnd = newText.length
      while (start < curEnd && curText.charCodeAt(start) === newText.charCodeAt(start))
        ++start

      while (
        curEnd > start
        && newEnd > start
        && curText.charCodeAt(curEnd - 1) === newText.charCodeAt(newEnd - 1)
      ) {
        curEnd--
        newEnd--
      }
      this.updating = true
      this.cm.dispatch({
        changes: {
          from: start,
          to: curEnd,
          insert: newText.slice(start, newEnd),
        },
      })
      this.updating = false
    }
    return true
  }

  selectNode() {
    this.cm.focus()
  }

  stopEvent() {
    return true
  }

  destroy() {
    this.cm.destroy()
  }
}
