# 開始使用

## 概覽

Milkdown 是一個輕量但強大的 WYSIWYG（所見即所得）的 markdown 編輯器。它有兩部分組成：

-   一個小巧的核心，提供了插件載入器和一些內建插件。
-   大量的插件，包括語法、命令和元件。

通過這種模式，你可以根據喜好開啟或關閉語法和功能，例如表格，數學公式或斜線指令。你甚至可以創造自己的插件來實現你的想法。

> 🍼: 有趣的事實：Milkdown 的文件就是由 Milkdown 渲染的。

---

## 特性

-   [x] 📝 **所見即所得的 Markdown** - 以一種優雅的方式編寫 markdown
-   [x] 🎨 **可定製主題** - 主題可以通過 npm 包安裝和共享
-   [x] 🎮 **可互動** - 通過插件支援你的腦洞
-   [x] 🦾 **值得信賴** - 基於 [prosemirror](https://prosemirror.net/) 和 [remark](https://github.com/remarkjs/remark) 構建
-   [x] ⚡ **斜線指令和工具條** - 讓任何人都可以使用，通過插件
-   [x] 🧮 **數學支援** - LaTeX 數學公式支援，通過插件
-   [x] 📊 **表格支援** - 擁有流暢的 ui 的表格支援，通過插件
-   [x] 🍻 **協同編輯** - 基於 [yjs](https://docs.yjs.dev/) 的共同編輯支援，通過插件
-   [x] 💾 **剪貼簿** - 支援 markdown 格式的複製貼上，通過插件
-   [x] 👍 **Emoji** - 支援 emoji 快捷指令和選擇器，通過插件

## 技術棧

Milkdown 基於這些工具：

-   [Prosemirror](https://prosemirror.net/) 和它的社群 - 一個用於在 web 端構建富文字編輯器的工具包
-   [Remark](https://github.com/remarkjs/remark) 和它的社群 - 正確的 markdown 解析器
-   [TypeScript](https://www.typescriptlang.org/) - 以 TypeScript 編寫
-   [Emotion](https://emotion.sh/) - 用於構建樣式的強大的 css in js 工具
-   [Prism](https://prismjs.com/) - 程式碼塊支援
-   [Katex](https://katex.org/) - 高效能的渲染數學公式

---

## 第一個編輯器

我們有一些程式碼片段來讓你建立一個最簡單的編輯器：

> **我們在主題中使用了 [material 圖示](https://fonts.google.com/icons) 和 [Roboto 字型](https://fonts.google.com/specimen/Roboto)**。
> 請確保引入它們來保證最好的體驗。

```typescript
import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';

Editor.make().use(nord).use(commonmark).create();
```

## 嘗試一下插件

現在讓我們為編輯器新增 **撤銷 & 重做** 支援：

```typescript
import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';

Editor.make().use(nord).use(commonmark).use(history).create();
```

> `Mod` 在 mac 上為 `Cmd`，在其它平臺為 `Ctrl`。

現在我們可以通過 `Mod-z` 來撤銷一次編輯，並通過 `Mod-y` 或 `Shift-Mod-Z` 來重做它。

---

## 線上範例

!CodeSandBox{milkdown-vanilla-setup-8xobc?fontsize=14&hidenavigation=1&theme=dark&view=preview}
