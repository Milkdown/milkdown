/* Copyright 2021, Milkdown by Mirone. */
import type {
  Emotion,
  ThemeInputChipType,
  ThemeManager,
} from '@milkdown/core'
import {
  ThemeBorder,
  ThemeShadow,
  ThemeSize,
  getPalette,
} from '@milkdown/core'
import { missingRootElement } from '@milkdown/exception'
import { calculateTextPosition } from '@milkdown/prose'
import type { EditorView } from '@milkdown/prose/view'

const getStyle = (manager: ThemeManager, { css }: Emotion, options: { width: string }) => {
  const palette = getPalette(manager)
  return css`
        ${manager.get(ThemeBorder, undefined)}
        ${manager.get(ThemeShadow, undefined)}

        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        position: absolute;
        background: ${palette('surface')};
        border-radius: ${manager.get(ThemeSize, 'radius')};
        font-size: 16px;

        height: 56px;
        box-sizing: border-box;
        width: ${options.width};
        padding: 0 16px;
        gap: 16px;
        z-index: 2;

        input,
        button {
            all: unset;
        }

        input {
            flex-grow: 1;
            caret-color: ${palette('primary')};
            &::placeholder {
                color: ${palette('neutral', 0.6)};
            }
        }

        button {
            cursor: pointer;
            height: 36px;
            color: ${palette('primary')};
            font-size: 14px;
            padding: 0 8px;
            font-weight: 500;
            letter-spacing: 1.25px;
            &:hover {
                background-color: ${palette('secondary', 0.12)};
            }
            &.disable {
                color: ${palette('neutral', 0.38)};
                cursor: not-allowed;
                &:hover {
                    background: transparent;
                }
            }
            &.hide {
                display: none;
            }
        }

        &.hide {
            display: none;
        }
    `
}

const calcInputPos = (view: EditorView, input: HTMLDivElement) => {
  calculateTextPosition(view, input, (start, end, target, parent) => {
    const $editor = view.dom.parentElement
    if (!$editor)
      throw missingRootElement()

    const selectionWidth = end.left - start.left
    let left = start.left - parent.left - (target.width - selectionWidth) / 2
    const top = start.bottom - parent.top + 14 + $editor.scrollTop

    if (left < 0)
      left = 0

    const maxLeft = $editor.clientWidth - (target.width + 4)
    if (left > maxLeft)
      left = maxLeft

    return [top, left]
  })
}

export const inputChip = (manager: ThemeManager, emotion: Emotion) => {
  manager.set<ThemeInputChipType>(
    'input-chip',
    ({ isBindMode, onUpdate, buttonText, placeholder, width = '400px', calculatePosition = calcInputPos }) => {
      let button: HTMLButtonElement | null = null
      let disabled = false
      let value = ''
      const wrapper = document.createElement('div')

      manager.onFlush(() => {
        const style = getStyle(manager, emotion, { width })

        if (style)
          wrapper.classList.add(style)
      })

      wrapper.classList.add('tooltip-input')

      const input = document.createElement('input')
      if (placeholder)
        input.placeholder = placeholder

      wrapper.appendChild(input)

      if (!isBindMode) {
        button = document.createElement('button')
        button.innerText = buttonText || 'APPLY'
        wrapper.appendChild(button)
      }
      const hide = () => {
        wrapper.classList.add('hide')
      }
      const show = (editorView: EditorView) => {
        wrapper.classList.remove('hide')
        calculatePosition(editorView, wrapper)
      }

      const onInput = (e: Event) => {
        const { target } = e
        if (!(target instanceof HTMLInputElement))
          return

        value = target.value

        if (!button) {
          onUpdate(value)
          return
        }

        if (!value) {
          button.classList.add('disable')
          disabled = true
          return
        }

        button.classList.remove('disable')
        disabled = false
      }

      const onClick = (e: MouseEvent) => {
        if (disabled)
          return
        e.stopPropagation()
        onUpdate(value)
        hide()
      }

      const onKeydown = (e: KeyboardEvent) => {
        if ('key' in e && e.key === 'Enter') {
          onUpdate(value)
          hide()
        }
      }

      const destroy = () => {
        input.removeEventListener('input', onInput)
        input.removeEventListener('keydown', onKeydown)
        button?.removeEventListener('mousedown', onClick)
        wrapper.remove()
      }

      const init = (editorView: EditorView) => {
        const $editor = editorView.dom.parentElement
        if (!$editor)
          throw missingRootElement()

        input.addEventListener('input', onInput)
        input.addEventListener('keydown', onKeydown)
        button?.addEventListener('mousedown', onClick)

        $editor.appendChild(wrapper)
        hide()
      }

      const update = (v: string) => {
        value = v
        input.value = v
      }

      return {
        dom: wrapper,
        init,
        show,
        hide,
        destroy,
        update,
      }
    },
  )
}
