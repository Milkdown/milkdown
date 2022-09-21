/* Copyright 2021, Milkdown by Mirone. */
import { createContext, useContext, useLayoutEffect, useRef } from 'react';

import { portalContext } from './Portals';
import { EditorInfoCtx, GetEditor } from './types';

export const editorInfoContext = createContext<EditorInfoCtx>({} as EditorInfoCtx);

export const useGetEditor = (getEditor: GetEditor) => {
    const renderReact = useContext(portalContext);
    const { dom, editor: editorRef, setLoading } = useContext(editorInfoContext);
    const domRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const div = domRef.current;
        if (!div) return;
        dom.current = div;

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

        return () => {
            editor.destroy();
        };
    }, [dom, editorRef, getEditor, renderReact, setLoading]);

    return domRef;
};
