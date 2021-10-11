# @milkdown/plugin-tooltip

Tooltip plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for tooltip commands.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { tooltip } from '@milkdown/plugin-tooltip';

Editor.make().use(nord).use(commonmark).use(tooltip).create();
```

# Placeholder

Modify the input widgets of link and image.

Example:

```typescript
import { tooltipPlugin, tooltip } from '@milkdown/plugin-tooltip';

Editor.make().use(
    tooltip.configure(tooltipPlugin, {
        link: {
            placeholder: 'Please input link...',
            buttonText: 'Confirm',
        },
        image: {
            placeholder: 'Please input image link...',
            buttonText: 'OK',
        },
        inlineMath: {
            placeholder: 'Please input inline math...',
        },
    }),
);
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
