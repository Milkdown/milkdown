import clsx from 'clsx'
import { defineComponent, h, Fragment, ref } from 'vue'

import { Icon } from '../../../__internal__/components/icon'

h
Fragment

export type CopyButtonProps = {
  copiedText: string
  copyIcon: string
  text: string
}

async function copyToClipboard(text: string) {
  try {
    return navigator.clipboard.writeText(text)
  } catch {
    const element = document.createElement('textarea')
    const previouslyFocusedElement = document.activeElement

    element.value = text

    // Prevent keyboard from showing on mobile
    element.setAttribute('readonly', '')

    element.style.contain = 'strict'
    element.style.position = 'absolute'
    element.style.left = '-9999px'
    element.style.fontSize = '12pt' // Prevent zooming on iOS

    const selection = document.getSelection()
    const originalRange = selection
      ? selection.rangeCount > 0 && selection.getRangeAt(0)
      : null

    document.body.appendChild(element)
    element.select()

    // Explicit selection workaround for iOS
    element.selectionStart = 0
    element.selectionEnd = text.length

    document.execCommand('copy')
    document.body.removeChild(element)

    if (originalRange) {
      selection!.removeAllRanges() // originalRange can't be truthy when selection is falsy
      selection!.addRange(originalRange)
    }

    // Get the focus back on the previously focused element, if any
    if (previouslyFocusedElement) {
      ;(previouslyFocusedElement as HTMLElement).focus()
    }
  }
}

export const CopyButton = defineComponent<CopyButtonProps>({
  props: {
    copiedText: {
      type: String,
      required: true,
    },
    copyIcon: {
      type: Function,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const isCopied = ref(false)
    let lastTimeout: ReturnType<typeof setTimeout> | null = null

    const onCopyCode = () => {
      copyToClipboard(props.text)
        .then(() => {
          isCopied.value = true
          lastTimeout && clearTimeout(lastTimeout)
          lastTimeout = setTimeout(() => {
            isCopied.value = false
            clearTimeout(lastTimeout!)
          }, 2000)
        })
        .catch(console.error)
    }

    return () => {
      return (
        <>
          <button
            type="button"
            class={clsx('copy-button', isCopied.value && 'copy-button--copied')}
          >
            {isCopied.value && props.copiedText}
            <Icon icon={props.copyIcon} onClick={onCopyCode} />
          </button>
        </>
      )
    }
  },
})
