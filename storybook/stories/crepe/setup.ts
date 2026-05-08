import type { Extension } from '@codemirror/state'
import type { AIFeatureConfig, AIProvider } from '@milkdown/crepe/feature/ai'

import { Crepe } from '@milkdown/crepe'
import { createAnthropicProvider } from '@milkdown/crepe/llm-providers/anthropic'
import { createOpenAIProvider } from '@milkdown/crepe/llm-providers/openai'
import all from '@milkdown/crepe/theme/common/style.css?inline'

import { injectMarkdown, wrapInShadow } from '../utils/shadow'
import localStyle from './style.css?inline'

export interface Args {
  readonly: boolean
  defaultValue: string
  enableCodemirror: boolean
  enableTopBar: boolean
  enableAI: boolean
  language: 'EN' | 'JA'
  /// AI demo only — selects which built-in provider to construct when
  /// the user enters a key in the BYOK banner.
  aiProvider: 'openai' | 'anthropic'
  /// AI demo only — model id passed to the chosen provider.
  aiModel: string
}

export const hideAIArgs = {
  enableAI: { table: { disable: true } },
  aiProvider: { table: { disable: true } },
  aiModel: { table: { disable: true } },
}

interface setupConfig {
  args: Args
  style: string
  theme: Extension
  aiConfig?: AIFeatureConfig
}

/// Builds a Crepe instance with the common i18n / feature config used
/// by every story. `aiConfig` overrides the AI feature's config when
/// `args.enableAI` is true; pass `undefined` for non-AI stories.
/// Resolves once `crepe.create()` has finished so callers can show
/// status / surface errors only after the editor is actually ready.
async function createCrepeInstance(
  crepeRoot: HTMLElement,
  args: Args,
  markdownContainer: HTMLElement,
  theme: Extension,
  aiConfig: AIFeatureConfig | undefined
): Promise<Crepe> {
  const { language } = args
  const crepe = new Crepe({
    root: crepeRoot,
    defaultValue: args.defaultValue,
    features: {
      [Crepe.Feature.CodeMirror]: args.enableCodemirror,
      [Crepe.Feature.TopBar]: args.enableTopBar,
      [Crepe.Feature.AI]: args.enableAI,
    },
    featureConfigs: {
      [Crepe.Feature.LinkTooltip]: {
        inputPlaceholder:
          language === 'JA' ? 'リンクを貼り付け...' : 'Paste link...',
      },
      [Crepe.Feature.ImageBlock]: {
        inlineUploadButton: language === 'JA' ? 'アップロード' : 'Upload',
        inlineUploadPlaceholderText:
          language === 'JA' ? 'またはリンクを貼り付ける' : 'or paste link',
        blockUploadButton:
          language === 'JA' ? 'ファイルをアップロード' : 'Upload file',
        blockUploadPlaceholderText:
          language === 'JA' ? 'またはリンクを貼り付ける' : 'or paste link',
        blockCaptionPlaceholderText:
          language === 'JA' ? '画像の説明を書く...' : 'Write Image Caption',
        blockConfirmButton: language === 'JA' ? '確認' : 'Confirm',
      },
      [Crepe.Feature.BlockEdit]: {
        textGroup: {
          label: language === 'JA' ? 'テキスト' : 'Text',
          text: { label: language === 'JA' ? 'テキスト' : 'Text' },
          h1: { label: language === 'JA' ? '見出し1' : 'Heading 1' },
          h2: { label: language === 'JA' ? '見出し2' : 'Heading 2' },
          h3: { label: language === 'JA' ? '見出し3' : 'Heading 3' },
          h4: { label: language === 'JA' ? '見出し4' : 'Heading 4' },
          h5: { label: language === 'JA' ? '見出し5' : 'Heading 5' },
          h6: { label: language === 'JA' ? '見出し6' : 'Heading 6' },
          quote: { label: language === 'JA' ? '引用' : 'Quote' },
          divider: { label: language === 'JA' ? '区切り線' : 'Divider' },
        },
        listGroup: {
          label: language === 'JA' ? 'リスト' : 'List',
          bulletList: {
            label: language === 'JA' ? '箇条書き' : 'Bullet List',
          },
          orderedList: {
            label: language === 'JA' ? '番号付きリスト' : 'Ordered List',
          },
          taskList: {
            label: language === 'JA' ? 'タスクリスト' : 'Task List',
          },
        },
        advancedGroup: {
          label: language === 'JA' ? '高度な機能' : 'Advanced',
          image: { label: language === 'JA' ? '画像' : 'Image' },
          codeBlock: { label: language === 'JA' ? 'コード' : 'Code' },
          table: { label: language === 'JA' ? '表' : 'Table' },
          math: { label: language === 'JA' ? '数式' : 'Math' },
        },
      },
      [Crepe.Feature.Placeholder]: {
        text:
          language === 'JA'
            ? 'スラッシュコマンドを使用するには/と入力します'
            : 'Type / to use slash command',
      },
      [Crepe.Feature.CodeMirror]: {
        theme,
        searchPlaceholder: language === 'JA' ? '言語を検索' : 'Search language',
        noResultText: language === 'JA' ? '見つかりません' : 'No result',
        previewLabel: language === 'JA' ? 'プレビュー' : 'Preview',
        previewToggleText: (previewOnlyMode) =>
          language === 'JA'
            ? previewOnlyMode
              ? '編集'
              : '非表示'
            : previewOnlyMode
              ? 'Edit'
              : 'Hide',
      },
      ...(aiConfig ? { [Crepe.Feature.AI]: aiConfig } : {}),
    },
  })

  if (args.defaultValue) injectMarkdown(args.defaultValue, markdownContainer)

  crepe
    .on((listener) => {
      listener.markdownUpdated((_, markdown) => {
        injectMarkdown(markdown, markdownContainer)
      })
    })
    .setReadonly(args.readonly)

  await crepe.create()
  return crepe
}

