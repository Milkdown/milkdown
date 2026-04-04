import type { Extension } from '@codemirror/state'

import { Crepe } from '@milkdown/crepe'
import all from '@milkdown/crepe/theme/common/style.css?inline'
import { commandsCtx } from '@milkdown/kit/core'
import {
  acceptAllDiffsCmd,
  clearDiffReviewCmd,
  rejectAllDiffsCmd,
  startDiffReviewCmd,
} from '@milkdown/kit/plugin/diff'
import {
  abortStreamingCmd,
  endStreamingCmd,
  pushChunkCmd,
  startStreamingCmd,
} from '@milkdown/kit/plugin/streaming'
import { callCommand } from '@milkdown/kit/utils'

import { injectMarkdown, wrapInShadow } from '../utils/shadow'
import localStyle from './style.css?inline'

export interface Args {
  instance: Crepe
  readonly: boolean
  defaultValue: string
  modifiedValue: string
  enableCodemirror: boolean
  enableTopBar: boolean
  enableDiff: boolean
  enableStreaming: boolean
  language: 'EN' | 'JA'
}

export const hideDiffArgs = {
  modifiedValue: { table: { disable: true } },
  enableDiff: { table: { disable: true } },
  enableStreaming: { table: { disable: true } },
}

interface setupConfig {
  args: Args
  style: string
  theme: Extension
}

export function setup({ args, style, theme }: setupConfig) {
  const {
    wrapper: crepeRoot,
    root,
    shadow,
  } = wrapInShadow([all, style, localStyle])
  const { language } = args
  const markdownContainer = document.createElement('div')
  markdownContainer.classList.add('markdown-container')
  shadow.appendChild(markdownContainer)

  const crepe = new Crepe({
    root: crepeRoot,
    defaultValue: args.defaultValue,
    features: {
      [Crepe.Feature.CodeMirror]: args.enableCodemirror,
      [Crepe.Feature.TopBar]: args.enableTopBar,
      [Crepe.Feature.Diff]: args.enableDiff,
      [Crepe.Feature.Streaming]: args.enableStreaming,
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
          text: {
            label: language === 'JA' ? 'テキスト' : 'Text',
          },
          h1: {
            label: language === 'JA' ? '見出し1' : 'Heading 1',
          },
          h2: {
            label: language === 'JA' ? '見出し2' : 'Heading 2',
          },
          h3: {
            label: language === 'JA' ? '見出し3' : 'Heading 3',
          },
          h4: {
            label: language === 'JA' ? '見出し4' : 'Heading 4',
          },
          h5: {
            label: language === 'JA' ? '見出し5' : 'Heading 5',
          },
          h6: {
            label: language === 'JA' ? '見出し6' : 'Heading 6',
          },
          quote: {
            label: language === 'JA' ? '引用' : 'Quote',
          },
          divider: {
            label: language === 'JA' ? '区切り線' : 'Divider',
          },
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
          image: {
            label: language === 'JA' ? '画像' : 'Image',
          },
          codeBlock: {
            label: language === 'JA' ? 'コード' : 'Code',
          },
          table: {
            label: language === 'JA' ? '表' : 'Table',
          },
          math: {
            label: language === 'JA' ? '数式' : 'Math',
          },
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
    },
  })

  if (args.defaultValue) {
    injectMarkdown(args.defaultValue, markdownContainer)
  }

  crepe
    .on((listener) => {
      listener.markdownUpdated((_, markdown) => {
        injectMarkdown(markdown, markdownContainer)
      })
    })
    .setReadonly(args.readonly)
    .create()
    .then(() => {
      args.instance = crepe
    })
    .catch(console.error)
  return root
}

