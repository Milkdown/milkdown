# @milkdown/preset-commonmark

The commonmark preset of [milkdown](https://milkdown.dev/).

# Official Documentation

Documentation can be found on the [Milkdown website](https://milkdown.dev/preset-commonmark).

```typescript
import { paragraph, nodes } from '@milkdown/preset-gfm';

const markdownNode = nodes.configure(paragraph, { keepEmptyLine: true }); // to keep or drop  emptyLine
editor = Editor.make().use(markdownNode);
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
