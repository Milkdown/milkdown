/* Copyright 2021, Milkdown by Mirone. */
import { editorViewCtx, rootCtx } from '@milkdown/core';
import { createContext, useCallback, useContext, useRef } from 'react';

import { portalContext } from './Portals';
import { EditorInfoCtx, GetEditor } from './types';

export const editorInfoContext = createContext<EditorInfoCtx>({} as EditorInfoCtx);

export const useGetEditor = (getEditor: GetEditor) => {
    const renderReact = useContext(portalContext);
    const { dom, editor: editorRef, setLoading } = useContext(editorInfoContext);
    const lockRef = useRef<boolean>(false);

    const lock = useCallback(() => {
        setLoading(true);
        lockRef.current = true;
    }, [setLoading]);

    const unLock = useCallback(() => {
        setLoading(false);
        lockRef.current = false;
    }, [setLoading]);

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

            if (lockRef.current) return;

            lock();

            editor
                .create()
                .then((editor) => {
                    editorRef.current = editor;
                    return;
                })
                .finally(() => {
                    unLock();
                })
                .catch(console.error);
        },
        [dom, editorRef, getEditor, lock, renderReact, unLock],
    );

    return domRef;
};
