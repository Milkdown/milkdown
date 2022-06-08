# i18n

默认情况下，milkdown 的语言目前是英语。
如果你想使用其他语言，你可以配置 plugin 和 preset 来支持它。

## Preset Commonmark

你可以在 preset-commonmark 中为 i18n 配置以下属性。

-   image
    -   input.placeholder
    -   input.buttonText
-   link
    -   input.placeholder
    -   input.buttonText

例如：

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

与 preset-commonmark 类似，你可以在 plugin-math 中为 i18n 配置以下属性。

-   mathInline
    -   placeholder.empty
    -   placeholder.error
    -   input.placeholder
-   mathBlock
    -   placeholder.empty
    -   placeholder.error

## Plugin Diagram

与 preset-commonmark 类似，你可以在 plugin-diagram 中为 i18n 配置以下属性。

-   diagramNode
    -   placeholder.empty
    -   placeholder.error

## Plugin Slash

你可以配置`config`属性，为 slash 插件提供你自己的文本。
占位符和列表项可以通过这个属性进行配置。

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

你可以配置`config`属性，为菜单插件提供你自己的文本。
在大多数情况下，你想要的是覆盖**可选择的菜单项**。

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

## 图标

你也可以通过覆盖你使用的主题来配置图标的标签。
所有的主题都有一个`override`方法来覆盖它的某些部分。

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

## 示例

下面是一个将 milkdown 的 i18n 配置为 emoji 的例子，只是为了好玩。

!CodeSandBox{milkdown-i18n-2uzcvk?fontsize=14&hidenavigation=1&theme=dark&view=preview}
