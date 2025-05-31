export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuizAttrs {
  question: string
  options: QuizOption[]
  selectedAnswer?: string
  showResult: boolean
}

export class QuizComponent {
  dom: HTMLElement
  node: any
  view: any
  getPos: () => number
  ctx: any
  modalEl: HTMLDivElement | null = null
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
    const { question, options, selectedAnswer, showResult } = this.node.attrs || {}
    
    this.dom.innerHTML = ''
    this.dom.className = 'quiz-component'
    this.dom.style.cssText = `
      border: 2px solid ${this.selected ? '#007bff' : '#e1e5e9'};
      border-radius: 8px;
      padding: 16px;
      margin: 8px 0;
      background-color: ${this.selected ? '#f8f9fa' : '#fff'};
      transition: all 0.2s ease;
    `

    // Question element
    const questionEl = document.createElement('div')
    questionEl.className = 'quiz-question'
    questionEl.style.cssText = `
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 12px;
      color: #333;
    `
    questionEl.textContent = question
    this.dom.appendChild(questionEl)

    // Options container
    const optionsEl = document.createElement('div')
    optionsEl.className = 'quiz-options'
    this.dom.appendChild(optionsEl)

    options.forEach((option: QuizOption) => {
      const optionEl = document.createElement('div')
      optionEl.className = 'quiz-option'
      const isSelected = selectedAnswer === option.id
      optionEl.style.cssText = `
        padding: 10px;
        margin: 4px 0;
        border: 1px solid ${isSelected ? '#2196f3' : '#ddd'};
        border-radius: 4px;
        cursor: pointer;
        background-color: ${isSelected ? '#e3f2fd' : '#fff'};
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
      `

      const radioIcon = document.createElement('span')
      radioIcon.style.cssText = `
        margin-right: 8px;
        color: ${isSelected ? '#2196f3' : '#666'};
      `
      radioIcon.textContent = isSelected ? '●' : '○'
      optionEl.appendChild(radioIcon)

      const textSpan = document.createElement('span')
      textSpan.textContent = option.text
      optionEl.appendChild(textSpan)

      if (showResult && option.isCorrect) {
        const checkIcon = document.createElement('span')
        checkIcon.style.cssText = `
          margin-left: auto;
          color: #4caf50;
          font-weight: bold;
        `
        checkIcon.textContent = '✓'
        optionEl.appendChild(checkIcon)
      }

      optionEl.addEventListener('click', () => this.selectAnswer(option.id))
      optionsEl.appendChild(optionEl)
    })

    // Show result
    if (showResult) {
      const resultEl = document.createElement('div')
      resultEl.className = 'quiz-result'
      resultEl.style.cssText = `
        margin-top: 12px;
        padding: 8px 12px;
        background-color: #e8f5e8;
        border-radius: 4px;
        color: #2e7d32;
        font-weight: bold;
      `
      const correctOptions = options.filter((o: QuizOption) => o.isCorrect)
      resultEl.textContent = `Correct answer: ${correctOptions.map(o => o.text).join(', ')}`
      this.dom.appendChild(resultEl)
    }

