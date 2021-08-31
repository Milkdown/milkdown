# Writing Theme Plugins

In the world of milkdown, themes are also plugins. We provide a `themeFactory` helper for users to create plugins.

> We use [@emotion/css](https://www.npmjs.com/package/@emotion/css) package to define styles.

## Overview

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

## Properties

### font

Font defines the font in editor.

-   typography
    The font in text block, such as heading, paragraph and blockquote.

-   code
    The font in code block, such as code fence and inline code.

### size

-   radius
    The size of border radius.

-   lineWidth
    Width of line in code editor, such as border and divider.

### color

Color palette in editor.

-   primary
    Primary color of editor. Used in large color block, such as the color bar of blockquote.
-   secondary
    Secondary color of editor. Used in tips area, such as link.
-   solid
    Color of widgets such as buttons and inputs.
-   shadow
    Color of shadow.
-   line
    Color of line.
-   surface
    Color of editor background.
-   background
    Color of other area's background, such as background of code fence and math block.

### mixin

Mixin defines some style shortcuts for other plugins to reuse them.

-   scrollbar
    Style of scrollbar.
-   shadow
    Style of shadow.
-   border
    Style of border.

### slots

Slots defines not only style, but also dom elements.

-   icon
    Define how to implement icon for different icon ids.

Icon ids need to be implemented:

| Type      | Ids                                           |
| --------- | --------------------------------------------- |
| Paragraph | h1, h2, h3, quote, code, table, divider       |
| Image     | image, brokenImage                            |
| List      | bulletList, orderedList, taskList             |
| Arrow     | leftArrow, rightArrow, upArrow, downArrow     |
| Align     | alignLeft, alignRight, alignCenter            |
| Edit      | delete, select                                |
| Mark      | bold, italic, inlineCode, strikeThrough, link |
| Status    | checked, unchecked, loading                   |

### global

Inject global style for editor.

## Example: NES Theme

!CodeSandBox{milkdown-theme-nes-b0zmy?fontsize=14&hidenavigation=1&theme=dark&view=preview}