const diffToolbarStyle = `
.diff-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.diff-toolbar button {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid;
  font-weight: 500;
}
.diff-toolbar-apply { background: #3b82f6; color: white; border-color: #2563eb; }
.diff-toolbar-apply:hover { background: #2563eb; }
.diff-toolbar-accept-all { background: #22c55e; color: white; border-color: #16a34a; }
.diff-toolbar-accept-all:hover { background: #16a34a; }
.diff-toolbar-reject-all { background: #ef4444; color: white; border-color: #dc2626; }
.diff-toolbar-reject-all:hover { background: #dc2626; }
.diff-toolbar-clear { background: #e5e7eb; color: #374151; border-color: #d1d5db; }
.diff-toolbar-clear:hover { background: #d1d5db; }
`

export function setupDiffReview(config: setupConfig) {
  const root = setup(config)
  const shadow = root.shadowRoot!

  const styleEl = document.createElement('style')
  styleEl.textContent = diffToolbarStyle
  shadow.appendChild(styleEl)

  const toolbar = document.createElement('div')
  toolbar.classList.add('diff-toolbar')

  const buttons = [
    { text: 'Apply Diff', cls: 'diff-toolbar-apply' },
    { text: 'Accept All', cls: 'diff-toolbar-accept-all' },
    { text: 'Reject All', cls: 'diff-toolbar-reject-all' },
    { text: 'Clear', cls: 'diff-toolbar-clear' },
  ]
  const btnElements = buttons.map(({ text, cls }) => {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.classList.add(cls)
    toolbar.appendChild(btn)
    return btn
  })
  const [applyBtn, acceptAllBtn, rejectAllBtn, clearBtn] = btnElements

  waitForInstance(config.args, 5000)
    .then((crepe) => {
      const crepeWrapper = shadow.querySelector('.milkdown') as HTMLElement
      if (crepeWrapper) {
        crepeWrapper.parentElement!.insertBefore(toolbar, crepeWrapper)
      } else {
        shadow.insertBefore(toolbar, shadow.firstChild)
      }

      applyBtn!.addEventListener('click', () => {
        crepe.editor.action((ctx) => {
          ctx
            .get(commandsCtx)
            .call(startDiffReviewCmd.key, config.args.modifiedValue)
        })
      })
      acceptAllBtn!.addEventListener('click', () => {
        crepe.editor.action(callCommand(acceptAllDiffsCmd.key))
      })
      rejectAllBtn!.addEventListener('click', () => {
        crepe.editor.action(callCommand(rejectAllDiffsCmd.key))
      })
      clearBtn!.addEventListener('click', () => {
        crepe.editor.action(callCommand(clearDiffReviewCmd.key))
      })
    })
    .catch(console.error)

  return root
}

const streamingToolbarStyle = `
.streaming-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.streaming-toolbar button {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid;
  font-weight: 500;
}
.streaming-toolbar-start { background: #3b82f6; color: white; border-color: #2563eb; }
.streaming-toolbar-start:hover { background: #2563eb; }
.streaming-toolbar-start:disabled { background: #93c5fd; border-color: #93c5fd; cursor: not-allowed; }
.streaming-toolbar-stop { background: #22c55e; color: white; border-color: #16a34a; }
.streaming-toolbar-stop:hover { background: #16a34a; }
.streaming-toolbar-stop:disabled { background: #86efac; border-color: #86efac; cursor: not-allowed; }
.streaming-toolbar-abort { background: #ef4444; color: white; border-color: #dc2626; }
.streaming-toolbar-abort:hover { background: #dc2626; }
.streaming-toolbar-abort:disabled { background: #fca5a5; border-color: #fca5a5; cursor: not-allowed; }
`

