# 开始使用

## 概览

Milkdown 是一个轻量但强大的 WYSIWYG （所见即所得）的 markdown 编辑器。它有两部分组成：

-   一个小巧的核心，提供了插件加载器和一些内置插件。
-   大量的插件，包括语法、命令和组件。

通过这种模式，你可以根据喜好开启或关闭语法和功能，例如表格，数学公式或斜线指令。你甚至可以创造自己的插件来实现你的想法。

> :baby_bottle: 有趣的事实: Milkdown 的文档就是由 Milkdown 渲染的。

---

## 特性

-   [x] 📝 **所见即所得的 Markdown** - 以一种优雅的方式编写 markdown
-   [x] 🎨 **可定制主题** - 主题可以通过 npm 包安装和共享
-   [x] **可交互** - 通过插件支持你的脑洞
-   [x] 🦾 **值得信赖** - 基于[prosemirror](https://prosemirror.net/) 和 [remark](https://github.com/remarkjs/remark)构建
-   [x] ⚡️ **斜线指令和工具条** - 让任何人都可以使用，通过插件
-   [x] 🧮 **数学支持** - LaTeX 数学公式支持，通过插件
-   [x] 📊 **表格支持** - 拥有流畅的 ui 的表格支持，通过插件
-   [x] 🍻 **协同编辑** - 基于[yjs](https://docs.yjs.dev/)的协同编辑支持，通过插件
-   [x] 💾 **剪贴板** - 支持 markdown 格式的复制粘贴，通过插件
-   [x] :+1: **Emoji** - 支持 emoji 快捷指令和选择器，通过插件

## 技术栈

Milkdown 基于这些工具：

-   [Prosemirror](https://prosemirror.net/) 和它的社区 - 一个用于在 web 端构建富文本编辑器的工具包
-   [Remark](https://github.com/remarkjs/remark) 和它的社区 - 正确的 markdown 解析器
-   [Postcss](https://postcss.org/) - 用于构建主题的强大的 css 工具
-   [TypeScript](https://www.typescriptlang.org/) - 以 TypeScript 编写
-   [Prism](https://prismjs.com/) - 代码块支持
-   [Katex](https://katex.org/) - 高性能的渲染数学公式

---

## 第一个编辑器

我们有一些代码片段来让你创建一个最简单的编辑器：

> **我们在主题中使用了 [material 图标](https://fonts.google.com/icons) 和 [Roboto 字体](https://fonts.google.com/specimen/Roboto)**.
> 请确保引入它们来保证最好的体验。

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

// 导入主题和插件的样式
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

new Editor().use(commonmark).create();
```

## 尝试一下插件

现在让我们为编辑器添加 **撤销 & 重做** 支持：

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';

// 导入主题和插件的样式
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

new Editor().use(commonmark).use(history).create();
```

> `Mod` 在 mac 上为 `Cmd`， 在其它平台为 `Ctrl` .

现在我们可以通过`Mod-z`来撤销一次编辑，并通过`Mod-y`或`Shift-Mod-Z`来重做它。
