import clsx from 'clsx'
import DOMPurify from 'dompurify'
import {
  defineComponent,
  ref,
  watchEffect,
  type Ref,
  h,
  Fragment,
  type ComputedRef,
} from 'vue'

import type { CodeBlockProps } from './code-block'

h
Fragment

type PreviewPanelProps = Pick<
  CodeBlockProps,
  'text' | 'language' | 'config'
> & {
  previewOnlyMode: Ref<boolean>
  preview: ComputedRef<string | HTMLElement | null>
}

export const PreviewPanel = defineComponent<PreviewPanelProps>({
  props: {
    text: {
      type: Object,
      required: true,
    },
    language: {
      type: Object,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    previewOnlyMode: {
      type: Object,
      required: true,
    },
    preview: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { previewOnlyMode, config, preview } = props
    const previewRef = ref<HTMLDivElement>()

    watchEffect(() => {
      const previewContainer = previewRef.value
      if (!previewContainer) return

      while (previewContainer.firstChild) {
        previewContainer.removeChild(previewContainer.firstChild)
      }

      const previewContent = preview.value

      if (
        typeof previewContent === 'string' ||
        previewContent instanceof Element
      ) {
        previewContainer.innerHTML = DOMPurify.sanitize(previewContent)
      }
    })

    return () => {
      if (!preview.value) return null

      return (
        <div class="preview-panel">
          {!previewOnlyMode.value && (
            <>
              <div class="preview-divider" />
              <div class={clsx('preview-label', previewOnlyMode && 'hidden')}>
                {config.previewLabel()}
              </div>
            </>
          )}
          <div ref={previewRef} class="preview" />
        </div>
      )
    }
  },
})
