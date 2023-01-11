/* Copyright 2021, Milkdown by Mirone. */
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import { lintKeymap } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import type { Extension } from '@codemirror/state'
import { EditorState } from '@codemirror/state'
import {
  EditorView,
  crosshairCursor, drawSelection, dropCursor, highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  rectangularSelection,
} from '@codemirror/view'
import type React from 'react'
import { nord } from './nord'

const basicSetup: Extension = [
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
]

interface StateOptions {
  dark: boolean
  onChange: (getString: () => string) => void
  lock: React.MutableRefObject<boolean>
  content: string
}

export const createCodeMirrorState = ({ onChange, lock, content, dark }: StateOptions) => {
  return EditorState.create({
    doc: content,
    extensions: [
      nord(dark),
      basicSetup,
      markdown(),
      EditorView.updateListener.of((viewUpdate) => {
        if (viewUpdate.focusChanged)
          lock.current = viewUpdate.view.hasFocus

        if (viewUpdate.docChanged) {
          const getString = () => viewUpdate.state.doc.toString()
          onChange(getString)
        }
      }),
    ],
  })
}

interface ViewOptions extends StateOptions {
  root: HTMLElement
}
export const createCodeMirrorView = ({ root, ...options }: ViewOptions) => {
  return new EditorView({
    state: createCodeMirrorState(options),
    parent: root,
  })
}