const sampleStreamContent = `# Streaming Demo

This content is being streamed **token by token**, simulating an AI generating markdown in real-time.

## Features

The streaming plugin supports:

- Progressive rendering of headings
- Paragraphs with **bold** and *italic* formatting
- Lists with multiple items
- Code blocks with syntax highlighting

\`\`\`typescript
const editor = new Crepe({
  root: '#app',
  features: {
    [CrepeFeature.Streaming]: true,
  },
})
await editor.create()
\`\`\`

## How It Works

The plugin accumulates tokens in a buffer, periodically parses the full markdown, diffs it against the current document, and applies only the changes. This gives a smooth, progressive rendering experience.

> The quick brown fox jumps over the lazy dog.
> This is a famous pangram used in typography.

| Feature | Status |
| ------- | ------ |
| Headings | Done |
| Lists | Done |
| Code | Done |
| Tables | Done |

That's the end of the streaming demo!
`

export function setupStreamingDemo(config: setupConfig) {
  const root = setup(config)
  const shadow = root.shadowRoot!

  const styleEl = document.createElement('style')
  styleEl.textContent = `${streamingToolbarStyle}
.streaming-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.streaming-controls textarea {
  width: 100%;
  min-height: 80px;
  font-family: monospace;
  font-size: 12px;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  resize: vertical;
}
`
  shadow.appendChild(styleEl)

  const controls = document.createElement('div')
  controls.classList.add('streaming-controls')

  const textarea = document.createElement('textarea')
  textarea.value = sampleStreamContent
  textarea.placeholder = 'Enter markdown to stream...'

  const toolbar = document.createElement('div')
  toolbar.classList.add('streaming-toolbar')

  const startBtn = document.createElement('button')
  startBtn.textContent = 'Start Streaming'
  startBtn.classList.add('streaming-toolbar-start')

  const stopBtn = document.createElement('button')
  stopBtn.textContent = 'End Streaming'
  stopBtn.classList.add('streaming-toolbar-stop')
  stopBtn.disabled = true

  const abortBtn = document.createElement('button')
  abortBtn.textContent = 'Abort'
  abortBtn.classList.add('streaming-toolbar-abort')
  abortBtn.disabled = true

  toolbar.appendChild(startBtn)
  toolbar.appendChild(stopBtn)
  toolbar.appendChild(abortBtn)

  controls.appendChild(textarea)
  controls.appendChild(toolbar)

  waitForInstance(config.args, 5000)
    .then((crepe) => {
      const crepeWrapper = shadow.querySelector('.milkdown') as HTMLElement
      if (crepeWrapper) {
        crepeWrapper.parentElement!.insertBefore(controls, crepeWrapper)
      } else {
        shadow.insertBefore(controls, shadow.firstChild)
      }

      let streamTimer: ReturnType<typeof setInterval> | null = null

      function setStreaming(active: boolean) {
        startBtn.disabled = active
        stopBtn.disabled = !active
        abortBtn.disabled = !active
        textarea.disabled = active
      }

      function stopTimer() {
        if (streamTimer) {
          clearInterval(streamTimer)
          streamTimer = null
        }
      }

      startBtn.addEventListener('click', () => {
        crepe.editor.action(callCommand(startStreamingCmd.key))
        setStreaming(true)

        const chars = Array.from(textarea.value)
        let idx = 0

        streamTimer = setInterval(() => {
          const chunkSize = Math.floor(Math.random() * 3) + 1
          let chunk = ''
          for (let j = 0; j < chunkSize && idx < chars.length; j++, idx++) {
            chunk += chars[idx]
          }

          if (chunk) {
            crepe.editor.action(callCommand(pushChunkCmd.key, chunk))
          }

          if (idx >= chars.length) {
            stopTimer()
            crepe.editor.action(callCommand(endStreamingCmd.key))
            setStreaming(false)
          }
        }, 30)
      })

      stopBtn.addEventListener('click', () => {
        stopTimer()
        crepe.editor.action(callCommand(endStreamingCmd.key))
        setStreaming(false)
      })

      abortBtn.addEventListener('click', () => {
        stopTimer()
        crepe.editor.action(callCommand(abortStreamingCmd.key, { keep: false }))
        setStreaming(false)
      })
    })
    .catch(console.error)

  return root
}

