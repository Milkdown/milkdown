# @milkdown/plugin-slash

Slash plugin for [milkdown](https://milkdown.dev/).
Add support for slash commands.

> Although this plugin is called _slash_, it is not limited to slash commands.
> It's also possible to use it for other commands, such as `@` to mentions or `:` to emoji.
>
> It's designed to solve one problem: input some characters and get a list of suggestions.

## Usage

#### Create Slash View

Create slash view is simple.
All you need to do is to implement the [Prosemirror Plugin.view](https://prosemirror.net/docs/ref/#state.PluginSpec.view).

```typescript
import { SlashProvider } from '@milkdown/plugin-slash'

function slashPluginView(view) {
  const content = document.createElement('div');

  const provider = new SlashProvider({
    content: this.content,
  });

  return {
    update: (updatedView, prevState) => {
      provider.update(updatedView, prevState);
    },
    destroy: () => {
      provider.destroy();
      content.remove();
    }
  }
}
```

#### Bind Slash View

You need to bind the slash view to the plugin in `editor.config`.

```typescript
import { Editor } from '@milkdown/core';

import { slashFactory } from '@milkdown/plugin-slash';

const slash = tooltipFactory('my-slash');

Editor
  .make()
  .config((ctx) => {
    ctx.set(slash.key, {
      view: slashPluginView
    })
  })
  .use(slash)
  .create();
```

## Use with React

TODO: add docs about how to use with prosemirror-adapter/react

## Use with Vue

TODO: add docs about how to use with prosemirror-adapter/vue

## API

@slashFactory

@SlashProvider
@SlashProviderOptions
