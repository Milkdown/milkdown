import { Editor, rootCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import '@milkdown/plugin-cursor/lib/style.css';
import { history } from '@milkdown/plugin-history';
import { listener } from '@milkdown/plugin-listener';
import { math } from '@milkdown/plugin-math';
import '@milkdown/plugin-math/lib/style.css';
import { prism } from '@milkdown/plugin-prism';
import { slash } from '@milkdown/plugin-slash';
import '@milkdown/plugin-slash/lib/style.css';
import '@milkdown/plugin-table/lib/style.css';
import { tooltip } from '@milkdown/plugin-tooltip';
import '@milkdown/plugin-tooltip/lib/style.css';
import { gfm } from '@milkdown/preset-gfm';
import '@milkdown/preset-gfm/lib/style.css';
import '@milkdown/theme-nord/lib/theme.css';

const main = async () => {
    const editor = new Editor()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('app') as Node);
        })
        .use(clipboard)
        .use(gfm)
        .use(listener)
        .use(history)
        .use(cursor())
        .use(prism)
        .use(tooltip)
        .use(math)
        .use(slash);
    await editor.create();
};

main();
