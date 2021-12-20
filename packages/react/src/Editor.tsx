/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, Editor, editorViewCtx, rootCtx } from '@milkdown/core';
import { ViewFactory } from '@milkdown/prose';
import React, { DependencyList, forwardRef, useImperativeHandle } from 'react';

import { portalContext, Portals } from './Portals';
import { createReactView } from './ReactNodeView';

type GetEditor = (
    container: HTMLDivElement,
    renderReact: (Component: React.FC) => (ctx: Ctx) => ViewFactory,
) => Editor | undefined;

const useGetEditor = (getEditor: GetEditor) => {
    const renderReact = React.useContext(portalContext);
    const divRef = React.useRef<HTMLDivElement>(null);
    const editorRef = React.useRef<Editor>();

    React.useEffect(() => {
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
    editor: GetEditor;
};
export type EditorRef = {
    get: () => Editor | undefined;
    dom: () => HTMLDivElement | null;
};
export const EditorComponent = forwardRef<EditorRef, EditorProps>(({ editor }, ref) => {
    const refs = useGetEditor(editor);
    useImperativeHandle(ref, () => ({
        get: () => {
            return refs.editorRef.current;
        },
        dom: () => {
            return refs.divRef.current;
        },
    }));
    return <div ref={refs.divRef} />;
});

export const ReactEditor = forwardRef<EditorRef, EditorProps>(({ editor }, ref) => {
    const [portals, setPortals] = React.useState<React.ReactPortal[]>([]);
    const addPortal = React.useCallback((portal: React.ReactPortal) => {
        setPortals((ps) => [...ps, portal]);
    }, []);
    const removePortalByKey = React.useCallback((key: string) => {
        setPortals((x) => {
            const index = x.findIndex((p) => p.key === key);

            return [...x.slice(0, index), ...x.slice(index + 1)];
        });
    }, []);
    const renderReact = React.useCallback(
        (Component: React.FC) => createReactView(addPortal, removePortalByKey)(Component),
        [addPortal, removePortalByKey],
    );

    return (
        <portalContext.Provider value={renderReact}>
            <Portals portals={portals} />
            <EditorComponent ref={ref} editor={editor} />
        </portalContext.Provider>
    );
});

export const useEditor = (getEditor: GetEditor, deps: DependencyList = []) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return React.useCallback<GetEditor>((...args) => getEditor(...args), deps);
};
