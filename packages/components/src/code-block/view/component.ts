/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView as CodeMirror } from '@codemirror/view'
import type { Component } from 'atomico'
import { html, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'atomico'
import { useCssLightDom } from '@atomico/hooks/use-css-light-dom'
import { computePosition } from '@floating-ui/dom'
import clsx from 'clsx'
import type { CodeBlockConfig } from '../config'
import { style } from './style'
import type { LanguageInfo } from './loader'
import { trapFocus } from './utils'

export type CodeComponentProps = {
  codemirror: CodeMirror
  language: string
  getAllLanguages: () => Array<LanguageInfo>
  setLanguage: (language: string) => void
  config: Omit<CodeBlockConfig, 'languages' | 'extensions'>
}

export const codeComponent: Component<CodeComponentProps> = ({
  codemirror,
  getAllLanguages,
  setLanguage,
  language,
  config,
}) => {
  const pickerRef = useRef<HTMLButtonElement>()
  const languageListRef = useRef<HTMLDivElement>()
  const codemirrorHostRef = useRef<HTMLDivElement>()
  const [filter, setFilter] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  useCssLightDom(style)

  useEffect(() => {
    if (codemirrorHostRef.current && codemirror)
      codemirrorHostRef.current.appendChild(codemirror.dom)
  }, [])

  useEffect(() => {
    setShowPicker(false)
  }, [language])

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      const languageList = languageListRef.current
      if (!languageList)
        return

      if (languageList.dataset.expanded !== 'true')
        return

      const target = e.target as HTMLElement

      if (target.closest('.language-list') !== languageList)
        setShowPicker(false)
    }

    document.addEventListener('click', clickHandler)

    return () => {
      document.removeEventListener('click', clickHandler)
    }
  }, [])

  useLayoutEffect(() => {
    setFilter('')
    const picker = pickerRef.current
    const languageList = languageListRef.current
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
    return getAllLanguages?.().filter((language) => {
      return language.name.toLowerCase().includes(filter.toLowerCase())
        || language.alias.some(alias => alias.toLowerCase().includes(filter.toLowerCase()))
    }) ?? []
  }, [filter, showPicker])

  const changeFilter = (e: InputEvent) => {
    const target = e.target as HTMLInputElement
    setFilter(target.value)
  }

  const onTogglePicker = (e: MouseEvent) => {
    e.stopPropagation()
    const next = !showPicker
    const languageList = languageListRef.current
    if (next && languageList)
      trapFocus(languageList)

    setShowPicker(next)
  }

  return html`<host>
    <div class="tools">
      <button
        ref=${pickerRef}
        class="picker"
        onclick=${onTogglePicker}
        data-expanded=${showPicker}
      >
        ${language}
        <div class="expand-icon">
          ${config?.expandIcon?.()}
        </div>
      </button>
      <div ref=${languageListRef} data-expanded=${showPicker} class=${clsx('language-list', showPicker && 'show')}>
        <div class="search-box">
          <div class="search-icon">
            ${config?.searchIcon?.()}
          </div>
          <input autofocus oninput=${changeFilter} />
          <div class="clear-icon">
            ${config?.clearSearchIcon?.()}
          </div>
        </div>
        <ul role="listbox">
          ${languages.map(languageInfo =>
            html`
              <a
                role="option"
                class="language-list-item"
                aria-selected=${languageInfo.name.toLowerCase() === language?.toLowerCase()}
                data-language=${languageInfo.name}
                onclick=${() => setLanguage?.(languageInfo.name)}
                href="#"
              >
                <li>
                  ${languageInfo.name}
                </li>
              </a>`,
          )}
        </ul>
      </div>
    </div>
    <div ref=${codemirrorHostRef} class="codemirror-host"></div>
  </host>`
}

codeComponent.props = {
  codemirror: Object,
  language: String,
  getAllLanguages: Function,
  setLanguage: Function,
  config: Object,
}
