# Prose

[Prosemirror](https://prosemirror.net/)需要它的核心模块的版本保持一致。

所以[@milkdown/prose](https://www.npmjs.com/package/@milkdown/prose)这个包用来将它的核心模块打包在一起。

包括的模块有：

-   [prosemirror-model](https://www.npmjs.com/package/prosemirror-model)
-   [prosemirror-state](https://www.npmjs.com/package/prosemirror-state)
-   [prosemirror-view](https://www.npmjs.com/package/prosemirror-view)
-   [prosemirror-transform](https://www.npmjs.com/package/prosemirror-transform)
-   [prosemirror-commands](https://www.npmjs.com/package/prosemirror-commands)
-   [prosemirror-inputrules](https://www.npmjs.com/package/prosemirror-inputrules)
-   [prosemirror-keymap](https://www.npmjs.com/package/prosemirror-keymap)

用户可以通过`@milkdown/prose`来访问它们的 API，例如：

```typescript
import { EditorState, Node, Mark, Selection } from '@milkdown/prose';
```
