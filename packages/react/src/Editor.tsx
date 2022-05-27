/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, Editor, editorViewCtx, rootCtx } from '@milkdown/core';
import { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view';
import { forwardRef, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { EditorComponent } from './EditorComponent';
import { portalContext, Portals } from './Portals';
import { createReactView, RenderOptions } from './ReactNodeView';
import { EditorInfo, EditorInfoCtx, EditorRef } from './types';
import { editorInfoContext } from './useGetEditor';

type GetEditor = (
    container: HTMLDivElement,
    renderReact: (
        Component: React.FC,
        renderOptions?: RenderOptions,
    ) => (ctx: Ctx) => NodeViewConstructor | MarkViewConstructor,
) => Editor | undefined;

const useGetEditor = (getEditor: GetEditor) => {
    const renderReact = useContext(portalContext);
    const divRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<Editor>();

    useEffect(() => {
        const div = divRef.current;
        if (!div) return;

        const editor = getEditor(div, renderReact);

        if (!editor) return;

        editor
            .create()
            .then((editor) => {
                editorRef.current = editor;
                return;
            })
            .catch(console.error);

        return () => {
            const view = editorRef.current?.action((ctx) => ctx.get(editorViewCtx));
            const root = editorRef.current?.action((ctx) => ctx.get(rootCtx)) as HTMLElement;

            root?.firstChild?.remove();
            view?.destroy();
        };
    }, [getEditor, renderReact]);

    return { divRef, editorRef };
};

type EditorProps = {
    editor: EditorInfo;
};

export const ReactEditor = forwardRef<EditorRef, EditorProps>(({ editor: editorInfo }, ref) => {
    const [portals, setPortals] = useState<React.ReactPortal[]>([]);
    const addPortal = useCallback((portal: React.ReactPortal) => {
        setPortals((ps) => [...ps, portal]);
    }, []);
    const removePortalByKey = useCallback((key: string) => {
        setPortals((x) => {
            const index = x.findIndex((p) => p.key === key);

            return [...x.slice(0, index), ...x.slice(index + 1)];
        });
    }, []);
    const renderReact = useCallback(
        (Component: React.FC<{ children: ReactNode }>, options?: RenderOptions) =>
            createReactView(addPortal, removePortalByKey)(Component, options),
        [addPortal, removePortalByKey],
    );

    const { getEditorCallback, dom, editor, setLoading } = editorInfo;
    const ctx = useMemo<EditorInfoCtx>(() => {
        return {
            dom,
            editor,
            setLoading,
        };
    }, [dom, editor, setLoading]);

    return (
        <editorInfoContext.Provider value={ctx}>
            <portalContext.Provider value={renderReact}>
                <Portals portals={portals} />
                <EditorComponent ref={ref} editor={getEditorCallback} />
            </portalContext.Provider>
        </editorInfoContext.Provider>
    );
});
