/* Copyright 2021, Milkdown by Mirone. */
import { editorViewCtx, parserCtx } from '@milkdown/core';
import { Slice } from '@milkdown/prose/model';
import { ReactEditor, useEditor } from '@milkdown/react';
import { nordDark, nordLight } from '@milkdown/theme-nord';
import { switchTheme } from '@milkdown/utils';
import React, { forwardRef } from 'react';

import { isDarkModeCtx } from '../Context';
import { createEditor } from './editor';
import { Loading } from './Loading';
import className from './style.module.css';
import { Content, useLazy } from './useLazy';

type Props = {
    content: Content;
    readOnly?: boolean;
    onChange?: (markdown: string) => void;
};

export type MilkdownRef = { update: (markdown: string) => void };
export const MilkdownEditor = forwardRef<MilkdownRef, Props>(({ content, readOnly, onChange }, ref) => {
    const [editorReady, setEditorReady] = React.useState(false);
    const isDarkMode = React.useContext(isDarkModeCtx);

    const [loading, md] = useLazy(content);

    const {
        editor,
        getInstance,
        loading: editorLoading,
    } = useEditor((root) => createEditor(root, md, readOnly, setEditorReady, onChange), [readOnly, md, onChange]);

    React.useImperativeHandle(ref, () => ({
        update: (markdown: string) => {
            if (!editorReady || editorLoading) return;
            const editor = getInstance();
            editor?.action((ctx) => {
                const view = ctx.get(editorViewCtx);
                const parser = ctx.get(parserCtx);
                const doc = parser(markdown);
                if (!doc) return;
                const state = view.state;
                view.dispatch(state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)));
            });
        },
    }));

    React.useEffect(() => {
        if (!editorReady || editorLoading) return;
        const editor = getInstance();
        if (!editor) return;
        editor.action(switchTheme(isDarkMode ? nordDark : nordLight));
    }, [editorLoading, editorReady, getInstance, isDarkMode]);

    return <div className={className['editor']}>{loading ? <Loading /> : <ReactEditor editor={editor} />}</div>;
});
