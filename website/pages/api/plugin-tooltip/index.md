# @milkdown/plugin-tooltip

Tooltip plugin for [milkdown](https://milkdown.dev/).
Add support for universal tooltip in milkdown.

## Usage

#### Create Tooltip View

Create tooltip view is simple.
All you need to do is to implement the [Prosemirror Plugin.view](https://prosemirror.net/docs/ref/#state.PluginSpec.view).

```typescript
import { TooltipProvider } from '@milkdown/plugin-tooltip'

function tooltipPluginView(view) {
  const content = document.createElement('div');

  const provider = new TooltipProvider({
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

#### Bind Tooltip View

You need to bind the tooltip view to the plugin in `editor.config`.

```typescript
import { Editor } from '@milkdown/core';

import { tooltipFactory } from '@milkdown/plugin-tooltip';

const tooltip = tooltipFactory('my-tooltip');

Editor
  .make()
  .config((ctx) => {
    ctx.set(tooltip.key, {
      view: tooltipPluginView
    })
  })
  .use(tooltip)
  .create();
```

## Use with React

TODO: add docs about how to use with prosemirror-adapter/react

## Use with Vue

TODO: add docs about how to use with prosemirror-adapter/vue

## API

@tooltipFactory

@TooltipProvider
@TooltipProviderOptions
