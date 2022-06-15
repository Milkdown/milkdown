/* Copyright 2021, Milkdown by Mirone. */

import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { prism } from '@milkdown/plugin-prism';
import { tooltip } from '@milkdown/plugin-tooltip';
import { blockquote, commonmark, image, paragraph } from '@milkdown/preset-commonmark';
import { ReactEditor, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import { FC, useEffect } from 'react';

import { Blockquote } from './Blockquote';
import { Image } from './Image';
import { Paragraph } from './Paragraph';

export const Milkdown: FC<{ value: string }> = ({ value }) => {
    const { editor, loading, getInstance } = useEditor((root, renderReact) => {
        const nodes = commonmark
            .configure(paragraph, { view: renderReact(Paragraph) })
            .configure(blockquote, { view: renderReact(Blockquote, { as: 'section' }) })
            .configure(image, { view: renderReact(Image) });
        return Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, value);
            })
            .use(nord)
            .use(nodes)
            .use(tooltip)
            .use(prism);
    });

    useEffect(() => {
        if (!loading) {
            const instance = getInstance();
            instance?.action((ctx) => {
                ctx;
                // do something
            });
        }
    }, [getInstance, loading]);

    return <ReactEditor editor={editor} />;
};
