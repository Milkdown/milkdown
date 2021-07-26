import { createApp, h } from 'vue';
import { MyEditor } from './VueEditor';

import '@milkdown/theme-nord/lib/theme.css';

import './style.css';

const markdown = `
# Milkdown Test

## Blockquote

> Milkdown is an editor.

## Marks Paragraph

Hello, ***milkdown* nice \`to\` meet *you***!  
There should be a line break before this.

---

## Image and Link

**Of course you can add image! ![cat](https://images.news18.com/ibnlive/uploads/2021/06/1623900306_untitled-design-2021-06-17t085747.057.png "kitty")**

Your *[link is here](https://bing.com "bing")*, have a look.

## Lists

* list item 1
    1. is this the real life
    2. is this just fantasy
* list item 2
    * sub list item 1

        some explain

    * sub list item 2
* list item 3

## Code

\`\`\`javascript
const milkdown = new Milkdown();
milkdown.create();
\`\`\`

---

Now you can play!
`;

const app = createApp({
    render() {
        return <MyEditor markdown={markdown} />;
    },
});
app.mount('#app');