const aiDemoToolbarStyle = `
.ai-demo-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.ai-demo-controls textarea {
  width: 100%;
  min-height: 80px;
  font-family: monospace;
  font-size: 12px;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  resize: vertical;
}
.ai-demo-options {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 13px;
  color: #374151;
}
.ai-demo-options label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.ai-demo-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.ai-demo-toolbar button {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid;
  font-weight: 500;
}
.ai-demo-toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ai-btn-start { background: #3b82f6; color: white; border-color: #2563eb; }
.ai-btn-start:hover:not(:disabled) { background: #2563eb; }
.ai-btn-stop, .ai-btn-accept { background: #22c55e; color: white; border-color: #16a34a; }
.ai-btn-stop:hover:not(:disabled), .ai-btn-accept:hover:not(:disabled) { background: #16a34a; }
.ai-btn-abort, .ai-btn-reject { background: #ef4444; color: white; border-color: #dc2626; }
.ai-btn-abort:hover:not(:disabled), .ai-btn-reject:hover:not(:disabled) { background: #dc2626; }
.ai-btn-clear { background: #e5e7eb; color: #374151; border-color: #d1d5db; }
.ai-btn-clear:hover:not(:disabled) { background: #d1d5db; }
.ai-separator {
  width: 1px;
  height: 24px;
  background: #d1d5db;
  margin: 0 4px;
}
`

const aiSampleContent = `## AI Generated Section

Here is a summary of the key points:

- **First point**: The architecture uses a plugin-based approach
- **Second point**: Streaming content is buffered and flushed periodically
- **Third point**: Diff review allows accepting or rejecting changes

\`\`\`typescript
const editor = new Crepe({
  root: '#app',
  features: {
    [CrepeFeature.Streaming]: true,
    [CrepeFeature.Diff]: true,
  },
})
\`\`\`

This content was generated by an AI assistant and inserted at the cursor position.
`

