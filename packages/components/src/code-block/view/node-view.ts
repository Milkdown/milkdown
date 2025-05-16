import type { Line, SelectionRange } from '@codemirror/state'
import type { Node } from '@milkdown/prose/model'
import type { EditorView, NodeView } from '@milkdown/prose/view'

import { Compartment, EditorState } from '@codemirror/state'
import {
  EditorView as CodeMirror,
  type KeyBinding,
  type ViewUpdate,
  keymap as cmKeymap,
} from '@codemirror/view'
import { exitCode } from '@milkdown/prose/commands'
import { redo, undo } from '@milkdown/prose/history'
import { TextSelection } from '@milkdown/prose/state'
import { createApp, ref, watchEffect, type App, type WatchHandle } from 'vue'

import type { CodeBlockConfig } from '../config'
import type { LanguageLoader } from './loader'

import { CodeBlock } from './components/code-block'

export class CodeMirrorBlock implements NodeView {
  dom: HTMLElement
  cm: CodeMirror
  app: App

  selected = ref(false)
  language = ref('')
  text = ref('')

  private updating = false
  private languageName: string = ''
  private disposeSelectedWatcher: WatchHandle

  private readonly languageConf: Compartment
  private readonly readOnlyConf: Compartment

  constructor(
    public node: Node,
    public view: EditorView,
    public getPos: () => number | undefined,
    public loader: LanguageLoader,
    public config: CodeBlockConfig
  ) {
    this.languageConf = new Compartment()
    this.readOnlyConf = new Compartment()

    this.cm = new CodeMirror({
      doc: this.node.textContent,
      root: this.view.root,
      extensions: [
        this.readOnlyConf.of(EditorState.readOnly.of(!this.view.editable)),
        cmKeymap.of(this.codeMirrorKeymap()),
        this.languageConf.of([]),
        EditorState.changeFilter.of(() => this.view.editable),
        ...config.extensions,
        CodeMirror.updateListener.of(this.forwardUpdate),
      ],
    })

    this.app = this.createApp()

    this.dom = this.createDom(this.app)

    this.disposeSelectedWatcher = watchEffect(() => {
      const isSelected = this.selected.value
      if (isSelected) {
        this.dom.classList.add('selected')
      } else {
        this.dom.classList.remove('selected')
      }
    })

    this.updateLanguage()
  }