export function setup({ args, style, theme, aiConfig }: setupConfig) {
  const {
    wrapper: crepeRoot,
    root,
    shadow,
  } = wrapInShadow([all, style, localStyle])
  const markdownContainer = document.createElement('div')
  markdownContainer.classList.add('markdown-container')
  shadow.appendChild(markdownContainer)
  // Storybook's HTML render() is sync; surface failures via console.
  void createCrepeInstance(
    crepeRoot,
    args,
    markdownContainer,
    theme,
    aiConfig
  ).catch(console.error)
  return root
}

// ---------------------------------------------------------------------------
// AI demo: BYOK banner + real OpenAI/Anthropic providers.
// ---------------------------------------------------------------------------

const STORAGE_KEY_PREFIX = 'crepe-storybook-byok'
const storageKey = (provider: Args['aiProvider']) =>
  `${STORAGE_KEY_PREFIX}-${provider}`

const aiDemoBannerStyle = `
.byok-banner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  font-size: 13px;
  color: #78350f;
}
.byok-banner strong { color: #b45309; }
.byok-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.byok-row label { font-weight: 500; font-size: 13px; color: #1f2937; }
.byok-row input {
  flex: 1;
  min-width: 220px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 12px;
}
.byok-row button {
  padding: 6px 14px;
  background: #2563eb;
  color: white;
  border: 1px solid #1d4ed8;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}
.byok-row button:hover { background: #1d4ed8; }
.byok-row button.byok-clear {
  background: #e5e7eb;
  color: #374151;
  border-color: #d1d5db;
}
.byok-row button.byok-clear:hover { background: #d1d5db; }
.byok-row button.byok-toggle {
  background: transparent;
  color: #4b5563;
  border-color: #d1d5db;
  padding: 6px 10px;
}
.byok-row button.byok-toggle:hover { background: #f3f4f6; }
.byok-status { font-size: 12px; color: #4b5563; }
.byok-hint { font-size: 12px; color: #6b7280; font-style: italic; }
`

function buildProvider(args: Args, apiKey: string): AIProvider {
  // Route through the storybook dev server's vite proxy (configured in
  // storybook/.storybook/main.ts via `viteFinal` — Storybook's vite
  // builder doesn't honor `server.proxy` in the user vite.config.mts)
  // to dodge CORS. The proxy is dev-only — the deployed static
  // storybook build will get 404s here.
  if (args.aiProvider === 'anthropic') {
    return createAnthropicProvider({
      apiKey,
      baseURL: '/api/anthropic',
      model: args.aiModel,
      dangerouslyAllowBrowser: true,
    })
  }
  return createOpenAIProvider({
    apiKey,
    baseURL: '/api/openai',
    model: args.aiModel,
    dangerouslyAllowBrowser: true,
  })
}

