/* Copyright 2021, Milkdown by Mirone. */
import { editorViewCtx, parserCtx } from '@milkdown/core';
import { themeManagerCtx } from '@milkdown/design-system';
import { Slice } from '@milkdown/prose';
import { EditorRef, ReactEditor, useEditor } from '@milkdown/react';
import { nord } from '@milkdown/theme-nord';
import { tokyo } from '@milkdown/theme-tokyo';
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

let isNord = true;
export type MilkdownRef = { update: (markdown: string) => void };
export const MilkdownEditor = forwardRef<MilkdownRef, Props>(({ content, readOnly, onChange }, ref) => {
    const editorRef = React.useRef<EditorRef>(null);
    const [editorReady, setEditorReady] = React.useState(false);
    const isDarkMode = React.useContext(isDarkModeCtx);

    const [loading, md] = useLazy(content);

    React.useImperativeHandle(ref, () => ({
        update: (markdown: string) => {
            if (!editorReady || !editorRef.current) return;
            const editor = editorRef.current.get();
            if (!editor) return;
            editor.action((ctx) => {
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
        (window as any).switchTheme = () => {
            if (!editorReady || !editorRef.current) return;
            const editor = editorRef.current.get();
            if (!editor) return;
            editor.action((ctx) => {
                const themeManager = ctx.get(themeManagerCtx);
                themeManager.switch(ctx, isNord ? tokyo : nord);
                isNord = !isNord;
            });
        };
    }, [editorReady]);

    const editor = useEditor(
        (root) => createEditor(root, md, readOnly, setEditorReady, isDarkMode, onChange),
        [readOnly, md, onChange, isDarkMode],
    );

    return (
        <div className={className['editor']}>
            {loading ? <Loading /> : <ReactEditor ref={editorRef} editor={editor} />}
        </div>
    );
});
