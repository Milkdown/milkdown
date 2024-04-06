/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView as CodeMirror } from '@codemirror/view'
import type { Component } from 'atomico'
import { c, h, html, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'atomico'
import { useCssLightDom } from '@atomico/hooks/use-css-light-dom'
import { computePosition } from '@floating-ui/dom'
import clsx from 'clsx'
import type { CodeBlockConfig } from '../config'
import { style } from './style'
import type { LanguageInfo } from './loader'
import { trapFocus } from './utils'

export interface CodeComponentProps {
  selected: boolean
  codemirror: CodeMirror
  language: string
  getAllLanguages: () => Array<LanguageInfo>
  setLanguage: (language: string) => void
  config: Omit<CodeBlockConfig, 'languages' | 'extensions'>
}

export const codeComponent: Component<CodeComponentProps> = ({
  selected = false,
  codemirror,
  getAllLanguages,
  setLanguage,
  language,
  config,
}) => {
  const triggerRef = useRef<HTMLButtonElement>()
  const pickerRef = useRef<HTMLDivElement>()
  const releaseRef = useRef<() => void>()
  const [filter, setFilter] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  useCssLightDom(style)

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

    document.addEventListener('click', clickHandler)

    return () => {
      document.removeEventListener('click', clickHandler)
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

    if (!selected)
      return filtered

    return [selected, ...filtered]
  }, [filter, showPicker, language])

  const changeFilter = (e: InputEvent) => {
    const target = e.target as HTMLInputElement
    setFilter(target.value)
  }

  const onTogglePicker = () => {
    const next = !showPicker
    const languageList = pickerRef.current
    if (next && languageList)
      releaseRef.current = trapFocus(languageList)
    else
      releaseRef.current?.()

    setShowPicker(next)
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

  return html`<host class=${clsx(selected && 'selected')}>
    <div class="tools">
      <button
        ref=${triggerRef}
        class="language-button"
        onclick=${onTogglePicker}
        data-expanded=${showPicker}
      >
        ${language}
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
            ${languages.map(languageInfo =>
              html`
                <li
                  role="listitem"
                  tabindex="0"
                  class="language-list-item"
                  aria-selected=${languageInfo.name.toLowerCase() === language?.toLowerCase()}
                  data-language=${languageInfo.name}
                  onclick=${() => setLanguage?.(languageInfo.name)}
                >
                  ${config?.renderLanguage?.(languageInfo.name, languageInfo.name.toLowerCase() === language?.toLowerCase())}
                </li>`,
            )}
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
  config: Object,
}

export const CodeElement = c(codeComponent)
