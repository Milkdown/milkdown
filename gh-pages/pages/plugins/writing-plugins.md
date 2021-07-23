# Writing Plugins

Instead of using provided utils to create plugin, you can also write plugin yourself.
You will get more access to the plugin detail in this way. And this could help you to write yourself a powerful plugin.

## Structure Overview

Generally, a plugin will have following structure:

```typescript
import { MilkdownPlugin } from '@milkdown/core';

const myPlugin: MilkdownPlugin = (pre) => {
    // #1 prepare plugin
    return async (ctx) => {
        // #2 run plugin
    };
};
```

Each plugin has two parts:

1. _Prepare_: this part will be executed when plugin is registered in milkdown by `.use` method.
2. _Run_: this part will be executed when plugin is actually loaded.

## WIP
