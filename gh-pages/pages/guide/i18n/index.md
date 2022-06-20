# i18n

By default, the language of milkdown is currently English.
If you want to use other language, you can configure the presets and plugins to support it.

## Preset Commonmark

You can configure the following properties for i18n in preset-commonmark:

-   image
    -   input.placeholder
    -   input.buttonText
-   link
    -   input.placeholder
    -   input.buttonText

Example:

```typescript
import { commonmark, image, link } from '@milkdown/preset-commonmark';

const myCommonmark = commonmark
    .configure(link, {
        input: {
            placeholder: '👻',
            buttonText: '✅',
        },
    })
    .configure(image, {
        input: {
            placeholder: '👻',
            buttonText: '✅',
        },
    });
```

## Plugin Math

Similar to preset-commonmark, you can configure the following properties for i18n in plugin-math:

-   mathInline
    -   placeholder.empty
    -   placeholder.error
    -   input.placeholder
-   mathBlock
    -   placeholder.empty
    -   placeholder.error

## Plugin Diagram

Similar to preset-commonmark, you can configure the following properties for i18n in plugin-diagram:

-   diagramNode
    -   placeholder.empty
    -   placeholder.error

## Plugin Slash

You can configure the `config` property to provide your own texts for slash plugin.
The placeholder and list items can be configured with this property.

```typescript
import { createDropdownItem, defaultActions, slash, slashPlugin, WrappedAction } from '@milkdown/plugin-slash';

const mySlash = slash.configure(slashPlugin, {
    config: (ctx) => {
        return ({ content, isTopLevel }) => {
            if (!isTopLevel) return null;

            if (!content) {
                return { placeholder: '<empty content>' };
            }

            const mapActions = (action: WrappedAction) => {
                const { id = '' } = action;
                switch (id) {
                    case 'h1':
                        action.dom = createDropdownItem(ctx.get(themeManagerCtx), '<heading 1>', 'h1');
                        return action;
                    case 'h2':
                        action.dom = createDropdownItem(ctx.get(themeManagerCtx), '<heading 2>', 'h2');
                        return action;
                    // others ids
                    default:
                        return action;
                }
            };

            if (content.startsWith('/')) {
                return content === '/'
                    ? {
                          placeholder: '<type to search>',
                          actions: defaultActions(ctx).map(mapActions),
                      }
                    : {
                          actions: defaultActions(ctx, content).map(mapActions),
                      };
            }

            return null;
        };
    },
});

milkdown.use(mySlash);
```

## Plugin Menu

You can configure the `config` property to provide your own texts for menu plugin.
In most cases, what you want is to override the **selectable menu item**.

```typescript
import { menu, menuPlugin, defaultConfig } from '@milkdown/plugin-menu';

const myMenu = menu.configure(menuPlugin, {
    config: defaultConfig.map((section) => {
        return section.map((item) => {
            if (item.type !== 'select') return item;

            switch (item.text) {
                case 'Heading': {
                    return {
                        ...item,
                        text: '<heading selection>',
                        options: [
                            { id: '1', text: '<text for h1>' },
                            { id: '2', text: '<text for h2>' },
                            { id: '3', text: '<text for h3>' },
                            { id: '0', text: '<text for paragraph>' },
                        ],
                    };
                }
                default:
                    return item;
            }
        });
    }),
});

milkdown.use(myMenu);
```

## Icons

You can also configure the icon's label by overriding the theme you use.
All theme will have an `override` method to override some part of it.

```typescript
import { nord } from '@milkdown/theme-nord';
import { ThemeIcon } from '@milkdown/core';

import { Icon, IconValue } from '@milkdown/core';

const iconMapping: Record<Icon, { icon: string; label: string }> = {
    h1: {
        label: '<your h1 label>',
        icon: 'looks_one',
    },
    // your other icon configs...
};

const getIcon = (id: Icon): IconValue | undefined => {
    const target = iconMapping[id];
    if (!target) {
        return;
    }
    const span = document.createElement('span');
    span.className = 'icon material-icons material-icons-outlined';
    span.textContent = iconMapping[id].icon;

    return {
        dom: span,
        label: target.label,
    };
};

const myTheme = nord.override((emotion, manager) => {
    manager.set(ThemeIcon, (icon) => {
        if (!icon) return;

        return getIcon(icon);
    });
});
```

## Example

Here is an example of configure the i18n of milkdown to emoji for fun.

!CodeSandBox{milkdown-i18n-2uzcvk?fontsize=14&hidenavigation=1&theme=dark&view=preview}
