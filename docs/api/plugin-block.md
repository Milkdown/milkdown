# @milkdown/plugin-block

Block plugin for [milkdown](https://milkdown.dev/) to add a handler for every block.

## Usage

#### Create Block View

Create block view is simple.
All you need to do is to implement the [Prosemirror Plugin.view](https://prosemirror.net/docs/ref/#state.PluginSpec.view).

```typescript
import { BlockProvider } from "@milkdown/kit/plugin/block";

function createBlockPluginView(ctx) {
  return (view) => {
    const content = document.createElement("div");

    const provider = new BlockProvider({
      ctx,
      content: this.content,
    });

    return {
      update: (updatedView, prevState) => {
        provider.update(updatedView, prevState);
      },
      destroy: () => {
        provider.destroy();
        content.remove();
      },
    };
  };
}
```

#### Bind Block View

You need to bind the block view to the plugin in `editor.config`.

```typescript
import { Editor } from "@milkdown/core";
import { block } from "@milkdown/plugin-block";

Editor.make()
  .config((ctx) => {
    ctx.set(block.key, {
      view: blockPluginView(ctx),
    });
  })
  .use(block)
  .create();
```

@block

## Use with React

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Milkdown/examples/tree/main/react-block)

## Use with Vue

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Milkdown/examples/tree/main/vue-block)

## API

@BlockProvider
@BlockProviderOptions

@blockPlugin
@blockSpec

@blockConfig

@ActiveNode
@DeriveContext
