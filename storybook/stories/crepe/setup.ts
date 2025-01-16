import { Crepe } from '@milkdown/crepe'
import all from '@milkdown/crepe/theme/common/style.css?inline'
import localStyle from './style.css?inline'
import type { Extension } from '@codemirror/state'
import { injectMarkdown, wrapInShadow } from '../utils/shadow'

export interface Args {
  instance: Crepe
  readonly: boolean
  defaultValue: string
  enableCodemirror: boolean
  language: 'EN' | 'JA'
}

export interface setupConfig {
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
    },
    featureConfigs: {
      [Crepe.Feature.LinkTooltip]: {
        inputPlaceholder:
          language === 'JA' ? 'リンクを貼り付け...' : 'Paste link...',
      },
      [Crepe.Feature.ImageBlock]: {
        inlineUploadButton: () =>
          language === 'JA' ? 'アップロード' : 'Upload',
        inlineUploadPlaceholderText:
          language === 'JA' ? 'またはリンクを貼り付ける' : 'or paste link',
        inlineConfirmButton: () => (language === 'JA' ? '確認' : 'Confirm'),
        blockUploadButton: () =>
          language === 'JA' ? 'ファイルをアップロード' : 'Upload file',
        blockUploadPlaceholderText:
          language === 'JA' ? 'またはリンクを貼り付ける' : 'or paste link',
        blockCaptionPlaceholderText:
          language === 'JA' ? '画像の説明を書く...' : 'Write Image Caption',
        blockConfirmButton: () => (language === 'JA' ? '確認' : 'Confirm'),
      },
      [Crepe.Feature.BlockEdit]: {
        slashMenuTextGroupLabel: language === 'JA' ? 'テキスト' : 'Text',
        slashMenuTextLabel: language === 'JA' ? 'テキスト' : 'Text',
        slashMenuH1Label: language === 'JA' ? '見出し1' : 'Heading 1',
        slashMenuH2Label: language === 'JA' ? '見出し2' : 'Heading 2',
        slashMenuH3Label: language === 'JA' ? '見出し3' : 'Heading 3',
        slashMenuH4Label: language === 'JA' ? '見出し4' : 'Heading 4',
        slashMenuH5Label: language === 'JA' ? '見出し5' : 'Heading 5',
        slashMenuH6Label: language === 'JA' ? '見出し6' : 'Heading 6',
        slashMenuQuoteLabel: language === 'JA' ? '引用' : 'Quote',
        slashMenuDividerLabel: language === 'JA' ? '区切り線' : 'Divider',

        slashMenuListGroupLabel: language === 'JA' ? 'リスト' : 'List',
        slashMenuBulletListLabel:
          language === 'JA' ? '箇条書き' : 'Bullet List',
        slashMenuOrderedListLabel:
          language === 'JA' ? '番号付きリスト' : 'Ordered List',
        slashMenuTaskListLabel:
          language === 'JA' ? 'タスクリスト' : 'Task List',

        slashMenuAdvancedGroupLabel:
          language === 'JA' ? '高度な機能' : 'Advanced',
        slashMenuImageLabel: language === 'JA' ? '画像' : 'Image',
        slashMenuCodeBlockLabel: language === 'JA' ? 'コード' : 'Code',
        slashMenuTableLabel: language === 'JA' ? '表' : 'Table',
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
        previewLabel: () => (language === 'JA' ? 'プレビュー' : 'Preview'),
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
