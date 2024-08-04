import type { EditorView as CodeMirror } from '@codemirror/view'
import type { Component } from 'atomico'
import { c, h, html, useEffect, useHost, useLayoutEffect, useMemo, useRef, useState } from 'atomico'
import { computePosition } from '@floating-ui/dom'
import clsx from 'clsx'
import type { CodeBlockConfig } from '../config'
import type { LanguageInfo } from './loader'

export interface CodeComponentProps {
  selected: boolean
  codemirror: CodeMirror
  language: string
  getAllLanguages: () => Array<LanguageInfo>
  setLanguage: (language: string) => void
  isEditorReadonly: () => boolean
  config: Omit<CodeBlockConfig, 'languages' | 'extensions'>
}

export const codeComponent: Component<CodeComponentProps> = ({
  selected = false,
  codemirror,
  getAllLanguages,
  setLanguage,
  language,
  config,
  isEditorReadonly,
}) => {
  const host = useHost()
  const triggerRef = useRef<HTMLButtonElement>()
  const pickerRef = useRef<HTMLDivElement>()
  const [filter, setFilter] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  const root = useMemo(() => host.current.getRootNode() as HTMLElement, [host])

  useEffect(() => {
    const lang = getAllLanguages?.()?.find(languageInfo =>
      languageInfo.alias.some(alias =>
        alias.toLowerCase() === language?.toLowerCase()))

    if (lang && lang.name !== language)
      setLanguage?.(lang.name)
  }, [language])

  useEffect(() => {
    setShowPicker(false)
  }, [language])

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (triggerRef.current && triggerRef.current.contains(target))
        return

      const picker = pickerRef.current
      if (!picker)
        return

      if (picker.dataset.expanded !== 'true')
        return

      if (!picker.contains(target))
        setShowPicker(false)
    }

    root.addEventListener('click', clickHandler)

    return () => {
      root.removeEventListener('click', clickHandler)
    }
  }, [])

  useLayoutEffect(() => {
    setFilter('')
    const picker = triggerRef.current
    const languageList = pickerRef.current
    if (!picker || !languageList)
      return

    computePosition(picker, languageList, {
      placement: 'bottom-start',
    }).then(({ x, y }) => {
      Object.assign(languageList.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    })
  }, [showPicker])

  const languages = useMemo(() => {
    if (!showPicker)
      return []

    const all = getAllLanguages?.() ?? []

    const selected = all.find(languageInfo => languageInfo.name.toLowerCase() === language?.toLowerCase())

    const filtered = all.filter((languageInfo) => {
      return (languageInfo.name.toLowerCase().includes(filter.toLowerCase())
        || languageInfo.alias.some(alias => alias.toLowerCase().includes(filter.toLowerCase()))) && languageInfo !== selected
    })

    if (filtered.length === 0)
      return []

    if (!selected)
      return filtered

    return [selected, ...filtered]
  }, [filter, showPicker, language])

  const changeFilter = (e: InputEvent) => {
    const target = e.target as HTMLInputElement
    setFilter(target.value)
  }

  const onTogglePicker = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    if (isEditorReadonly?.())
      return

    setShowPicker((show) => {
      return !show
    })
  }

  const onClear = (e: MouseEvent) => {
    e.preventDefault()
    setFilter('')
  }

  const onSearchKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape')
      setFilter('')
  }

  const onListKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const active = document.activeElement
      if (active instanceof HTMLElement && active.dataset.language)
        setLanguage?.(active.dataset.language)
    }
  }

  const renderedLanguageList = useMemo(() => {
    if (!languages?.length)
      return html`<li class="language-list-item no-result">${config?.noResultText}</li>`

    return languages.map(languageInfo =>
      html`<li
        role="listitem"
        tabindex="0"
        class="language-list-item"
        aria-selected=${languageInfo.name.toLowerCase() === language?.toLowerCase()}
        data-language=${languageInfo.name}
        onclick=${() => setLanguage?.(languageInfo.name)}
      >
        ${config?.renderLanguage?.(languageInfo.name, languageInfo.name.toLowerCase() === language?.toLowerCase())}
      </li>`,
    )
  }, [languages])

  return html`<host class=${clsx(selected && 'selected')}>
    <div class="tools">
      <button
        ref=${triggerRef}
        class="language-button"
        onpointerdown=${onTogglePicker}
        data-expanded=${showPicker}
      >
        ${language || 'Text'}
        <div class="expand-icon">
          ${config?.expandIcon?.()}
        </div>
      </button>
      <div ref=${pickerRef} data-expanded=${showPicker} class=${clsx('language-picker', showPicker && 'show')}>
        <div class="list-wrapper">
          <div class="search-box">
            <div class="search-icon">
              ${config?.searchIcon?.()}
            </div>
            <input
              class="search-input"
              placeholder=${config?.searchPlaceholder}
              value=${filter}
              oninput=${changeFilter}
              onkeydown=${onSearchKeydown}
            />
            <div class=${clsx('clear-icon', filter.length === 0 && 'hidden')} onmousedown=${onClear}>
              ${config?.clearSearchIcon?.()}
            </div>
          </div>
          <ul class="language-list" role="listbox" onkeydown=${onListKeydown}>
            ${renderedLanguageList}
          </ul>
        </div>
      </div>
    </div>
    <div class="codemirror-host">${h(codemirror?.dom, {})}</div>
  </host>`
}

codeComponent.props = {
  selected: Boolean,
  codemirror: Object,
  language: String,
  getAllLanguages: Function,
  setLanguage: Function,
  isEditorReadonly: Function,
  config: Object,
}

export const CodeElement = c(codeComponent)
