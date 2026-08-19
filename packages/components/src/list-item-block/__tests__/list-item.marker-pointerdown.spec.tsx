import { render } from '@testing-library/vue'
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { ListItemBlockConfig } from '../config'

import { ListItem } from '../component'

// Only task checkboxes consume pointer events; other markers allow selection.

const config: ListItemBlockConfig = {
  renderLabel: ({ label, listType, checked }) => {
    if (checked == null) return listType === 'bullet' ? '<svg />' : label
    return checked ? '<svg data-checked />' : '<svg data-unchecked />'
  },
}

function renderListItem(attrs: {
  label?: string
  listType?: string
  checked?: boolean | null
}) {
  const setAttr = vi.fn()
  const { container } = render(ListItem, {
    props: {
      label: ref(attrs.label ?? ''),
      checked: ref(attrs.checked ?? null),
      listType: ref(attrs.listType ?? 'bullet'),
      readonly: ref(false),
      selected: ref(false),
      config,
      setAttr,
      onMount: () => {},
    },
  })
  const label = container.querySelector('.label-wrapper .milkdown-icon')
  expect(label).toBeTruthy()
  const onPointerDown = vi.fn()
  container.addEventListener('pointerdown', onPointerDown)
  return { label: label!, setAttr, onPointerDown }
}

function pressAndReportCancellation(target: Element) {
  const event = new Event('pointerdown', { bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event.defaultPrevented
}

test('pressing a bullet marker leaves the event alone', () => {
  const { label, setAttr, onPointerDown } = renderListItem({
    listType: 'bullet',
    checked: null,
  })

  expect(pressAndReportCancellation(label)).toBe(false)
  expect(setAttr).not.toHaveBeenCalled()
  expect(onPointerDown).toHaveBeenCalledOnce()
})

test('pressing an ordered marker leaves the event alone', () => {
  const { label, setAttr, onPointerDown } = renderListItem({
    listType: 'ordered',
    label: '1.',
    checked: null,
  })

  expect(pressAndReportCancellation(label)).toBe(false)
  expect(setAttr).not.toHaveBeenCalled()
  expect(onPointerDown).toHaveBeenCalledOnce()
})

test.each([false, true])(
  'pressing a task checkbox (%s) consumes the event and toggles it',
  (checked) => {
    const { label, setAttr, onPointerDown } = renderListItem({
      listType: 'bullet',
      checked,
    })

    expect(pressAndReportCancellation(label)).toBe(true)
    expect(setAttr).toHaveBeenCalledExactlyOnceWith('checked', !checked)
    expect(onPointerDown).not.toHaveBeenCalled()
  }
)
