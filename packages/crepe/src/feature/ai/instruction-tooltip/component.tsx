import { Icon } from '@milkdown/kit/component'
import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  watch,
  type Ref,
} from 'vue'

import type { AISuggestionItem, ResolvedSuggestions } from './suggestions'

import { keepAlive } from '../../../utils/keep-alive'

keepAlive(h)

/// Resolved chrome (icons + labels) for the tooltip. All fields required —
/// the view layer fills in defaults before mounting the component.
export interface AIInstructionTooltipChrome {
  aiIcon: string
  sendIcon: string
  sendPromptIcon: string
  enterKeyIcon: string
  chevronLeftIcon: string
  chevronRightIcon: string
  suggestionsHeaderLabel: string
  sendAsPromptHeaderLabel: string
  sendAsPromptLabel: string
  submitButtonLabel: string
}

type ViewMode = { kind: 'main' } | { kind: 'submenu'; id: string }

interface DisplayItem {
  id: string
  icon: string
  label: string
  hasSubmenu: boolean
  /// undefined when the item opens a submenu; defined when it sends a prompt
  prompt?: { text: string; streamingLabel?: string }
}

function renderHighlighted(label: string, query: string) {
  const q = query.trim()
  if (!q) return [label]
  const lower = label.toLowerCase()
  const lq = q.toLowerCase()
  const idx = lower.indexOf(lq)
  if (idx === -1) return [label]
  return [
    label.slice(0, idx),
    h('mark', null, label.slice(idx, idx + q.length)),
    label.slice(idx + q.length),
  ]
}

type AIInstructionInputProps = {
  placeholder: Ref<string>
  /// Bumped by the view layer every time the tooltip is shown, so the
  /// component can reset transient state (input value, submenu, cursor).
  resetSignal: Ref<number>
  suggestions: ResolvedSuggestions
  chrome: AIInstructionTooltipChrome
  onConfirm: (instruction: string, label?: string) => void
  onCancel: () => void
}

