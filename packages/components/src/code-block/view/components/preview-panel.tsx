import DOMPurify from 'dompurify'
import { defineComponent, ref, watchEffect, type Ref, h, Fragment } from 'vue'

import type { CodeBlockProps } from './code-block'

import { keepAlive } from '../../../__internal__/keep-alive'

keepAlive(h, Fragment)

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/**
 * Creates a DOMPurify instance that allows foreignObject only inside SVG.
 * foreignObject is needed for Mermaid v11+ flowchart labels, but is a known
 * mXSS vector (CVE-2020-26870) when allowed outside SVG context.
 */
function createSvgAwareSanitizer() {
  const purify = DOMPurify()

  purify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'foreignobject') {
      const parent = node.parentElement
      if (!parent || parent.namespaceURI !== SVG_NAMESPACE) {
        node.remove()
      }
    }
  })

  return purify
}

const svgPurify = createSvgAwareSanitizer()

type PreviewPanelProps = Pick<
  CodeBlockProps,
  'text' | 'language' | 'config'
> & {
  previewOnlyMode: Ref<boolean>
  preview: Ref<string | HTMLElement | null>
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
        previewContainer.innerHTML = svgPurify.sanitize(previewContent, {
          ADD_TAGS: ['foreignObject'],
          ADD_ATTR: ['xmlns'],
        })
      }
    })

    return () => {
      if (!preview.value) return null

      return (
        <div class="preview-panel">
          {!previewOnlyMode.value && (
            <>
              <div class="preview-divider" />
              <div class="preview-label">{config.previewLabel}</div>
            </>
          )}
          <div ref={previewRef} class="preview" />
        </div>
      )
    }
  },
})
