# @milkdown/prose

[Prosemirror](https://prosemirror.net/) needs its core packages to be the same version.

So [@milkdown/prose](https://www.npmjs.com/package/@milkdown/prose) package is provided to combine core packages of milkdown.

Combined packages:

-   [prosemirror-model](https://www.npmjs.com/package/prosemirror-model)
-   [prosemirror-state](https://www.npmjs.com/package/prosemirror-state)
-   [prosemirror-view](https://www.npmjs.com/package/prosemirror-view)
-   [prosemirror-transform](https://www.npmjs.com/package/prosemirror-transform)
-   [prosemirror-commands](https://www.npmjs.com/package/prosemirror-commands)
-   [prosemirror-inputrules](https://www.npmjs.com/package/prosemirror-inputrules)
-   [prosemirror-keymap](https://www.npmjs.com/package/prosemirror-keymap)

Users can access their API through `@milkdown/prose/<package-name>`, for example:

```typescript
import { EditorState, Selection } from '@milkdown/prose/state';
import { Node, Mark } from '@milkdown/prose/model';
```