    // Edit button (when selected)
    if (this.selected) {
      const editBtn = document.createElement('button')
      editBtn.className = 'quiz-edit-btn'
      editBtn.textContent = 'Edit Quiz'
      editBtn.style.cssText = `
        margin-top: 12px;
        padding: 8px 16px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
      `
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.openEditModal()
      })
      this.dom.appendChild(editBtn)
    }
  }

  selectAnswer = (answerId: string) => {
    const options = Array.isArray(this.node.attrs?.options) ? this.node.attrs.options : []
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
    
    const baseAttrs = typeof this.node.attrs === 'object' && this.node.attrs !== null ? this.node.attrs : {}
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
    
    if (selection.from <= pos && selection.to >= pos + (this.node.nodeSize || 1)) {
      this.selected = true
    }
    
    this.render()
  }

  openEditModal = () => {
    if (this.modalEl) return
    
    this.modalEl = document.createElement('div')
    this.modalEl.className = 'quiz-modal-overlay'
    this.modalEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    const { question, options } = this.node.attrs || {}
    
    const modal = this.createEditModalContent(question, options)
    this.modalEl.appendChild(modal)
    document.body.appendChild(this.modalEl)
  }

  createEditModalContent(question: string, options: QuizOption[]): HTMLElement {
    const modal = document.createElement('div')
    modal.className = 'quiz-modal'
    modal.style.cssText = `
      background: #fff;
      padding: 24px;
      border-radius: 8px;
      min-width: 320px;
      max-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
    `

    const title = document.createElement('h3')
    title.textContent = 'Edit Quiz'
    modal.appendChild(title)

    // Question input
    const questionLabel = document.createElement('label')
    questionLabel.textContent = 'Question:'
    questionLabel.style.marginBottom = '8px'
    modal.appendChild(questionLabel)

    const questionInput = document.createElement('input')
    questionInput.value = question
    questionInput.style.cssText = 'width: 100%; margin-bottom: 12px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;'
    modal.appendChild(questionInput)

    // Options section
    const optionsLabel = document.createElement('label')
    optionsLabel.textContent = 'Options:'
    optionsLabel.style.marginBottom = '8px'
    modal.appendChild(optionsLabel)

    const optionsContainer = document.createElement('div')
    modal.appendChild(optionsContainer)

    let currentOptions = [...options]

    const renderOptions = () => {
      optionsContainer.innerHTML = ''
      currentOptions.forEach((opt, idx) => {
        const optionRow = document.createElement('div')
        optionRow.style.cssText = 'display: flex; align-items: center; margin-bottom: 6px; gap: 8px;'

        const textInput = document.createElement('input')
        textInput.value = opt.text
        textInput.style.cssText = 'flex: 1; padding: 4px; border: 1px solid #ddd; border-radius: 4px;'
        textInput.addEventListener('input', (e) => {
          currentOptions[idx].text = (e.target as HTMLInputElement).value
        })

        const correctCheckbox = document.createElement('input')
        correctCheckbox.type = 'checkbox'
        correctCheckbox.checked = opt.isCorrect
        correctCheckbox.addEventListener('change', (e) => {
          currentOptions[idx].isCorrect = (e.target as HTMLInputElement).checked
        })

        const correctLabel = document.createElement('label')
        correctLabel.textContent = 'Correct'
        correctLabel.style.cssText = 'display: flex; align-items: center; gap: 4px;'
        correctLabel.appendChild(correctCheckbox)

        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = '🗑️'
        deleteBtn.style.cssText = 'padding: 4px 8px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer;'
        deleteBtn.addEventListener('click', () => {
          currentOptions.splice(idx, 1)
          renderOptions()
        })

        optionRow.appendChild(textInput)
        optionRow.appendChild(correctLabel)
        optionRow.appendChild(deleteBtn)
        optionsContainer.appendChild(optionRow)
      })
    }

    renderOptions()

    const addOptionBtn = document.createElement('button')
    addOptionBtn.textContent = 'Add Option'
    addOptionBtn.style.cssText = 'margin-top: 8px; padding: 8px 16px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer;'
    addOptionBtn.addEventListener('click', () => {
      currentOptions.push({
        id: Date.now().toString(),
        text: '',
        isCorrect: false
      })
      renderOptions()
    })
    modal.appendChild(addOptionBtn)

    // Buttons
    const buttonsDiv = document.createElement('div')
    buttonsDiv.style.cssText = 'margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px;'

    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'Cancel'
    cancelBtn.style.cssText = 'padding: 8px 16px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer;'
    cancelBtn.addEventListener('click', () => this.closeModal())

    const saveBtn = document.createElement('button')
    saveBtn.textContent = 'Save'
    saveBtn.style.cssText = 'padding: 8px 16px; background: #222; color: #fff; border: none; border-radius: 4px; cursor: pointer;'
    saveBtn.addEventListener('click', () => {
      this.updateAttributes({
        question: questionInput.value,
        options: currentOptions
      })
      this.closeModal()
    })

    buttonsDiv.appendChild(cancelBtn)
    buttonsDiv.appendChild(saveBtn)
    modal.appendChild(buttonsDiv)

    return modal
  }

  closeModal() {
    if (this.modalEl) {
      document.body.removeChild(this.modalEl)
      this.modalEl = null
    }
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
    if (this.modalEl) {
      document.body.removeChild(this.modalEl)
      this.modalEl = null
    }
    if (this.popupEl) {
      this.popupEl.remove()
      this.popupEl = null
    }
    document.removeEventListener('selectionchange', this.updateSelection)
  }
}