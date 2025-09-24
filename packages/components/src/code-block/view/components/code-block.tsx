import type { EditorView as CodeMirror } from '@codemirror/view'

import clsx from 'clsx'
import {
  defineComponent,
  ref,
  type Ref,
  h,
  Fragment,
  onMounted,
  watch,
} from 'vue'

import type { CodeBlockConfig } from '../../config'
import type { LanguageInfo } from '../loader'

import { Icon } from '../../../__internal__/components/icon'
import { CopyButton } from './copy-button'
import { LanguagePicker } from './language-picker'
import { PreviewPanel } from './preview-panel'

h
Fragment

export type CodeBlockProps = {
  text: Ref<string>
  selected: Ref<boolean>
  getReadOnly: () => boolean
  codemirror: CodeMirror
  language: Ref<string>
  getAllLanguages: () => Array<LanguageInfo>
  setLanguage: (language: string) => void
  config: Omit<CodeBlockConfig, 'languages' | 'extensions'>
}

export const CodeBlock = defineComponent<CodeBlockProps>({
  props: {
    text: {
      type: Object,
      required: true,
    },
    selected: {
      type: Object,
      required: true,
    },
    getReadOnly: {
      type: Function,
      required: true,
    },
    codemirror: {
      type: Object,
      required: true,
    },
    language: {
      type: Object,
      required: true,
    },
    getAllLanguages: {
      type: Function,
      required: true,
    },
    setLanguage: {
      type: Function,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const previewOnlyByDefault =
      props.config.previewOnlyByDefault ?? props.getReadOnly()
    const previewOnlyMode = ref(previewOnlyByDefault)
    const codemirrorHostRef = ref<HTMLDivElement>()
    const preview = ref<null | string | HTMLElement>(null)

    onMounted(() => {
      while (codemirrorHostRef.value?.firstChild) {
        codemirrorHostRef.value.removeChild(codemirrorHostRef.value.firstChild)
      }

      if (codemirrorHostRef.value) {
        codemirrorHostRef.value.appendChild(props.codemirror.dom)
      }
    })

    watch(
      () => [props.text.value, props.language.value],
      () => {
        const result = props.config.renderPreview(
          props.language.value,
          props.text.value,
          (value) => (preview.value = value)
        )
        if (result) {
          preview.value = result
        }

        // set default value for async renderPreview
        const isAsyncPreview = result === undefined
        if (isAsyncPreview && !preview.value) {
          preview.value = props.config.previewLoading
        }

        if (result === null) {
          preview.value = null
        }
      },
      { immediate: true }
    )

    const empty = () => {}

    return () => {
      return (
        <>
          <div class="tools">
            <LanguagePicker
              language={props.language}
              config={props.config}
              setLanguage={props.setLanguage}
              getAllLanguages={props.getAllLanguages}
              getReadOnly={props.getReadOnly}
            />

            <div class="tools-button-group">
              <CopyButton
                copyIcon={props.config.copyIcon}
                copyText={props.config.copyText}
                onCopy={props.config.onCopy ?? empty}
                text={props.text.value}
              />

              {preview.value ? (
                <button
                  class="preview-toggle-button"
                  onClick={() =>
                    (previewOnlyMode.value = !previewOnlyMode.value)
                  }
                >
                  <Icon
                    icon={props.config.previewToggleButton(
                      previewOnlyMode.value
                    )}
                  />
                </button>
              ) : null}
            </div>
          </div>
          <div
            ref={codemirrorHostRef}
            class={clsx(
              'codemirror-host',
              preview.value && previewOnlyMode.value && 'hidden'
            )}
          />
          <PreviewPanel
            text={props.text}
            language={props.language}
            config={props.config}
            previewOnlyMode={previewOnlyMode}
            preview={preview}
          />
        </>
      )
    }
  },
})
