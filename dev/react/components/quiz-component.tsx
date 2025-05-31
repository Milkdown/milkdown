import React from 'react'
import { createRoot } from 'react-dom/client'

import type { QuizOption, QuizAttrs } from '../types/quiz'

import { QuizEditModal } from './quiz-edit-modal'
import { QuizReactView } from './quiz-react-view'

export class QuizComponent {
  dom: HTMLElement
  node: any
  view: any
  getPos: () => number
  ctx: any
  reactRoot: any = null
  modalRoot: HTMLDivElement | null = null
  popupEl: HTMLDivElement | null = null
  selected: boolean = false

  constructor(node: any, view: any, getPos: () => number, ctx: any) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.ctx = ctx
    this.dom = document.createElement('div')
    this.render()
    this.setupSelectionObserver()
  }

  render() {
    if (!this.reactRoot) {
      this.reactRoot = createRoot(this.dom)
    }

    const { question, options, selectedAnswer, showResult } =
      this.node.attrs || {}

    this.reactRoot.render(
      <QuizReactView
        question={question}
        options={options}
        selectedAnswer={selectedAnswer}
        showResult={showResult}
        onSelect={this.selectAnswer}
        onEdit={this.openEditModal}
        isSelected={this.selected}
      />
    )
  }

  selectAnswer = (answerId: string) => {
    const options = Array.isArray(this.node.attrs?.options)
      ? this.node.attrs.options
      : []
    const selected = options.find((o: QuizOption) => o.id === answerId)

    if (selected && selected.isCorrect) {
      this.showPopup('🎉 Correct! Well done!')
    } else {
      this.showPopup('❌ Not quite right, try again!')
    }

    this.updateAttributes({ selectedAnswer: answerId, showResult: true })
  }

  updateAttributes(attrs: Partial<QuizAttrs>) {
    const pos = this.getPos()
    if (typeof pos !== 'number') return

    const baseAttrs =
      typeof this.node.attrs === 'object' && this.node.attrs !== null
        ? this.node.attrs
        : {}
    const patchAttrs = typeof attrs === 'object' && attrs !== null ? attrs : {}

    const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
      ...baseAttrs,
      ...patchAttrs,
    })
    this.view.dispatch(tr)
  }

  setupSelectionObserver() {
    document.addEventListener('selectionchange', this.updateSelection)
    setTimeout(() => this.updateSelection(), 100)
  }

  updateSelection = () => {
    const selection = this.view.state.selection
    const pos = this.getPos()
    this.selected = false

    if (
      selection.from <= pos &&
      selection.to >= pos + (this.node.nodeSize || 1)
    ) {
      this.selected = true
    }

    this.render()
  }

  openEditModal = () => {
    if (this.modalRoot) return

    this.modalRoot = document.createElement('div')
    document.body.appendChild(this.modalRoot)

    const { question, options } = this.node.attrs || {}

    const closeModal = () => {
      if (this.modalRoot) {
        document.body.removeChild(this.modalRoot)
        this.modalRoot = null
      }
    }

    const save = (newQuestion: string, newOptions: QuizOption[]) => {
      this.updateAttributes({ question: newQuestion, options: newOptions })
      closeModal()
    }

    const modalRoot = createRoot(this.modalRoot)
    modalRoot.render(
      <QuizEditModal
        question={question}
        options={options}
        onSave={save}
        onCancel={closeModal}
      />
    )
  }

  showPopup(message: string) {
    if (this.popupEl) {
      this.popupEl.remove()
      this.popupEl = null
    }

    this.popupEl = document.createElement('div')
    this.popupEl.className = 'quiz-popup'
    this.popupEl.textContent = message
    document.body.appendChild(this.popupEl)

    const rect = this.dom.getBoundingClientRect()
    this.popupEl.style.cssText = `
      position: absolute;
      left: ${rect.left + window.scrollX + 20}px;
      top: ${rect.top + window.scrollY - 40}px;
      background: ${message.indexOf('🎉') !== -1 ? '#4caf50' : '#f44336'};
      color: #fff;
      padding: 8px 16px;
      border-radius: 6px;
      z-index: 9999;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      pointer-events: none;
    `

    setTimeout(() => {
      if (this.popupEl) {
        this.popupEl.remove()
        this.popupEl = null
      }
    }, 2000)
  }

  destroy() {
    if (this.reactRoot) {
      this.reactRoot.unmount()
      this.reactRoot = null
    }
    if (this.modalRoot) {
      document.body.removeChild(this.modalRoot)
      this.modalRoot = null
    }
    if (this.popupEl) {
      this.popupEl.remove()
      this.popupEl = null
    }
    document.removeEventListener('selectionchange', this.updateSelection)
  }
}