export function setupAIDemo({ args, style, theme }: setupConfig) {
  const {
    wrapper: crepeRoot,
    root,
    shadow,
  } = wrapInShadow([all, style, localStyle])

  const styleEl = document.createElement('style')
  styleEl.textContent = aiDemoBannerStyle
  shadow.appendChild(styleEl)

  const providerLabel = args.aiProvider === 'anthropic' ? 'Anthropic' : 'OpenAI'
  const placeholder = args.aiProvider === 'anthropic' ? 'sk-ant-...' : 'sk-...'

  // Build the banner with createElement / textContent rather than
  // `innerHTML` interpolation: even though the dynamic values are
  // currently constrained by the `aiProvider` union, building the DOM
  // explicitly avoids reintroducing an XSS surface if those values
  // ever broaden.
  const banner = document.createElement('div')
  banner.classList.add('byok-banner')

  const intro = document.createElement('div')
  const introStrong = document.createElement('strong')
  introStrong.textContent = 'BYOK demo.'
  const introCodeStorage = document.createElement('code')
  introCodeStorage.textContent = 'sessionStorage'
  const introCodeStart = document.createElement('code')
  introCodeStart.textContent = 'pnpm start'
  intro.append(
    introStrong,
    " Your API key is held in this tab's ",
    introCodeStorage,
    ` (cleared when the tab closes) and sent to ${providerLabel} via the storybook dev proxy (CORS workaround). Only works with `,
    introCodeStart,
    '; the deployed static storybook will 404. Do not use a production key here.'
  )
  banner.appendChild(intro)

  const row = document.createElement('div')
  row.classList.add('byok-row')

  const label = document.createElement('label')
  label.htmlFor = 'byok-key'
  label.textContent = `${providerLabel} API key:`

  const keyInput = document.createElement('input')
  keyInput.id = 'byok-key'
  keyInput.type = 'password'
  keyInput.placeholder = placeholder
  keyInput.autocomplete = 'off'

  const toggleBtn = document.createElement('button')
  toggleBtn.type = 'button'
  toggleBtn.classList.add('byok-toggle')
  toggleBtn.setAttribute('aria-label', 'Toggle key visibility')
  toggleBtn.textContent = 'Show'

  const saveBtn = document.createElement('button')
  saveBtn.classList.add('byok-save')
  saveBtn.textContent = 'Save & load editor'

  const clearBtn = document.createElement('button')
  clearBtn.classList.add('byok-clear')
  clearBtn.textContent = 'Clear'

  row.append(label, keyInput, toggleBtn, saveBtn, clearBtn)
  banner.appendChild(row)

  const status = document.createElement('div')
  status.classList.add('byok-status')
  banner.appendChild(status)

  const hint = document.createElement('div')
  hint.classList.add('byok-hint')
  hint.textContent =
    'Tip: select some text, then click the AI button on the toolbar to open the instruction tooltip.'
  banner.appendChild(hint)

  shadow.appendChild(banner)

  const markdownContainer = document.createElement('div')
  markdownContainer.classList.add('markdown-container')
  shadow.appendChild(markdownContainer)

  toggleBtn.addEventListener('click', () => {
    const showing = keyInput.type === 'text'
    keyInput.type = showing ? 'password' : 'text'
    toggleBtn.textContent = showing ? 'Show' : 'Hide'
  })

  let crepeInstance: Crepe | null = null

  function setBusy(busy: boolean) {
    saveBtn.disabled = busy
    clearBtn.disabled = busy
  }

  async function teardown() {
    if (!crepeInstance) return
    const old = crepeInstance
    crepeInstance = null
    markdownContainer.replaceChildren()
    crepeRoot.replaceChildren()
    try {
      await old.destroy()
    } catch (err) {
      console.error('[byok] destroy failed', err)
    }
  }

  // Awaits both teardown and create() so repeated clicks on Save can't
  // overlap a still-pending destroy with a fresh create, and so the
  // status only flips to "ready" once the editor is actually usable.
  async function mount(apiKey: string) {
    setBusy(true)
    status.textContent = 'Loading editor…'
    try {
      await teardown()
      crepeInstance = await createCrepeInstance(
        crepeRoot,
        args,
        markdownContainer,
        theme,
        { provider: buildProvider(args, apiKey) }
      )
      status.textContent = `Editor ready. Provider: ${args.aiProvider}, model: ${args.aiModel}.`
    } catch (err) {
      crepeInstance = null
      const message = err instanceof Error ? err.message : String(err)
      status.textContent = `Failed to load editor: ${message}`
      console.error('[byok] mount failed', err)
    } finally {
      setBusy(false)
    }
  }

  saveBtn.addEventListener('click', () => {
    const key = keyInput.value.trim()
    if (!key) {
      status.textContent = 'Please enter an API key.'
      return
    }
    sessionStorage.setItem(storageKey(args.aiProvider), key)
    void mount(key)
  })

  clearBtn.addEventListener('click', () => {
    sessionStorage.removeItem(storageKey(args.aiProvider))
    keyInput.value = ''
    setBusy(true)
    void teardown().finally(() => {
      status.textContent =
        'API key cleared. Enter a new key to load the editor.'
      setBusy(false)
    })
  })

  const stored = sessionStorage.getItem(storageKey(args.aiProvider)) ?? ''
  if (stored) {
    keyInput.value = stored
    void mount(stored)
  } else {
    status.textContent = 'Enter your API key to load the editor.'
  }

  return root
}

