import { computePosition } from '@floating-ui/dom'
import clsx from 'clsx'
import {
  computed,
  defineComponent,
  ref,
  h,
  Fragment,
  onMounted,
  onUnmounted,
  watch,
} from 'vue'

import type { CodeBlockProps } from './code-block'

import { Icon } from '../../../__internal__/components/icon'

type LanguagePickerProps = Pick<
  CodeBlockProps,
  'language' | 'config' | 'setLanguage' | 'getAllLanguages' | 'getReadOnly'
>

h
Fragment
export const LanguagePicker = defineComponent<LanguagePickerProps>({
  props: {
    language: {
      type: Object,
      required: true,
    },
    getReadOnly: {
      type: Function,
      required: true,
    },
    config: {
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
  },
  setup({ language, config, setLanguage, getAllLanguages, getReadOnly }) {
    const triggerRef = ref<HTMLButtonElement>()
    const showPicker = ref(false)
    const searchRef = ref<HTMLInputElement>()
    const pickerRef = ref<HTMLDivElement>()
    const filter = ref('')

    watch([showPicker, triggerRef, pickerRef], () => {
      filter.value = ''
      const picker = triggerRef.value
      const languageList = pickerRef.value
      if (!picker || !languageList) return

      computePosition(picker, languageList, {
        placement: 'bottom-start',
      })
        .then(({ x, y }) => {
          Object.assign(languageList.style, {
            left: `${x}px`,
            top: `${y}px`,
          })
        })
        .catch(console.error)
    })

    const onTogglePicker = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      if (getReadOnly()) return

      const next = !showPicker.value
      showPicker.value = next
      if (next) {
        setTimeout(() => searchRef.value?.focus(), 0)
      }
    }

    const changeFilter = (e: Event) => {
      const target = e.target as HTMLInputElement
      filter.value = target.value
    }

    const onSearchKeydown = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape') filter.value = ''
    }

    const languages = computed(() => {
      if (!showPicker.value) return []

      const all = getAllLanguages() ?? []

      const selected = all.find(
        (languageInfo) =>
          languageInfo.name.toLowerCase() === language.value.toLowerCase()
      )

      const filtered = all.filter((languageInfo) => {
        const currentValue = filter.value.toLowerCase()

        return (
          (languageInfo.name.toLowerCase().includes(currentValue) ||
            languageInfo.alias.some((alias) =>
              alias.toLowerCase().includes(currentValue)
            )) &&
          languageInfo !== selected
        )
      })

      if (filtered.length === 0) return []

      if (!selected) return filtered

      return [selected, ...filtered]
    })

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (triggerRef.value && triggerRef.value.contains(target)) return

      const picker = pickerRef.value
      const trigger = triggerRef.value
      if (!trigger || !picker) return

      if (trigger.dataset.expanded !== 'true') return

      if (!picker.contains(target)) showPicker.value = false
    }

    onMounted(() => {
      window.addEventListener('click', clickHandler)
    })

    onUnmounted(() => {
      window.removeEventListener('click', clickHandler)
    })

    return () => {
      return (
        <>
          <button
            type="button"
            ref={triggerRef}
            class="language-button"
            onClick={onTogglePicker}
            data-expanded={String(showPicker.value)}
          >
            {language.value || 'Text'}
            <div class="expand-icon">
              <Icon icon={config.expandIcon()} />
            </div>
          </button>
          <div ref={pickerRef} class="language-picker">
            {showPicker.value ? (
              <div class="list-wrapper">
                <div class="search-box">
                  <div class="search-icon">
                    <Icon icon={config.searchIcon()} />
                  </div>
                  <input
                    ref={searchRef}
                    class="search-input"
                    placeholder={config.searchPlaceholder}
                    value={filter.value}
                    onInput={changeFilter}
                    onKeydown={onSearchKeydown}
                  />
                  <div
                    class={clsx(
                      'clear-icon',
                      filter.value.length === 0 && 'hidden'
                    )}
                    onMousedown={(e) => {
                      e.preventDefault()
                      filter.value = ''
                    }}
                  >
                    <Icon icon={config.clearSearchIcon()} />
                  </div>
                </div>
                <ul
                  class="language-list"
                  role="listbox"
                  onKeydown={(e) => {
                    if (e.key === 'Enter') {
                      const active = document.activeElement
                      if (
                        active instanceof HTMLElement &&
                        active.dataset.language
                      )
                        setLanguage(active.dataset.language)
                    }
                  }}
                >
                  {!languages.value.length ? (
                    <li class="language-list-item no-result">
                      {config.noResultText}
                    </li>
                  ) : (
                    languages.value.map((languageInfo) => (
                      <li
                        role="listitem"
                        tabindex="0"
                        class="language-list-item"
                        aria-selected={
                          languageInfo.name.toLowerCase() ===
                          language.value.toLowerCase()
                        }
                        data-language={languageInfo.name}
                        onClick={() => {
                          setLanguage(languageInfo.name)
                          showPicker.value = false
                        }}
                      >
                        {config.renderLanguage(
                          languageInfo.name,
                          languageInfo.name.toLowerCase() ===
                            language.value.toLowerCase()
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : null}
          </div>
        </>
      )
    }
  },
})
