/* Copyright 2021, Milkdown by Mirone. */

import { missingRootElement } from '@milkdown/exception'
import { calculateNodePosition } from '@milkdown/prose'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { ThemeUtils } from '@milkdown/utils'
import nodeEmoji from 'node-emoji'

import { checkTrigger, renderDropdownList } from './helper'
import { injectStyle } from './style'

export const key = new PluginKey('MILKDOWN_EMOJI_FILTER')

export const filter = (utils: ThemeUtils, maxListSize: number, twemojiOptions?: TwemojiOptions) => {
  let trigger = false
  let _from = 0
  let _search = ''
  let $active: null | HTMLElement = null

  const off = () => {
    trigger = false
    _from = 0
    _search = ''
    $active = null
  }

  const setActive = (active: HTMLElement | null) => {
    if ($active)
      $active.classList.remove('active')

    if (active)
      active.classList.add('active')

    $active = active
  }

  return new Plugin({
    key,
    props: {
      handleKeyDown(_, event) {
        if (['Delete', 'Backspace'].includes(event.key)) {
          _search = _search.slice(0, -1)
          if (_search.length <= 1)
            off()

          return false
        }
        if (!trigger)
          return false
        if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key))
          return false

        return true
      },
      handleTextInput(view, from, to, text) {
        trigger = checkTrigger(
          view,
          from,
          to,
          text,
          (from) => {
            _from = from
          },
          (search) => {
            _search = search
          },
        )
        if (!trigger)
          off()

        return false
      },
    },
    view: (editorView) => {
      const { parentNode } = editorView.dom
      if (!parentNode)
        throw missingRootElement()

      const dropDown = document.createElement('div')

      dropDown.classList.add('milkdown-emoji-filter', 'hide')

      utils.themeManager.onFlush(() => {
        const className = dropDown.className
          .split(' ')
          .filter(x => ['hide', 'milkdown-emoji-filter'].includes(x))
        dropDown.className = className.join(' ')
        const style = utils.getStyle(emotion => injectStyle(utils.themeManager, emotion))
        if (style)
          style.split(' ').forEach(x => dropDown.classList.add(x))
      })

      const replace = () => {
        if (!$active)
          return

        const { tr } = editorView.state
        const node = editorView.state.schema.node('emoji', { html: $active.firstElementChild?.innerHTML })

        editorView.dispatch(tr.delete(_from, _from + _search.length).insert(_from, node))
        off()
        dropDown.classList.add('hide')
      }

      parentNode.appendChild(dropDown)
      const onKeydown = (e: Event) => {
        if (!trigger || !(e instanceof KeyboardEvent))
          return

        const { key } = e

        if (key === 'Enter') {
          replace()
          return
        }

        if (['ArrowDown', 'ArrowUp'].includes(key)) {
          const next
            = key === 'ArrowDown'
              ? $active?.nextElementSibling || dropDown.firstElementChild
              : $active?.previousElementSibling || dropDown.lastElementChild
          if (!next)
            return
          setActive(next as HTMLElement)
        }
      }
      const onClick = (e: Event) => {
        if (!trigger)
          return

        e.stopPropagation()
        off()
        dropDown.classList.add('hide')
      }
      parentNode.addEventListener('keydown', onKeydown)
      parentNode.addEventListener('mousedown', onClick)

      return {
        update: (view) => {
          const { selection } = view.state

          if (selection.from - selection.to !== 0 || !trigger) {
            off()
            dropDown.classList.add('hide')
            return null
          }
          const result = nodeEmoji.search(_search).slice(0, maxListSize)
          const { node } = view.domAtPos(_from)
          if (result.length === 0 || !node) {
            dropDown.classList.add('hide')
            return null
          }

          dropDown.style.maxHeight = ''
          dropDown.classList.remove('hide')
          renderDropdownList(result, dropDown, replace, setActive, twemojiOptions)
          calculateNodePosition(view, dropDown, (_selected, target, parent) => {
            const $editor = dropDown.parentElement
            if (!$editor)
              throw missingRootElement()

            const start = view.coordsAtPos(_from)
            let left = start.left - parent.left

            if (left < 0)
              left = 0

            let direction: 'top' | 'bottom'
            let maxHeight: number | undefined
            const startToTop = start.top - parent.top
            const startToBottom = parent.height + parent.top - start.bottom
            if (startToBottom >= target.height + 28) {
              direction = 'bottom'
            }
            else if (startToTop >= target.height + 28) {
              direction = 'top'
            }
            else if (startToBottom >= startToTop) {
              direction = 'bottom'
              maxHeight = startToBottom - 28
            }
            else {
              direction = 'top'
              maxHeight = startToTop - 28
            }
            if (startToTop < 0 || startToBottom < 0) {
              maxHeight = parent.height - (start.bottom - start.top) - 28
              if (maxHeight > target.height)
                maxHeight = undefined
            }

            const top
                            = direction === 'top'
                              ? start.top - parent.top - (maxHeight ?? target.height) - 14 + $editor.scrollTop
                              : start.bottom - parent.top + 14 + $editor.scrollTop

            dropDown.style.maxHeight = maxHeight !== undefined && maxHeight > 0 ? `${maxHeight}px` : ''

            const maxLeft = $editor.clientWidth - (dropDown.offsetWidth + 4)
            if (left > maxLeft)
              left = maxLeft

            return [top, left]
          })

          return null
        },

        destroy: () => {
          parentNode.removeEventListener('keydown', onKeydown)
          parentNode.removeEventListener('mousedown', onClick)
          dropDown.remove()
        },
      }
    },
  })
}
