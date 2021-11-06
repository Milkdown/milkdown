# @milkdown/plugin-slash

Slash plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for slash commands.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { slash } from '@milkdown/plugin-slash';

Editor.make().use(nord).use(commonmark).use(slash).create();
```

# Options

## config

Configure the slash plugin placeholders & items with custom status builder.

Example:

```typescript
import { slashPlugin, slash, createDropdownItem, defaultActions } from '@milkdown/plugin-slash';
import { themeToolCtx, commandsCtx } from '@milkdown/core';

Editor.make().use(
    slash.configure(slashPlugin, {
        config: (ctx) => {
            // Get default slash plugin items
            const actions = defaultActions(ctx);

            // Define a status builder
            return ({ isTopLevel, content, parentNode }) => {
                // You can only show something at root level
                if (!isTopLevel) return null;

                // Empty content ? Set your custom empty placeholder !
                if (!content) {
                    return { placeholder: 'Type / to use the slash commands...' };
                }

                // Define the placeholder & actions (dropdown items) you want to display depending on content
                if (content.startsWith('/')) {
                    // Add some actions depending on your content's parent node
                    if (parentNode.type.name === 'customNode') {
                        actions.push({
                            id: 'custom',
                            dom: createDropdownItem(ctx.get(themeToolCtx), 'Custom', 'h1'),
                            command: () => ctx.get(commandsCtx).call(/* Add custom command here */),
                            keyword: ['custom'],
                            enable: () => true,
                        });
                    }

                    return content === '/'
                        ? {
                              placeholder: 'Type to filter...',
                              actions,
                          }
                        : {
                              actions: actions.filter(({ keyword }) =>
                                  keyword.some((key) => key.includes(content.slice(1).toLocaleLowerCase())),
                              ),
                          };
                }
            };
        },
    }),
);
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
