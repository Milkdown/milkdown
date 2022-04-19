/* Copyright 2021, Milkdown by Mirone. */
import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import { prism } from '@milkdown/plugin-prism';
import { gfm } from '@milkdown/preset-gfm';
import { EditorRef, ReactEditor, useEditor } from '@milkdown/react';
import { nord, nordDark, nordLight } from '@milkdown/theme-nord';
import { switchTheme } from '@milkdown/utils';
import React from 'react';

import { isDarkModeCtx } from '../Context';
import { codeSandBox } from './codeSandBox';
import { Loading } from './Loading';
import className from './style.module.css';
import { Content, useLazy } from './useLazy';

type Props = {
    content: Content;
};

export const DocRenderer = ({ content }: Props) => {
    const editorRef = React.useRef<EditorRef>(null);
    const isDarkMode = React.useContext(isDarkModeCtx);

    const [loading, md] = useLazy(content);

    const editor = useEditor(
        (root) => {
            const editor = Editor.make()
                .config((ctx) => {
                    ctx.set(rootCtx, root);
                    ctx.set(defaultValueCtx, md);
                    ctx.update(editorViewOptionsCtx, (prev) => ({ ...prev, editable: () => false }));
                })
                .use(gfm)
                .use(codeSandBox)
                .use(prism)
                .use(nord);

            return editor;
        },
        [md],
    );

    React.useEffect(() => {
        if (!editorRef.current) return;
        const editor = editorRef.current.get();
        editor?.action(switchTheme(isDarkMode ? nordDark : nordLight));
    }, [isDarkMode]);

    return (
        <div className={className['editor']}>
            {loading ? <Loading /> : <ReactEditor ref={editorRef} editor={editor} />}
        </div>
    );
};
