import React, { DependencyList } from 'react';
import { Editor, NodeViewFactory } from '@milkdown/core';
import { portalContext, Portals } from './Portals';
import { createReactView } from './ReactNodeView';

type GetEditor = (container: HTMLDivElement, renderReact: (Component: React.FC) => NodeViewFactory) => Editor;

const useEditor = (getEditor: GetEditor) => {
    const renderReact = React.useContext(portalContext);
    const div = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!div.current) return;

        const editor = getEditor(div.current, renderReact);

        editor.create();

        return () => {
            editor.view.destroy();
        };
    }, [getEditor, renderReact]);

    return div;
};

export const EditorComponent: React.FC<{ editor: GetEditor }> = ({ editor }) => {
    const ref = useEditor(editor);
    return <div ref={ref} />;
};

export const ReactEditor: React.FC<{ editor: GetEditor }> = ({ editor }) => {
    const [portals, setPortals] = React.useState<React.ReactPortal[]>([]);
    const addPortal = React.useCallback((portal: React.ReactPortal) => {
        setPortals((ps) => [...ps, portal]);
    }, []);
    const removePortalByKey = React.useCallback((key: string) => {
        setPortals((x) => {
            const prev = x.findIndex((p) => p.key === key);

            return [...x.slice(0, prev), ...x.slice(prev + 1)];
        });
    }, []);
    const renderReact = React.useCallback(
        (Component: React.FC) => createReactView(addPortal, removePortalByKey)(Component),
        [addPortal, removePortalByKey],
    );

    return (
        <portalContext.Provider value={renderReact}>
            <Portals portals={portals} />
            <EditorComponent editor={editor} />
        </portalContext.Provider>
    );
};

export const useGetEditor = (getEditor: GetEditor, deps: DependencyList = []) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return React.useCallback<GetEditor>((...args) => getEditor(...args), deps);
};
