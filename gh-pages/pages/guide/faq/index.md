# FAQ

This page lists answers of FAQ.

---

### How can I change contents programmatically?

You should use `editor.action` to change the contents.
We provide two macros for change contents in milkdown, [insert](/macros#insert) and [replaceAll](/macros#replaceAll)

```typescript
import { insert, replaceAll } from '@milkdown/utils';

const editor = await Editor.make()
    // .use(<All Your Plugins>)
    .create();

editor.action(insert('# New Heading'));

editor.action(replaceAll('# New Document'));
```

---

### How can I switch theme?

You should use `editor.action` to switch theme.
We provide the [switchTheme](/macros#switchtheme) macro for switching theme.

```typescript
import { switchTheme } from '@milkdown/utils';
import { nord } from '@milkdown/theme-nord';

const editor = await Editor.make()
    // .use(<All Your Plugins>)
    .create();

editor.action(switchTheme(nord));
```

You can also open [switch theme](/using-themes#switch-theme) to read more.

---

### Why the icons won't show up for theme nord/tokyo?

We use material icon and roboto font for these two themes, you need to import them.

For example, you can get them from CDN:

```html
<!--Roboto-->
<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
/>

<!--Material Icon-->
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" />
```
