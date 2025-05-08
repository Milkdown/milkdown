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
import { SlashProvider } from "@milkdown/kit/plugin/slash";

function slashPluginView(view) {
  const content = document.createElement("div");

  const provider = new SlashProvider({
    content,
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
}
```

#### Bind Slash View

You need to bind the slash view to the plugin in `editor.config`.

```typescript
import { Editor } from "@milkdown/core";
import { slashFactory } from "@milkdown/plugin-slash";

const slash = slashFactory("my-slash");

Editor.make()
  .config((ctx) => {
    ctx.set(slash.key, {
      view: slashPluginView,
    });
  })
  .use(slash)
  .create();
```

## Use with React

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Milkdown/examples/tree/main/react-slash)

## Use with Vue

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Milkdown/examples/tree/main/vue-slash)

## API

@slashFactory

@SlashProvider
@SlashProviderOptions