export function setupAIDemo(config: setupConfig) {
  const root = setup(config)
  const shadow = root.shadowRoot!

  const styleEl = document.createElement('style')
  styleEl.textContent = aiDemoToolbarStyle
  shadow.appendChild(styleEl)

  const controls = document.createElement('div')
  controls.classList.add('ai-demo-controls')

  const textarea = document.createElement('textarea')
  textarea.value = aiSampleContent
  textarea.placeholder = 'Enter markdown to stream...'

  const options = document.createElement('div')
  options.classList.add('ai-demo-options')

  const insertLabel = document.createElement('label')
  const insertCheckbox = document.createElement('input')
  insertCheckbox.type = 'checkbox'
  insertCheckbox.checked = true
  insertLabel.appendChild(insertCheckbox)
  insertLabel.appendChild(document.createTextNode('Insert at cursor'))

  const diffLabel = document.createElement('label')
  const diffCheckbox = document.createElement('input')
  diffCheckbox.type = 'checkbox'
  diffCheckbox.checked = true
  diffLabel.appendChild(diffCheckbox)
  diffLabel.appendChild(document.createTextNode('Diff review after streaming'))

  options.appendChild(insertLabel)
  options.appendChild(diffLabel)

  const toolbar = document.createElement('div')
  toolbar.classList.add('ai-demo-toolbar')

  function createBtn(text: string, cls: string, disabled = false) {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.classList.add(cls)
    btn.disabled = disabled
    toolbar.appendChild(btn)
    return btn
  }

  const startBtn = createBtn('Start Streaming', 'ai-btn-start')
  const stopBtn = createBtn('End Streaming', 'ai-btn-stop', true)
  const abortBtn = createBtn('Abort', 'ai-btn-abort', true)

  const sep = document.createElement('div')
  sep.classList.add('ai-separator')
  toolbar.appendChild(sep)

  const acceptBtn = createBtn('Accept All', 'ai-btn-accept', true)
  const rejectBtn = createBtn('Reject All', 'ai-btn-reject', true)
  const clearBtn = createBtn('Clear Diff', 'ai-btn-clear', true)

  controls.appendChild(textarea)
  controls.appendChild(options)
  controls.appendChild(toolbar)

  waitForInstance(config.args, 5000)
    .then((crepe) => {
      const crepeWrapper = shadow.querySelector('.milkdown') as HTMLElement
      if (crepeWrapper) {
        crepeWrapper.parentElement!.insertBefore(controls, crepeWrapper)
      } else {
        shadow.insertBefore(controls, shadow.firstChild)
      }

      let streamTimer: ReturnType<typeof setInterval> | null = null

      function setStreaming(active: boolean) {
        startBtn.disabled = active
        stopBtn.disabled = !active
        abortBtn.disabled = !active
        textarea.disabled = active
        insertCheckbox.disabled = active
        diffCheckbox.disabled = active
      }

      function setDiffReview(active: boolean) {
        acceptBtn.disabled = !active
        rejectBtn.disabled = !active
        clearBtn.disabled = !active
      }

      function stopTimer() {
        if (streamTimer) {
          clearInterval(streamTimer)
          streamTimer = null
        }
      }

      startBtn.addEventListener('click', () => {
        const insertAtCursor = insertCheckbox.checked
        crepe.editor.action((ctx) => {
          const cmds = ctx.get(commandsCtx)
          cmds.call(
            startStreamingCmd.key,
            insertAtCursor ? { insertAt: 'cursor' as const } : undefined
          )
        })
        setStreaming(true)

        const chars = Array.from(textarea.value)
        let idx = 0

        streamTimer = setInterval(() => {
          const chunkSize = Math.floor(Math.random() * 3) + 1
          let chunk = ''
          for (let j = 0; j < chunkSize && idx < chars.length; j++, idx++) {
            chunk += chars[idx]
          }

          if (chunk) {
            crepe.editor.action(callCommand(pushChunkCmd.key, chunk))
          }

          if (idx >= chars.length) {
            stopTimer()
            const diffReview = diffCheckbox.checked
            crepe.editor.action(
              callCommand(endStreamingCmd.key, { diffReview })
            )
            setStreaming(false)
            if (diffReview) setDiffReview(true)
          }
        }, 30)
      })

      stopBtn.addEventListener('click', () => {
        stopTimer()
        const diffReview = diffCheckbox.checked
        crepe.editor.action(callCommand(endStreamingCmd.key, { diffReview }))
        setStreaming(false)
        if (diffReview) setDiffReview(true)
      })

      abortBtn.addEventListener('click', () => {
        stopTimer()
        crepe.editor.action(callCommand(abortStreamingCmd.key, { keep: false }))
        setStreaming(false)
      })

      acceptBtn.addEventListener('click', () => {
        crepe.editor.action(callCommand(acceptAllDiffsCmd.key))
        setDiffReview(false)
      })

      rejectBtn.addEventListener('click', () => {
        crepe.editor.action(callCommand(rejectAllDiffsCmd.key))
        setDiffReview(false)
      })

      clearBtn.addEventListener('click', () => {
        crepe.editor.action(callCommand(clearDiffReviewCmd.key))
        setDiffReview(false)
      })
    })
    .catch(console.error)

  return root
}

