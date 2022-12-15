# Example: Iframe Plugin

Generally, if we want to add a custom syntax plugin, there are 5 things need to be done:

1. Add a remark plugin to make sure the syntax can be parsed and serialized correctly.
2. Define the prosemirror schema for your custom node.
3. Write a parser specification to transform the remark AST into prosemirror node.
4. Write a serializer specification to transform the prosemirror node into remark AST.
5. Write prosemirror input rules to make sure user input can be handled correctly.

---

In this section, we will add a **custom iframe syntax** to insert iframe as node in milkdown.

## Remark Plugin

First, we need a remark plugin to support our custom syntax.
Luckily, remark provides a powerful [remark directive plugin](https://github.com/remarkjs/remark-directive) to support custom syntax. With this plugin, we can easily define a iframe using following text:

```markdown
# My Iframe

:iframe{src="https://saul-mirone.github.io"}
```

## Define Schema

Next, we need to define the schema of an iframe node.
Our iframe should be an inline node because it doesn't have any children,
and it will have a `src` attribute to connect to the source.

```typescript
import { createNode } from '@milkdown/utils';

const id = 'iframe';
const iframe = createNode(() => ({
    id,
    schema: () => ({
        inline: true,
        attrs: {
            src: { default: null },
        },
        group: 'inline',
        marks: '',
        parseDOM: [
            {
                tag: 'iframe',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) {
                        throw new Error();
                    }
                    return {
                        src: dom.getAttribute('src'),
                    };
                },
            },
        ],
        toDOM: (node) => ['iframe', { ...node.attrs, class: 'iframe' }, 0],
    }),
}));
```

## Connect to plugin(s)

Now that we have our basic node defined, we need to specify which remark plugins
it requires to work;

```typescript
import { RemarkPlugin } from '@milkdown/core';
import directive from 'remark-directive';

const iframe = createNode(() => ({
    // ...
    remarkPlugins: () => [directive as RemarkPlugin],
}));
```

## Parser

Then, we need to add a parser specification to transform our markdown
(in the form of remark AST) to a prosemirror node.
You can use an inspect tool to find out the remark AST structure,
but in this case the iframe node has the following structure:

```typescript
const AST = {
    name: 'iframe',
    attributes: { src: 'https://saul-mirone.github.io' },
    type: 'textDirective',
};
```

So we can easily write our parser specification for it:

```typescript
schema: () => ({
    // ...
    parseMarkdown: {
        match: (node) => node.type === 'textDirective' && node.name === 'iframe',
        runner: (state, node, type) => {
            state.addNode(type, { src: (node.attributes as { src: string }).src });
        },
    },
}),
```

Now, text in `defaultValue` can be parsed to iframe elements correctly.

## Serializer

Then, we need to add a serializer specification to transform the prosemirror node back to remark AST:

```typescript
schema: () => ({
    // ...
    toMarkdown: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.addNode('textDirective', undefined, undefined, {
                name: 'iframe',
                attributes: {
                    src: node.attrs.src,
                },
            });
        },
    }
},
```

Now, iframe elements can be serialized into string correctly.

## Input Rule

For user input texts that should be transformed into iframe, we also should make it work.
We can use `inputRules` to define [prosemirror input rules](https://prosemirror.net/docs/ref/#inputrules) to implement this:

```typescript
import { InputRule } from 'prosemirror-inputrules';

const iframe = createNode(() => ({
    // ...
    inputRules: (nodeType) => [
        new InputRule(/:iframe\{src\="(?<src>[^"]+)?"?\}/, (state, match, start, end) => {
            const [okay, src = ''] = match;
            const { tr } = state;
            if (okay) {
                tr.replaceWith(start, end, nodeType.create({ src }));
            }

            return tr;
        }),
    ],
}));
```

## Use Plugins

Finally, we need to add our new node type to the other nodes in the `AtomList`.
We can then just `use` the plugin like we normally would:

```typescript
import { Editor } from '@milkdown/core';
import { AtomList, createNode } from "@milkdown/utils";
import { commonmark } from '@milkdown/preset-commonmark';

const iframe = createNode(() => ({ /* ... */ });

const iframePlugin = AtomList.create([iframe()]);

Editor.make().use(iframePlugin).use(commonmark).create();
```

---

## Full Code

!CodeSandBox{milkdown-custom-syntax-mudgd}
