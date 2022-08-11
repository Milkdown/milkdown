/* Copyright 2021, Milkdown by Mirone. */
import { editorViewCtx, rootCtx } from '@milkdown/core';
import { createContext, useCallback, useContext } from 'react';

import { portalContext } from './Portals';
import { EditorInfoCtx, GetEditor } from './types';

export const editorInfoContext = createContext<EditorInfoCtx>({} as EditorInfoCtx);

export const useGetEditor = (getEditor: GetEditor) => {
    const renderReact = useContext(portalContext);
    const { dom, editor: editorRef, setLoading } = useContext(editorInfoContext);

    const domRef = useCallback(
        (div: HTMLDivElement) => {
            if (!div) return;
            dom.current = div;

            if (div.querySelector('.milkdown') != null) {
                const view = editorRef.current?.action((ctx) => ctx.get(editorViewCtx));
                const root = editorRef.current?.action((ctx) => ctx.get(rootCtx)) as HTMLElement;

                root?.firstChild?.remove();
                view?.destroy();
            }

            const editor = getEditor(div, renderReact);
            if (!editor) return;

            setLoading(true);

            editor
                .create()
                .then((editor) => {
                    editorRef.current = editor;
                    return;
                })
                .finally(() => {
                    setLoading(false);
                })
                .catch(console.error);
        },
        [dom, editorRef, getEditor, renderReact, setLoading],
    );

    return domRef;
};