function waitForInstance(args: Args, timeoutMs: number): Promise<Crepe> {
  return new Promise((resolve, reject) => {
    let cancelled = false
    const timeoutId = setTimeout(() => {
      cancelled = true
      reject(new Error(`Crepe instance not ready after ${timeoutMs}ms`))
    }, timeoutMs)

    const check = () => {
      if (cancelled) return
      if (args.instance) {
        clearTimeout(timeoutId)
        resolve(args.instance)
      } else {
        requestAnimationFrame(check)
      }
    }
    requestAnimationFrame(check)
  })
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

> Rarely will you find Floyd dishing up catchy hooks, tunes short enough for air-play, or predictable three-chord blues progressions; and never will you find them spending much time on the usual pop album of romance, partying, or self-hype. Their sonic universe is expansive, intense, and challenging ... Where most other bands neatly fit the songs to the music, the two forming a sort of autonomous and seamless whole complete with memorable hooks, Pink Floyd tends to set lyrics within a broader soundscape that often seems to have a life of its own ... Pink Floyd employs extended, stand-alone instrumentals which are never mere vehicles for showing off virtuoso but are planned and integral parts of the performance.

**Pink Floyd** are an English [rock](https://en.wikipedia.org/wiki/Rock_music "Rock music") band formed in London in 1965. Gaining an early following as one of the first British [psychedelic](https://en.wikipedia.org/wiki/Psychedelic_music "Psychedelic music") groups, they were distinguished by their extended compositions, sonic experiments, philosophical lyrics, and elaborate [live shows](https://en.wikipedia.org/wiki/Pink_Floyd_live_performances "Pink Floyd live performances"). They became a leading band of the [progressive rock](https://en.wikipedia.org/wiki/Progressive_rock "Progressive rock") genre, cited by some as the greatest progressive rock band of all time.

Pink Floyd were founded in 1965 by [Syd Barrett](https://en.wikipedia.org/wiki/Syd_Barrett "Syd Barrett") (guitar, lead vocals), [Nick Mason](https://en.wikipedia.org/wiki/Nick_Mason "Nick Mason") (drums), [Roger Waters](https://en.wikipedia.org/wiki/Roger_Waters "Roger Waters") (bass guitar, vocals) and [Richard Wright](https://en.wikipedia.org/wiki/Richard_Wright_(musician) "Richard Wright (musician)") (keyboards, vocals). With Barrett as their main songwriter, they released two hit singles, "[Arnold Layne](https://en.wikipedia.org/wiki/Arnold_Layne "Arnold Layne")" and "[See Emily Play](https://en.wikipedia.org/wiki/See_Emily_Play "See Emily Play")", and the successful debut album *[The Piper at the Gates of Dawn](https://en.wikipedia.org/wiki/The_Piper_at_the_Gates_of_Dawn "The Piper at the Gates of Dawn")* (all 1967). [David Gilmour](https://en.wikipedia.org/wiki/David_Gilmour "David Gilmour") (guitar, vocals) joined in December 1967, while Barrett left in April 1968 due to deteriorating mental health. The four remaining members began contributing to the musical composition, with Waters becoming the primary lyricist and thematic leader, devising the [concepts](https://en.wikipedia.org/wiki/Concept_album "Concept album") behind Pink Floyd's most successful albums, *[The Dark Side of the Moon](https://en.wikipedia.org/wiki/The_Dark_Side_of_the_Moon "The Dark Side of the Moon")* (1973), *[Wish You Were Here](https://en.wikipedia.org/wiki/Wish_You_Were_Here_(Pink_Floyd_album) "Wish You Were Here (Pink Floyd album)")* (1975), *[Animals](https://en.wikipedia.org/wiki/Animals_(Pink_Floyd_album))* (1977) and *[The Wall](https://en.wikipedia.org/wiki/The_Wall "The Wall")* (1979). The [musical film](https://en.wikipedia.org/wiki/Musical_film "Musical film") based on *The Wall*, *[Pink Floyd – The Wall](https://en.wikipedia.org/wiki/Pink_Floyd_%E2%80%93_The_Wall "Pink Floyd – The Wall")* (1982), won two [BAFTA Awards](https://en.wikipedia.org/wiki/BAFTA_Awards "BAFTA Awards"). Pink Floyd also composed several [film scores](https://en.wikipedia.org/wiki/Film_score "Film score").

---

## Discography

*Main articles: [Pink Floyd discography](https://en.wikipedia.org/wiki/Pink_Floyd_discography "Pink Floyd discography") and [List of songs recorded by Pink Floyd](https://en.wikipedia.org/wiki/List_of_songs_recorded_by_Pink_Floyd "List of songs recorded by Pink Floyd")*

**Studio albums**

* *[The Piper at the Gates of Dawn](https://en.wikipedia.org/wiki/The_Piper_at_the_Gates_of_Dawn "The Piper at the Gates of Dawn")* (1967)
* *[A Saucerful of Secrets](https://en.wikipedia.org/wiki/A_Saucerful_of_Secrets "A Saucerful of Secrets")* (1968)
* *[More](https://en.wikipedia.org/wiki/More_(soundtrack) "More (soundtrack)")* (1969)
* *[Ummagumma](https://en.wikipedia.org/wiki/Ummagumma "Ummagumma")* (1969)
* *[Atom Heart Mother](https://en.wikipedia.org/wiki/Atom_Heart_Mother "Atom Heart Mother")* (1970)
* *[Meddle](https://en.wikipedia.org/wiki/Meddle "Meddle")* (1971)
* *[Obscured by Clouds](https://en.wikipedia.org/wiki/Obscured_by_Clouds "Obscured by Clouds")* (1972)
* *[The Dark Side of the Moon](https://en.wikipedia.org/wiki/The_Dark_Side_of_the_Moon "The Dark Side of the Moon")* (1973)
* *[Wish You Were Here](https://en.wikipedia.org/wiki/Wish_You_Were_Here_(Pink_Floyd_album) "Wish You Were Here (Pink Floyd album)")* (1975)
* *[Animals](https://en.wikipedia.org/wiki/Animals_(Pink_Floyd_album) "Animals (Pink Floyd album)")* (1977)
* *[The Wall](https://en.wikipedia.org/wiki/The_Wall "The Wall")* (1979)
* *[The Final Cut](https://en.wikipedia.org/wiki/The_Final_Cut_(album) "The Final Cut (album)")* (1983)
* *[A Momentary Lapse of Reason](https://en.wikipedia.org/wiki/A_Momentary_Lapse_of_Reason "A Momentary Lapse of Reason")* (1987)
* *[The Division Bell](https://en.wikipedia.org/wiki/The_Division_Bell "The Division Bell")* (1994)
* *[The Endless River](https://en.wikipedia.org/wiki/The_Endless_River "The Endless River")* (2014)
`

export const modifiedLongContent = `
# Heading 1 Modified
## Heading 2
### Heading 3 Updated
#### Heading 4
##### Heading 5

![1.0](https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png)

![0.5](/milkdown-logo.png)

\`\`\`typescript
const crepe = new Crepe({
  root: '#editor',
  defaultValue: 'Hello World',
})
crepe.create()
\`\`\`

* List Item 1
* List Item 2 Updated
    * List Item 3
    * List Item 4
    * List Item 5 (new)
* List Item 5
* List Item 6

1. List Item 1
2. List Item 2
    1. List Item 1
    2. List Item 2
    3. List Item 3 (new)
3. List Item 3

* [ ] List Item 1
* [x] List Item 2 (completed)
    * [x] List Item 1
    * [x] List Item 2
* [ ] List Item 3
* [ ] List Item 4 (new task)

> Is this the **real life**?
>
> Is this just *fantasy*?
>
> Caught in a \`landslide\`,
>
> No escape from [reality](https://en.wikipedia.org/wiki/Bohemian_Rhapsody).
>
> Any way the **wind** blows.

The equation $E=mc^3$ describes mass-energy equivalence with a twist.

$$
\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}
$$

Open your eyes, look up to the skies and see. You are not alone in this world.

| Fruit | Animal | Vegetable | Color |
| ----- | :----: | --------: | ----- |
|   🍎 | 🐱  | 🥕 | Red |
|   🍌 | 🐶  | 🥦 | Yellow |
|   🍒 | 🐎  | 🎃 | Red |
|   🍇 | 🐰  | 🥬 | Purple |

## New Section

This is a brand new section added at the end of the document.
`
