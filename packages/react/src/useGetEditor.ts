/* Copyright 2021, Milkdown by Mirone. */
import { createContext, useCallback, useContext, useEffect } from 'react';

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

    useEffect(() => {
        return () => {
            editorRef.current?.destroy();
        };
    }, [editorRef]);

    return domRef;
};
