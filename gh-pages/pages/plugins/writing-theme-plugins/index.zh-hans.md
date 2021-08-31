# 编写主题插件

## 概览

```typescript
import { themeFactory } from '@milkdown/core';

const customTheme = themeFactory({
    font: {
        typography: ['Roboto', 'Helvetica', 'Arial'],
        code: ['Monaco', 'Fira Code'],
    },
    size: {
        radius: '2px',
        lineWidth: '1px',
    },
    color: {
        primary: '#ff79c6',
        secondary: '#bd93f9',
        neutral: '#000',
        background: '#fff',
    },
});
```

---

## 属性

### font

Font 定义了编辑器中的字体。

-   typography
    编辑器中的文本的字体，例如标题，段落，引用。

-   code
    编辑器中的代码的字体，例如代码块和行内代码。

### size

-   radius
    圆角的大小。

-   lineWidth
    线的宽度，例如 border 和分割线。

### color

编辑器的色板。

-   primary
    编辑器的主色。通常被用在大色块上，例如引用区的色块。
-   secondary
    编辑器的副色，用在提示区域，例如链接。
-   solid
    编辑器中控件的颜色，例如按钮和输入框。
-   shadow
    阴影的颜色。
-   line
    线的颜色。
-   surface
    编辑器的背景色。
-   background
    编辑器其它区块的背景色，例如代码块和数学公式输入区。

### mixin

Mixin 定义了一些预设样式，方便其它插件重用。

-   scrollbar
    滚动条的样式。
-   shadow
    阴影的样式。
-   border
    边框的样式。

### slots

Slots 不仅定义了样式，还定义了对应的 dom 元素。

-   icon
    定义了对于不同 id，如何实现对应的图标。

需要实现的图标 id:

| 类型 | Ids                                           |
| ---- | --------------------------------------------- |
| 段落 | h1, h2, h3, quote, code, table, divider       |
| 图片 | image, brokenImage                            |
| 列表 | bulletList, orderedList, taskList             |
| 箭头 | leftArrow, rightArrow, upArrow, downArrow     |
| 对齐 | alignLeft, alignRight, alignCenter            |
| 编辑 | delete, select                                |
| 行内 | bold, italic, inlineCode, strikeThrough, link |
| 状态 | checked, unchecked, loading                   |

### global

为编辑器注入的全局样式。

## 示例: NES 主题

> 暂时只支持英文，因为没有找到合适的中文字体 CDN。

!CodeSandBox{milkdown-theme-nes-b0zmy?fontsize=14&hidenavigation=1&theme=dark&view=preview}
