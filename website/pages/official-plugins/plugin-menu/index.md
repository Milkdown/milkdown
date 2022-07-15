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

Example:

```typescript
import { menu, menuPlugin } from '@milkdown/plugin-menu';
import { themeToolCtx, commandsCtx } from '@milkdown/core';

Editor.make().use(
    menu.configure(menuPlugin, {
        config: [
            [
                {
                    type: 'select',
                    text: 'Heading',
                    options: [
                        { id: '1', text: 'Large Heading' },
                        { id: '2', text: 'Medium Heading' },
                        { id: '3', text: 'Small Heading' },
                        { id: '0', text: 'Plain Text' },
                    ],
                    disabled: (view) => {
                        const { state } = view;
                        const setToHeading = (level: number) =>
                            setBlockType(state.schema.nodes.heading, { level })(state);
                        return !(setToHeading(1) || setToHeading(2) || setToHeading(3));
                    },
                    onSelect: (id) => (id ? [TurnIntoHeading, Number(id)] : [TurnIntoText, null]),
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
        ],
    }),
);
```
