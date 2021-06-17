import React from 'react';

import { Editor } from '@milkdown/core';
import { Node } from 'prosemirror-model';
import { Decoration, EditorView } from 'prosemirror-view';

type NodeContext = {
    editor: Editor;
    node: Node;
    view: EditorView;
    getPos: boolean | (() => number);
    decorations: Decoration[];
};

const nodeContext = React.createContext<NodeContext>({
    editor: undefined,
    node: undefined,
    view: undefined,
    getPos: undefined,
    decorations: undefined,
} as unknown as NodeContext);

export const ReactNodeContainer: React.FC<NodeContext> = ({ editor, node, view, getPos, decorations, children }) => {
    return <nodeContext.Provider value={{ editor, node, view, getPos, decorations }}>{children}</nodeContext.Provider>;
};

export const useNodeCtx = () => React.useContext(nodeContext);

export const Content: React.FC<{ dom?: HTMLElement | null }> = ({ dom }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const { current } = containerRef;
        if (!current || !dom) return;

        current.appendChild(dom);
    }, [dom]);

    return <div ref={containerRef} />;
};
