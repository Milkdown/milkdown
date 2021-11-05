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

Configure the slash plugin placehoders & items with custom status builder.

Example:

```typescript
import { slashPlugin, slash, createDropdownItem, defaultActions, nodeExists } from '@milkdown/plugin-slash';

Editor.make().use(
    slash.configure(slashPlugin, {
        config: (ctx) => {
            // Define a status builder
            return ({ isTopLevel, content, parentNode }) => {
                // You can only enable
                if (!isTopLevel) return null;

                // Empty content ? Set your custom empty placeholder !
                if (!content) {
                    return { placeholder: 'Type / to use the slash commands...' };
                }

                // Filter the placeholder & actions (dropdown items) you want to display depending on content
                if (content.startsWith('/')) {
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

                if (parentNode.type.name === 'customNode') {
                    // Show something depending on your content parent node
                }
            };
        },
    }),
);
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
