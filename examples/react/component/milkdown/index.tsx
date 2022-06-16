/* Copyright 2021, Milkdown by Mirone. */

import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { prism } from '@milkdown/plugin-prism';
import { tooltip } from '@milkdown/plugin-tooltip';
import { codeFence as cmCodeFence, commonmark, image } from '@milkdown/preset-commonmark';
import { Node } from '@milkdown/prose/model';
import { ReactEditor, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import { FC, useEffect } from 'react';

import { CodeFence } from './CodeFence';
import { codeFence } from './CodeFence/codeFence.node';
import { Image } from './Image';

export const Milkdown: FC<{ value: string }> = ({ value }) => {
    const { editor, loading, getInstance } = useEditor((root, renderReact) => {
        const nodes = commonmark
            .configure(image, { view: renderReact(Image) })
            .replace(cmCodeFence, codeFence(renderReact<Node>(CodeFence, { as: 'section' }))());
        return Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, value);
                ctx.get(listenerCtx).markdownUpdated((_, value) => {
                    value;
                    // console.log(value);
                });
            })
            .use(nord)
            .use(nodes)
            .use(tooltip)
            .use(prism)
            .use(listener);
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
