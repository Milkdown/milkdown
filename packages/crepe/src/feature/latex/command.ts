import type { Node } from '@milkdown/kit/prose/model'

import { findNodeInSelection } from '@milkdown/kit/prose'
import { NodeSelection, TextSelection } from '@milkdown/kit/prose/state'
import { $command } from '@milkdown/kit/utils'

import { mathInlineSchema } from './inline-latex'

export const toggleLatexCommand = $command('ToggleLatex', (ctx) => {
  return () => (state, dispatch) => {
    const {
      hasNode: hasLatex,
      pos: latexPos,
      target: latexNode,
    } = findNodeInSelection(state, mathInlineSchema.type(ctx))

    const { selection, doc, tr, schema } = state
    if (!hasLatex) {
      const text = doc.textBetween(selection.from, selection.to)
      const trimmed = text.trim()
      if (!selection.empty && !trimmed) return false
      const leading = selection.empty ? '' : (text.match(/^\s+/)?.[0] ?? '')
      const trailing = selection.empty ? '' : (text.match(/\s+$/)?.[0] ?? '')
      const mathNode = mathInlineSchema.type(ctx).create({
        value: trimmed,
      })
      const nodes = [
        ...(leading ? [schema.text(leading)] : []),
        mathNode,
        ...(trailing ? [schema.text(trailing)] : []),
      ]
      let _tr =
        nodes.length > 1
          ? tr.replaceWith(selection.from, selection.to, nodes)
          : tr.replaceSelectionWith(mathNode)
      if (dispatch) {
        dispatch(
          _tr.setSelection(
            NodeSelection.create(_tr.doc, selection.from + leading.length)
          )
        )
      }
      return true
    }

    const { from, to } = selection
    if (!latexNode || latexPos < 0) return false

    let _tr = tr.delete(latexPos, latexPos + 1)
    const content = (latexNode as Node).attrs.value
    _tr = _tr.insertText(content, latexPos)
    if (dispatch) {
      dispatch(
        _tr.setSelection(
          TextSelection.create(_tr.doc, from, to + content.length - 1)
        )
      )
    }
    return true
  }
})
