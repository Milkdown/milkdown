/* Copyright 2021, Milkdown by Mirone. */
import { test as base } from '@playwright/test';

const paragraph = `
The lunatic is on the grass
`;

const heading = `
# Heading1

## Heading2
`;

const quote = `
> Blockquote.
> First line.
>
> Next line.
`;

const bulletList = `
* list item 1
  * sub list item 1
  * sub list item 2
* list item 2

  list content for item 2
* list item 3
`;

const orderedList = `
1. list item 1
    1. sub list item 1
    2. sub list item 2
2. list item 2

    list content for item 2
3. list item 3
`;

const hr = `
***
`;

const image = `
![image](url "title")
`;

const codeFence = `
\`\`\` javascript
const one = 1
\`\`\`
`;

const bold = `
Here is **bold test**!
`;

const em = `
Here is *em test*!
`;

const inlineCode = `
Here is \`inline code test\`!
`;

const link = `
Here is [link test](url)!
`;

const fixtures = {
    paragraph,
    heading,
    quote,
    bulletList,
    orderedList,
    hr,
    image,
    codeFence,
    bold,
    em,
    inlineCode,
    link,
};

type FKey = keyof typeof fixtures;

export const test = base.extend<{
    setFixture: (key: FKey) => Promise<void>;
}>({
    setFixture: async ({ page }, use) => {
        const setMarkdown = (key: FKey) =>
            page.evaluate(
                ({ fixtures, key }) => {
                    window.__setMarkdown__(fixtures[key]);
                },
                { fixtures, key },
            );
        await use(setMarkdown);
    },
});
