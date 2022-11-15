/* Copyright 2021, Milkdown by Mirone. */
import type { Emotion, ThemeInnerEditorType, ThemeManager } from '@milkdown/core'
import { ThemeFont, ThemeSize, getPalette } from '@milkdown/core'
import { baseKeymap, chainCommands, deleteSelection } from '@milkdown/prose/commands'
import { history, redo, undo } from '@milkdown/prose/history'
import { keymap } from '@milkdown/prose/keymap'
import type { Node } from '@milkdown/prose/model'
import { EditorState, TextSelection } from '@milkdown/prose/state'
import { StepMap } from '@milkdown/prose/transform'
import { EditorView } from '@milkdown/prose/view'

const getStyle = (manager: ThemeManager, { css }: Emotion) => {
  const palette = getPalette(manager)
  const radius = manager.get(ThemeSize, 'radius')
  const code = manager.get(ThemeFont, 'code')

  const codeStyle = css`
        color: ${palette('neutral', 0.87)};
        background-color: ${palette('background')};
        border-radius: ${radius};
        padding: 16px 32px;
        font-size: 14px;
        font-family: ${code};
        overflow: hidden;
        line-height: 1.5;
        .ProseMirror {
            outline: none;
        }
    `

  const hideCodeStyle = css`
        display: none;
    `

  const previewPanelStyle = css`
        display: flex;
        justify-content: center;
        padding: 16px 0;
    `

  return {
    codeStyle,
    hideCodeStyle,
    previewPanelStyle,
  }
}

const createInnerEditor = (outerView: EditorView, getPos: () => number) => {
  let isEditing = false
  let innerView: EditorView | undefined

  const openEditor = ($: HTMLElement, doc: Node) => {
    innerView = new EditorView($, {
      state: EditorState.create({
        doc,
        plugins: [
          history(),
          keymap({
            ...baseKeymap,
            'Backspace': chainCommands(deleteSelection, (state) => {
              if (!state.selection.empty)
                return false

              if (innerView && innerView.state.doc.textContent.length > 0)
                return false

              const { dispatch, state: outerState } = outerView
              const p = outerState.schema.nodes.paragraph?.create()
              if (!p)
                return false
              const tr = outerState.tr.replaceSelectionWith(p)
              let start = tr.selection.from - 2
              if (start < 0)
                start = 0

              dispatch(tr.setSelection(TextSelection.create(tr.doc, start)))
              outerView.focus()
              return true
            }),
            'Mod-Enter': (_, dispatch) => {
              if (dispatch) {
                const { state } = outerView
                const { to } = state.selection
                const p = state.schema.nodes.paragraph?.createAndFill()
                if (!p)
                  return false
                const tr = state.tr.replaceWith(to, to, p)
                outerView.dispatch(tr.setSelection(TextSelection.create(tr.doc, to)))
                outerView.focus()
              }

              return true
            },
          }),
          keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Shift-Mod-z': redo,
          }),
        ],
      }),
      plugins: [],
      dispatchTransaction: (tr) => {
        if (!innerView)
          return
        const { state, transactions } = innerView.state.applyTransaction(tr)
        innerView.updateState(state)

        if (!tr.getMeta('fromOutside')) {
          const outerTr = outerView.state.tr
          const offsetMap = StepMap.offset(getPos() + 1)

          transactions.forEach((transaction) => {
            const { steps } = transaction
            steps.forEach((step) => {
              const mapped = step.map(offsetMap)

              if (!mapped)
                throw new Error('step discarded!')

              outerTr.step(mapped)
            })
          })
          if (outerTr.docChanged)
            outerView.dispatch(outerTr)
        }
      },
    })
    innerView.focus()
    const { state } = innerView
    innerView.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 0)))
    isEditing = true
  }

  const closeEditor = () => {
    if (innerView)
      innerView.destroy()

    innerView = undefined
    isEditing = false
  }

  return {
    isEditing: () => isEditing,
    innerView: () => innerView,
    openEditor,
    closeEditor,
  }
}

export const innerEditor = (manager: ThemeManager, emotion: Emotion) => {
  manager.set<ThemeInnerEditorType>('inner-editor', ({ view, getPos, render }) => {
    const inner$ = createInnerEditor(view, getPos)
    const dom = document.createElement('div')
    dom.classList.add('math-block')
    const editor = document.createElement('div')
    const preview = document.createElement('div')

    let codeStyle = ''
    let hideCodeStyle = ''
    let previewPanelStyle = ''

    manager.onFlush(() => {
      ({ codeStyle, hideCodeStyle, previewPanelStyle } = getStyle(manager, emotion))
      if (codeStyle && hideCodeStyle)
        editor.classList.add(codeStyle, hideCodeStyle)

      if (previewPanelStyle)
        preview.classList.add(previewPanelStyle)
    })

    dom.append(editor)

    return {
      dom,
      preview,
      editor,
      onUpdate: (node, isInit) => {
        if (isInit) {
          const value = node.attrs.value || node.textContent || ''
          editor.dataset.value = value
          render(value)
          return
        }

        const innerView = inner$.innerView()
        if (innerView) {
          const state = innerView.state
          const start = node.content.findDiffStart(state.doc.content)
          if (start != null) {
            const diff = node.content.findDiffEnd(state.doc.content)
            if (diff) {
              let { a: endA, b: endB } = diff
              const overlap = start - Math.min(endA, endB)
              if (overlap > 0) {
                endA += overlap
                endB += overlap
              }
              innerView.dispatch(
                state.tr.replace(start, endB, node.slice(start, endA)).setMeta('fromOutside', true),
              )
            }
          }
        }

        const newVal = node.content.firstChild?.text || ''
        editor.dataset.value = newVal

        render(newVal)
      },
      onFocus: (node) => {
        if (!view.editable)
          return
        if (hideCodeStyle)
          editor.classList.remove(hideCodeStyle)

        inner$.openEditor(editor, node)
        dom.classList.add('ProseMirror-selectednode')
      },
      onBlur: () => {
        if (hideCodeStyle)
          editor.classList.add(hideCodeStyle)

        inner$.closeEditor()
        dom.classList.remove('ProseMirror-selectednode')
      },
      onDestroy: () => {
        preview.remove()
        editor.remove()
        dom.remove()
      },
      stopEvent: (event) => {
        const innerView = inner$.innerView()
        const { target } = event
        const isChild = target && innerView?.dom.contains(target as Element)
        return !!(innerView && isChild)
      },
    }
  })
}