export const longContent = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

![]()

![0.5](/milkdown-logo.png)

\`\`\`typescript
const crepe = new Crepe({
  root: '#editor'
})
\`\`\`

* List Item 1
* List Item 2
    * List Item 3
    * List Item 4
* List Item 5
* List Item 6

1. List Item 1
2. List Item 2
    1. List Item 1
    2. List Item 2
3. List Item 3

* [ ] List Item 1
* [ ] List Item 2
    * [x] List Item 1
    * [x] List Item 2
* [ ] List Item 3

> Is this the **real life**?
>
> Is this just *fantasy*?
>
> Caught in a \`landslide\`,
>
> No escape from [reality](https://en.wikipedia.org/wiki/Bohemian_Rhapsody).

The equation $E=mc^2$ describes mass-energy equivalence.

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

Open your eyes, look up to the skies and see.

I'm just a poor boy, I need no sympathy, because I'm easy come, easy go, little high, little low.

| Fruit | Animal | Vegetable |
| ----- | :----: | --------: |
|   🍎 | 🐱  | 🥕 |
|   🍌 | 🐶  | 🥦 |
|   🍒 | 🐎  | 🎃 |

`

export const wikiContent = `
# Pink Floyd

![1.0](https://upload.wikimedia.org/wikipedia/en/d/d6/Pink_Floyd_-_all_members.jpg "Pink Floyd in January 1968.")

> Rarely will you find Floyd dishing up catchy hooks, tunes short enough for air-play, or predictable three-chord blues progressions; and never will you find them spending much time on the usual pop album of romance, partying, or self-hype. Their sonic universe is expansive, intense, and challenging ... Where most other bands neatly fit the songs to the music, the two forming a sort of autonomous and seamless whole complete with memorable hooks, Pink Floyd tends to set lyrics within a broader soundscape that often seems to have a life of its own ... Pink Floyd employs extended, stand-alone instrumentals which are never mere vehicles for showing off virtuoso but are planned and integral parts of the performance.

**Pink Floyd** are an English [rock](https://en.wikipedia.org/wiki/Rock_music "Rock music") band formed in London in 1965. Gaining an early following as one of the first British [psychedelic](https://en.wikipedia.org/wiki/Psychedelic_music "Psychedelic music") groups, they were distinguished by their extended compositions, sonic experiments, philosophical lyrics, and elaborate [live shows](https://en.wikipedia.org/wiki/Pink_Floyd_live_performances "Pink Floyd live performances"). They became a leading band of the [progressive rock](https://en.wikipedia.org/wiki/Progressive_rock "Progressive rock") genre, cited by some as the greatest progressive rock band of all time.

Pink Floyd were founded in 1965 by [Syd Barrett](https://en.wikipedia.org/wiki/Syd_Barrett "Syd Barrett") (guitar, lead vocals), [Nick Mason](https://en.wikipedia.org/wiki/Nick_Mason "Nick Mason") (drums), [Roger Waters](https://en.wikipedia.org/wiki/Roger_Waters "Roger Waters") (bass guitar, vocals) and [Richard Wright](https://en.wikipedia.org/wiki/Richard_Wright_(musician) "Richard Wright (musician)") (keyboards, vocals). With Barrett as their main songwriter, they released two hit singles, "[Arnold Layne](https://en.wikipedia.org/wiki/Arnold_Layne "Arnold Layne")" and "[See Emily Play](https://en.wikipedia.org/wiki/See_Emily_Play "See Emily Play")", and the successful debut album *[The Piper at the Gates of Dawn](https://en.wikipedia.org/wiki/The_Piper_at_the_Gates_of_Dawn "The Piper at the Gates of Dawn")* (all 1967). [David Gilmour](https://en.wikipedia.org/wiki/David_Gilmour "David Gilmour") (guitar, vocals) joined in December 1967, while Barrett left in April 1968 due to deteriorating mental health. The four remaining members began contributing to the musical composition, with Waters becoming the primary lyricist and thematic leader, devising the [concepts](https://en.wikipedia.org/wiki/Concept_album "Concept album") behind Pink Floyd's most successful albums, *[The Dark Side of the Moon](https://en.wikipedia.org/wiki/The_Dark_Side_of_the_Moon "The Dark Side of the Moon")* (1973), *[Wish You Were Here](https://en.wikipedia.org/wiki/Wish_You_Were_Here_(Pink_Floyd_album) "Wish You Were Here (Pink Floyd album)")* (1975), *[Animals](https://en.wikipedia.org/wiki/Animals_(Pink_Floyd_album))* (1977) and *[The Wall](https://en.wikipedia.org/wiki/The_Wall "The Wall")* (1979). The [musical film](https://en.wikipedia.org/wiki/Musical_film "Musical film") based on *The Wall*, *[Pink Floyd – The Wall](https://en.wikipedia.org/wiki/Pink_Floyd_%E2%80%93_The_Wall "Pink Floyd – The Wall")* (1982), won two [BAFTA Awards](https://en.wikipedia.org/wiki/BAFTA_Awards "BAFTA Awards"). Pink Floyd also composed several [film scores](https://en.wikipedia.org/wiki/Film_score "Film score").

---

## Discography

*Main articles: [Pink Floyd discography](https://en.wikipedia.org/wiki/Pink_Floyd_discography "Pink Floyd discography") and [List of songs recorded by Pink Floyd](https://en.wikipedia.org/wiki/List_of_songs_recorded_by_Pink_Floyd "List of songs recorded by Pink Floyd")*

**Studio albums**

* *[The Piper at the Gates of Dawn](https://en.wikipedia.org/wiki/The_Piper_at_the_Gates_of_Dawn "The Piper at the Gates of Dawn")* (1967)
* *[A Saucerful of Secrets](https://en.wikipedia.org/wiki/A_Saucerful_of_Secrets "A Saucerful of Secrets")* (1968)
* *[More](https://en.wikipedia.org/wiki/More_(soundtrack) "More (soundtrack)")* (1969)
* *[Ummagumma](https://en.wikipedia.org/wiki/Ummagumma "Ummagumma")* (1969)
* *[Atom Heart Mother](https://en.wikipedia.org/wiki/Atom_Heart_Mother "Atom Heart Mother")* (1970)
* *[Meddle](https://en.wikipedia.org/wiki/Meddle "Meddle")* (1971)
* *[Obscured by Clouds](https://en.wikipedia.org/wiki/Obscured_by_Clouds "Obscured by Clouds")* (1972)
* *[The Dark Side of the Moon](https://en.wikipedia.org/wiki/The_Dark_Side_of_the_Moon "The Dark Side of the Moon")* (1973)
* *[Wish You Were Here](https://en.wikipedia.org/wiki/Wish_You_Were_Here_(Pink_Floyd_album) "Wish You Were Here (Pink Floyd album)")* (1975)
* *[Animals](https://en.wikipedia.org/wiki/Animals_(Pink_Floyd_album) "Animals (Pink Floyd album)")* (1977)
* *[The Wall](https://en.wikipedia.org/wiki/The_Wall "The Wall")* (1979)
* *[The Final Cut](https://en.wikipedia.org/wiki/The_Final_Cut_(album) "The Final Cut (album)")* (1983)
* *[A Momentary Lapse of Reason](https://en.wikipedia.org/wiki/A_Momentary_Lapse_of_Reason "A Momentary Lapse of Reason")* (1987)
* *[The Division Bell](https://en.wikipedia.org/wiki/The_Division_Bell "The Division Bell")* (1994)
* *[The Endless River](https://en.wikipedia.org/wiki/The_Endless_River "The Endless River")* (2014)
`