  private forwardUpdate = (update: ViewUpdate) => {
    if (this.updating || !this.cm.hasFocus) return
    let offset = (this.getPos() ?? 0) + 1
    const { main } = update.state.selection
    const selFrom = offset + main.from
    const selTo = offset + main.to
    const pmSel = this.view.state.selection
    if (update.docChanged || pmSel.from !== selFrom || pmSel.to !== selTo) {
      const tr = this.view.state.tr
      update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
        if (text.length)
          tr.replaceWith(
            offset + fromA,
            offset + toA,
            this.view.state.schema.text(text.toString())
          )
        else tr.delete(offset + fromA, offset + toA)
        offset += toB - fromB - (toA - fromA)
      })
      tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo))
      this.view.dispatch(tr)
    }
  }

  private createApp = () => {
    return createApp(CodeBlock, {
      text: this.text,
      selected: this.selected,
      codemirror: this.cm,
      language: this.language,
      getAllLanguages: this.getAllLanguages,
      getReadOnly: () => !this.view.editable,
      setLanguage: this.setLanguage,
      config: this.config,
    })
  }

  private createDom(app: App) {
    const dom = document.createElement('div')
    dom.className = 'milkdown-code-block'
    this.text.value = this.node.textContent
    app.mount(dom)
    return dom
  }

  private updateLanguage() {
    const languageName = this.node.attrs.language

    if (languageName === this.languageName) return

    this.language.value = languageName
    const language = this.loader.load(languageName ?? '')

    language
      .then((lang) => {
        if (lang) {
          this.cm.dispatch({
            effects: this.languageConf.reconfigure(lang),
          })
          this.languageName = languageName
        }
      })
      .catch(console.error)
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
          if (!exitCode(view.state, view.dispatch)) return false

          view.focus()
          return true
        },
      },
      { key: 'Mod-z', run: () => undo(view.state, view.dispatch) },
      { key: 'Shift-Mod-z', run: () => redo(view.state, view.dispatch) },
      { key: 'Mod-y', run: () => redo(view.state, view.dispatch) },
      {
        key: 'Backspace',
        run: () => {
          const ranges = this.cm.state.selection.ranges

          if (ranges.length > 1) return false

          const selection = ranges[0]

          if (selection && (!selection.empty || selection.anchor > 0))
            return false

          if (this.cm.state.doc.lines >= 2) return false

          const state = this.view.state
          const pos = this.getPos() ?? 0
          const tr = state.tr.replaceWith(
            pos,
            pos + this.node.nodeSize,
            state.schema.nodes.paragraph!.createChecked({}, this.node.content)
          )

          tr.setSelection(TextSelection.near(tr.doc.resolve(pos)))

          this.view.dispatch(tr)
          this.view.focus()
          return true
        },
      },
    ]
  }

  private maybeEscape = (unit: 'line' | 'char', dir: -1 | 1): boolean => {
    const { state } = this.cm
    let main: SelectionRange | Line = state.selection.main
    if (!main.empty) return false
    if (unit === 'line') main = state.doc.lineAt(main.head)
    if (dir < 0 ? main.from > 0 : main.to < state.doc.length) return false

    const targetPos = (this.getPos() ?? 0) + (dir < 0 ? 0 : this.node.nodeSize)
    const selection = TextSelection.near(
      this.view.state.doc.resolve(targetPos),
      dir
    )
    const tr = this.view.state.tr.setSelection(selection).scrollIntoView()
    this.view.dispatch(tr)
    this.view.focus()
    return true
  }

  setSelection(anchor: number, head: number) {
    if (!this.cm.dom.isConnected) return

    this.cm.focus()
    this.updating = true
    this.cm.dispatch({ selection: { anchor, head } })
    this.updating = false
  }

  update(node: Node) {
    if (node.type !== this.node.type) return false

    if (this.updating) return true

    this.node = node
    this.text.value = node.textContent
    this.updateLanguage()
    if (this.view.editable === this.cm.state.readOnly) {
      this.cm.dispatch({
        effects: this.readOnlyConf.reconfigure(
          EditorState.readOnly.of(!this.view.editable)
        ),
      })
    }

    const change = computeChange(this.cm.state.doc.toString(), node.textContent)
    if (change) {
      this.updating = true
      this.cm.dispatch({
        changes: { from: change.from, to: change.to, insert: change.text },
      })
      this.updating = false
    }
    return true
  }

  selectNode() {
    this.selected.value = true
    this.cm.focus()
  }

  deselectNode() {
    this.selected.value = false
  }

  stopEvent() {
    return true
  }

  destroy() {
    this.app.unmount()
    this.cm.destroy()
    this.disposeSelectedWatcher()
  }

  setLanguage = (language: string) => {
    this.view.dispatch(
      this.view.state.tr.setNodeAttribute(
        this.getPos() ?? 0,
        'language',
        language
      )
    )
  }

  getAllLanguages = () => {
    return this.loader.getAll()
  }
}

function computeChange(
  oldVal: string,
  newVal: string
): { from: number; to: number; text: string } | null {
  if (oldVal === newVal) return null

  let start = 0
  let oldEnd = oldVal.length
  let newEnd = newVal.length

  while (
    start < oldEnd &&
    oldVal.charCodeAt(start) === newVal.charCodeAt(start)
  )
    ++start

  while (
    oldEnd > start &&
    newEnd > start &&
    oldVal.charCodeAt(oldEnd - 1) === newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd--
    newEnd--
  }

  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) }
}