export const AIInstructionInput = defineComponent<AIInstructionInputProps>({
  props: {
    placeholder: { type: Object, required: true },
    resetSignal: { type: Object, required: true },
    suggestions: { type: Object, required: true },
    chrome: { type: Object, required: true },
    onConfirm: { type: Function, required: true },
    onCancel: { type: Function, required: true },
  },
  setup({
    placeholder,
    resetSignal,
    suggestions,
    chrome,
    onConfirm,
    onCancel,
  }) {
    const inputValue = ref('')
    const view = ref<ViewMode>({ kind: 'main' })
    const selectedIndex = ref(0)
    const inputRef = ref<HTMLInputElement | null>(null)
    const listRef = ref<HTMLDivElement | null>(null)

    // Stable id pair used to wire the input ↔ listbox combobox so that
    // screen readers announce the highlighted option as the user moves
    // through the suggestions with the arrow keys.
    const listboxId = `ai-instruction-list-${Math.random().toString(36).slice(2, 9)}`
    const optionId = (idx: number) => `${listboxId}-opt-${idx}`

    watch(resetSignal, () => {
      inputValue.value = ''
      view.value = { kind: 'main' }
      selectedIndex.value = 0
    })

    const allItems = computed<DisplayItem[]>(() => {
      if (view.value.kind === 'submenu') {
        const submenu = suggestions.submenus[view.value.id]
        if (!submenu) return []
        return submenu.items.map(({ id, item }) => ({
          id,
          icon: item.icon,
          label: item.label,
          hasSubmenu: false,
          prompt: { text: item.prompt, streamingLabel: item.streamingLabel },
        }))
      }
      return suggestions.main.map((entry) => {
        if (entry.kind === 'item') {
          return {
            id: entry.id,
            icon: entry.item.icon,
            label: entry.item.label,
            hasSubmenu: false,
            prompt: {
              text: entry.item.prompt,
              streamingLabel: entry.item.streamingLabel,
            },
          }
        }
        return {
          id: entry.id,
          icon: entry.def.icon,
          label: entry.def.label,
          hasSubmenu: true,
        }
      })
    })

    const currentSubmenuDef = computed(() => {
      if (view.value.kind !== 'submenu') return null
      return suggestions.submenus[view.value.id]?.def ?? null
    })

    const filteredItems = computed(() => {
      const q = inputValue.value.trim().toLowerCase()
      if (!q) return allItems.value
      return allItems.value.filter((item) =>
        item.label.toLowerCase().includes(q)
      )
    })

    const showSendAsPrompt = computed(() => inputValue.value.trim().length > 0)

    const totalItems = computed(
      () => filteredItems.value.length + (showSendAsPrompt.value ? 1 : 0)
    )

    watch([filteredItems, view], () => {
      selectedIndex.value = 0
    })

    const focusInput = () => {
      void nextTick(() => inputRef.value?.focus())
    }

    const enterSubmenu = (id: string) => {
      view.value = { kind: 'submenu', id }
      inputValue.value = ''
      selectedIndex.value = 0
      focusInput()
    }

    const exitSubmenu = () => {
      view.value = { kind: 'main' }
      inputValue.value = ''
      selectedIndex.value = 0
      focusInput()
    }

    const runItem = (item: DisplayItem) => {
      if (item.hasSubmenu) {
        enterSubmenu(item.id)
      } else if (item.prompt) {
        onConfirm(item.prompt.text, item.prompt.streamingLabel)
        inputValue.value = ''
      }
    }

    const submitRaw = () => {
      const v = inputValue.value.trim()
      if (!v) return
      onConfirm(v)
      inputValue.value = ''
    }

    const onSelectCurrent = () => {
      const idx = selectedIndex.value
      const items = filteredItems.value
      if (idx < items.length) {
        runItem(items[idx]!)
      } else if (showSendAsPrompt.value) {
        submitRaw()
      }
    }

    const scrollToSelected = () => {
      void nextTick(() => {
        const list = listRef.value
        if (!list) return
        const el = list.querySelector(
          `[data-index="${selectedIndex.value}"]`
        ) as HTMLElement | null
        el?.scrollIntoView({ block: 'nearest' })
      })
    }

    const onKeydown = (e: KeyboardEvent) => {
      e.stopPropagation()

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (totalItems.value === 0) return
        selectedIndex.value = (selectedIndex.value + 1) % totalItems.value
        scrollToSelected()
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (totalItems.value === 0) return
        selectedIndex.value =
          (selectedIndex.value - 1 + totalItems.value) % totalItems.value
        scrollToSelected()
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        onSelectCurrent()
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        if (view.value.kind === 'submenu') exitSubmenu()
        else onCancel()
        return
      }

      if (
        e.key === 'Backspace' &&
        inputValue.value === '' &&
        view.value.kind === 'submenu'
      ) {
        e.preventDefault()
        exitSubmenu()
      }
    }

    const onItemPointerDown = (e: Event) => {
      e.preventDefault()
    }

    return () => {
      const items = filteredItems.value
      const showPrompt = showSendAsPrompt.value
      const submenuDef = currentSubmenuDef.value

      return (
        <div class="ai-instruction">
          <div class="ai-instruction-input">
            <span class="ai-instruction-input-prefix">
              <Icon icon={chrome.aiIcon} />
            </span>
            <input
              ref={inputRef}
              class="ai-instruction-input-field"
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-activedescendant={
                totalItems.value > 0 ? optionId(selectedIndex.value) : undefined
              }
              placeholder={
                submenuDef ? submenuDef.searchPlaceholder : placeholder.value
              }
              value={inputValue.value}
              onInput={(e: Event) => {
                inputValue.value = (e.target as HTMLInputElement).value
              }}
              onKeydown={onKeydown}
            />
            <button
              type="button"
              class="ai-instruction-submit"
              aria-label={chrome.submitButtonLabel}
              disabled={!showPrompt}
              onMousedown={onItemPointerDown}
              onClick={submitRaw}
            >
              <Icon icon={chrome.sendIcon} />
            </button>
          </div>

          <div
            class="ai-instruction-list"
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="AI suggestions"
          >
            {submenuDef && (
              <div
                class="ai-instruction-back"
                onMousedown={onItemPointerDown}
                onClick={exitSubmenu}
              >
                <span class="ai-instruction-back-icon">
                  <Icon icon={chrome.chevronLeftIcon} />
                </span>
                <span>{submenuDef.title}</span>
              </div>
            )}

            {items.length > 0 && (
              <div class="ai-instruction-section">
                <div class="ai-instruction-section-header">
                  {chrome.suggestionsHeaderLabel}
                </div>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    id={optionId(idx)}
                    data-index={idx}
                    role="option"
                    aria-selected={idx === selectedIndex.value}
                    class={[
                      'ai-instruction-item',
                      idx === selectedIndex.value ? 'active' : '',
                    ]}
                    onMousedown={onItemPointerDown}
                    onClick={() => runItem(item)}
                    onPointerenter={() => {
                      selectedIndex.value = idx
                    }}
                  >
                    <span class="ai-instruction-item-icon">
                      <Icon icon={item.icon} />
                    </span>
                    <span class="ai-instruction-item-label">
                      {renderHighlighted(item.label, inputValue.value)}
                    </span>
                    {item.hasSubmenu && (
                      <span class="ai-instruction-item-arrow">
                        <Icon icon={chrome.chevronRightIcon} />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showPrompt && (
              <div class="ai-instruction-section">
                <div class="ai-instruction-section-header">
                  {chrome.sendAsPromptHeaderLabel}
                </div>
                <div
                  id={optionId(items.length)}
                  data-index={items.length}
                  role="option"
                  aria-selected={selectedIndex.value === items.length}
                  class={[
                    'ai-instruction-item',
                    'ai-instruction-item-prompt',
                    selectedIndex.value === items.length ? 'active' : '',
                  ]}
                  onMousedown={onItemPointerDown}
                  onClick={submitRaw}
                  onPointerenter={() => {
                    selectedIndex.value = items.length
                  }}
                >
                  <span class="ai-instruction-item-icon">
                    <Icon icon={chrome.sendPromptIcon} />
                  </span>
                  <span class="ai-instruction-item-label">
                    {chrome.sendAsPromptLabel}{' '}
                    <span class="ai-instruction-item-quote">
                      "{inputValue.value}"
                    </span>
                  </span>
                  <span class="ai-instruction-item-shortcut">
                    <Icon icon={chrome.enterKeyIcon} />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
  },
})

export type { AISuggestionItem }
