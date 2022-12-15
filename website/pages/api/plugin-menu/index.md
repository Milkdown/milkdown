# @milkdown/plugin-menu

Menu plugin for [milkdown](https://milkdown.dev/).
Add support for menu bar.

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { menu } from '@milkdown/plugin-menu';

Editor.make().use(nord).use(commonmark).use(menu).create();
```

## Config

Configure the slash plugin placeholders & items with custom status builder.

```typescript
import { menu, menuPlugin } from '@milkdown/plugin-menu';

Editor.make().use(
    menu.configure(menuPlugin, {
        config: [
            /* your config */
        ],
    }),
);
```

You can find the [default config here](https://github.com/Saul-Mirone/milkdown/blob/main/packages/plugin-menu/src/default-config.ts).

## domHandler

You can also provide your own dom handler to control where should the menu dom be inserted.

```typescript
import { menu, menuPlugin } from '@milkdown/plugin-menu';

Editor.make().use(
    menu.configure(menuPlugin, {
        domHandler: () => {
            /* your dom handler */
        },
    }),
);
```

You can find the [default dom handler here](https://github.com/Saul-Mirone/milkdown/blob/main/packages/plugin-menu/src/menubar.ts#L23).
