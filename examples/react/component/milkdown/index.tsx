/* Copyright 2021, Milkdown by Mirone. */

import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { tooltip } from '@milkdown/plugin-tooltip';
import { blockquote, commonmark, image, paragraph } from '@milkdown/preset-commonmark';
import { EditorRef, ReactEditor, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import React from 'react';

import { Blockquote } from './Blockquote';
import { Image } from './Image';
import { Paragraph } from './Paragraph';

export const Milkdown: React.FC<{ value: string }> = ({ value }) => {
    const ref = React.useRef({} as EditorRef);
    const { editor } = useEditor((root, renderReact) => {
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
            .use(tooltip);
    });

    return <ReactEditor ref={ref} editor={editor} />;
};
