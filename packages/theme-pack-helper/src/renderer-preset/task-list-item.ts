/* Copyright 2021, Milkdown by Mirone. */

import type { Emotion, Icon, ThemeManager, ThemeTaskListItemType } from '@milkdown/core'
import { ThemeIcon, getPalette } from '@milkdown/core'

export const taskListItem = (manager: ThemeManager, { css }: Emotion) => {
  const palette = getPalette(manager)

  manager.set<ThemeTaskListItemType>('task-list-item', ({ onChange, editable }) => {
    const createIcon = (icon: Icon) => manager.get(ThemeIcon, icon)?.dom as HTMLElement

    const listItem = document.createElement('li')
    const checkboxWrapper = document.createElement('label')
    const checkboxStyler = document.createElement('span')
    const checkbox = document.createElement('input')
    const content = document.createElement('div')

    let icon = createIcon('unchecked')
    checkboxWrapper.appendChild(icon)
    const setIcon = (name: Icon) => {
      const nextIcon = createIcon(name)
      checkboxWrapper.replaceChild(nextIcon, icon)
      icon = nextIcon
    }

    checkboxWrapper.append(checkbox, checkboxStyler)
    listItem.append(checkboxWrapper, content)

    checkboxWrapper.contentEditable = 'false'
    checkbox.type = 'checkbox'
    if (!editable()) {
      checkbox.disabled = true
      checkboxWrapper.style.cursor = 'not-allowed'
    }
    checkbox.onchange = (event) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement))
        return

      if (!editable()) {
        checkbox.checked = !checkbox.checked

        return
      }

      event.preventDefault()

      onChange(checkbox.checked)
    }
    listItem.dataset.type = 'task-item'
    listItem.classList.add('task-list-item')

    manager.onFlush(() => {
      const style = css`
                list-style-type: none;
                position: relative;

                & > div {
                    overflow: hidden;
                    padding: 0 2px;
                    width: 100%;
                }

                label {
                    display: inline-block;
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    input {
                        visibility: hidden;
                    }
                }
                &[data-checked='true'] {
                    > label {
                        color: ${palette('primary')};
                    }
                }
                &[data-checked='false'] {
                    > label {
                        color: ${palette('solid', 0.87)};
                    }
                }
                .paragraph {
                    margin: 8px 0;
                }
            `

      if (style)
        listItem.classList.add(style)
    })

    return {
      dom: listItem,
      contentDOM: content,
      onUpdate: (node) => {
        listItem.dataset.checked = node.attrs.checked
        if (node.attrs.checked)
          checkbox.setAttribute('checked', 'checked')
        else
          checkbox.removeAttribute('checked')

        setIcon(node.attrs.checked ? 'checked' : 'unchecked')
      },
    }
  })
}
