# @milkdown/plugin-menu

Menu plugin for [milkdown](https://saul-mirone.github.io/milkdown/).
Add support for menu bar.

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { menu } from '@milkdown/plugin-menu';

Editor.make().use(nord).use(commonmark).use(menu()).create();
```

# Options

## config

Configure the slash plugin placeholders & items with custom status builder.

Example:

```typescript
import { menu } from '@milkdown/plugin-menu';
import { themeToolCtx, commandsCtx } from '@milkdown/core';

Editor.make().use(
    menu(
        [
            {
                type: 'select',
                text: 'Heading',
                options: [
                    { id: '1', text: 'Large Heading' },
                    { id: '2', text: 'Medium Heading' },
                    { id: '3', text: 'Small Heading' },
                ],
                disabled: (view) => {
                    const { state } = view;
                    const setToHeading = (level: number) => setBlockType(state.schema.nodes.heading, { level })(state);
                    return !(setToHeading(1) || setToHeading(2) || setToHeading(3));
                },
                onSelect: (id) => [TurnIntoHeading, Number(id)],
            },
        ],
        [
            {
                type: 'button',
                icon: 'bold',
                key: ToggleBold,
                active: (view) => hasMark(view.state, view.state.schema.marks.strong),
            },
            {
                type: 'button',
                icon: 'italic',
                key: ToggleItalic,
                active: (view) => hasMark(view.state, view.state.schema.marks.em),
            },
            {
                type: 'button',
                icon: 'strikeThrough',
                key: ToggleStrikeThrough,
                active: (view) => hasMark(view.state, view.state.schema.marks.strike_through),
            },
        ],
        [
            {
                type: 'button',
                icon: 'bulletList',
                key: WrapInBulletList,
                disabled: (view) => {
                    const { state } = view;
                    return !wrapIn(state.schema.nodes.bullet_list)(state);
                },
            },
            {
                type: 'button',
                icon: 'orderedList',
                key: WrapInOrderedList,
                disabled: (view) => {
                    const { state } = view;
                    return !wrapIn(state.schema.nodes.ordered_list)(state);
                },
            },
            {
                type: 'button',
                icon: 'taskList',
                key: TurnIntoTaskList,
                disabled: (view) => {
                    const { state } = view;
                    return !wrapIn(state.schema.nodes.task_list_item)(state);
                },
            },
        ],
    ),
);
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
