import React from 'react';

import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';

import { clipboard } from '@milkdown/plugin-clipboard';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { prism } from '@milkdown/plugin-prism';

import { emoji } from '@milkdown/plugin-emoji';
import '@milkdown/plugin-emoji/lib/style.css';

import { cursor } from '@milkdown/plugin-cursor';
import '@milkdown/plugin-cursor/lib/style.css';

import { math } from '@milkdown/plugin-math';
import '@milkdown/plugin-math/lib/style.css';

import { slash } from '@milkdown/plugin-slash';
import '@milkdown/plugin-slash/lib/style.css';

import { tooltip } from '@milkdown/plugin-tooltip';
import '@milkdown/plugin-tooltip/lib/style.css';

import { gfm } from '@milkdown/preset-gfm';
import '@milkdown/preset-gfm/lib/style.css';

import { ReactEditor, useEditor } from '@milkdown/react';

import className from './style.module.css';

type Props = {
    content: string;
    readOnly?: boolean;
    onChange?: (getMarkdown: () => string) => void;
};

export const MilkdownEditor: React.FC<Props> = ({ content, readOnly, onChange }) => {
    const editor = useEditor(
        (root) => {
            const editor = new Editor()
                .config((ctx) => {
                    ctx.set(rootCtx, root);
                    ctx.set(defaultValueCtx, content);
                    ctx.set(editorViewOptionsCtx, { editable: () => !readOnly });
                    ctx.set(listenerCtx, { markdown: onChange ? [onChange] : [] });
                })
                .use(clipboard)
                .use(gfm)
                .use(listener)
                .use(history)
                .use(cursor())
                .use(prism)
                .use(emoji)
                .use(tooltip)
                .use(math);

            if (!readOnly) {
                editor.use(slash);
            }
            return editor;
        },
        [readOnly, content],
    );

    return (
        <div className={className.editor}>
            <ReactEditor editor={editor} />
        </div>
    );
};
