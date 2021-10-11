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

Modify the list of slash plugin.

Example:

```typescript
import { slashPlugin, slash, createDropdownItem, config, nodeExists } from '@milkdown/plugin-slash';

Editor.make().use(
    slash.configure(slashPlugin, {
        config: (utils) =>
            config(utils)
                .filter((c) => !['h1', 'h2', 'h3'].includes(c.id))
                .concat([
                    {
                        id: 'h1',
                        dom: createDropdownItem(utils.ctx.get(themeToolCtx), 'My Heading Tips', 'h1'),
                        command: () => utils.ctx.get(commandsCtx).call(TurnIntoHeading),
                        keyword: ['h1', 'my heading', 'heading'],
                        enable: nodeExists('heading'),
                    },
                ]),
    }),
);
```

## placeholder

Modify the placeholder of slash plugin.

Example:

```typescript
import { slashPlugin, slash, CursorStatus } from '@milkdown/plugin-slash';

Editor.make().use(
    slash.configure(slashPlugin, {
        placeholder: {
            [CursorStatus.Empty]: 'Now you need to type a / ...',
            [CursorStatus.Slash]: 'Keep typing to search...',
        },
    }),
);
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
