import React from 'react';
import { createPortal } from 'react-dom';

import { NodeViewFactory, Editor } from '@milkdown/core';
import { Node } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';

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
});

const Content: React.FC<{ dom: HTMLElement | null }> = ({ dom }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const { current } = containerRef;
        if (!current || !dom) return;

        current.appendChild(dom);
    }, [dom]);

    return React.useMemo(() => <div ref={containerRef} />, []);
};

const NodeContainer: React.FC<NodeContext> = ({ editor, node, view, getPos, decorations, children }) => {
    return <nodeContext.Provider value={{ editor, node, view, getPos, decorations }}>{children}</nodeContext.Provider>;
};

const Portals: React.FC<{ portals: React.ReactPortal[] }> = React.memo(
    ({ portals }) => {
        return <>{...portals}</>;
    },
    (prev, next) => {
        const getId = (portals: React.ReactPortal[]) => portals.map((x) => x.key).join(',');
        return getId(prev.portals) === getId(next.portals);
    },
);

class ReactNodeView implements NodeView {
    dom: HTMLElement;
    contentDOM: HTMLElement;
    key: string;

    constructor(
        private component: React.FC,
        private setPortal: React.Dispatch<React.SetStateAction<React.ReactPortal[]>>,
        // private node: Node,
        private editor: Editor,
        private node: Node,
        private view: EditorView,
        private getPos: boolean | (() => number),
        private decorations: Decoration[],
    ) {
        const dom = document.createElement('div');

        const contentDOM = node.isLeaf ? null : document.createElement(node.isInline ? 'span' : 'div');
        if (contentDOM) {
            dom.appendChild(contentDOM);
        }
        this.dom = dom;
        this.contentDOM = contentDOM;
        this.key = Math.random().toString();

        this.renderPortal();
    }

    renderPortal() {
        const Component = this.component;
        Component.displayName = this.node.type.name;
        const portal = createPortal(
            <NodeContainer
                editor={this.editor}
                node={this.node}
                view={this.view}
                getPos={this.getPos}
                decorations={this.decorations}
            >
                <Component>
                    <Content dom={this.contentDOM} />
                </Component>
            </NodeContainer>,
            this.dom,
            this.key,
        );
        this.setPortal((x) => [...x, portal]);
    }

    destroy() {
        this.dom = undefined;
        this.contentDOM = undefined;
        this.setPortal((x) => {
            const prev = x.findIndex((p) => p.key === this.key);

            return [...x.slice(0, prev), ...x.slice(prev + 1)];
        });
    }
}

// const nodeContext = React.createContext<NodeContext>({
//     editor: undefined,
//     node: undefined,
//     view: undefined,
//     getPos: undefined,
//     decorations: undefined,
// });

const reactView =
    (setPortal: React.Dispatch<React.SetStateAction<React.ReactPortal[]>>) =>
    (component: React.FC): NodeViewFactory =>
    (editor, _type, node, view, getPos, decorations) =>
        new ReactNodeView(component, setPortal, editor, node, view, getPos, decorations);

const portalContext = React.createContext<(Component: React.FC) => NodeViewFactory>(() => {
    return (() => null) as unknown as NodeViewFactory;
});

type GetEditor = (container: HTMLDivElement, renderReact: (Component: React.FC) => NodeViewFactory) => Editor;

const useEditor = (getEditor: GetEditor) => {
    const renderReact = React.useContext(portalContext);
    const div = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        getEditor(div.current, renderReact).create();
    }, [getEditor, renderReact]);

    return div;
};

export const EditorComponent: React.FC<{ editor: GetEditor }> = ({ editor }) => {
    const ref = useEditor(editor);
    return <div ref={ref} />;
};

export const ReactEditor: React.FC<{ editor: GetEditor }> = ({ editor }) => {
    const [portal, setPortal] = React.useState<React.ReactPortal[]>([]);
    const renderReact = React.useCallback((Component: React.FC) => reactView(setPortal)(Component), []);

    return (
        <portalContext.Provider value={renderReact}>
            <Portals portals={portal} />
            <EditorComponent editor={editor} />
        </portalContext.Provider>
    );
};

export const useGetEditor = (getEditor: GetEditor) => {
    return React.useCallback<GetEditor>((...args) => getEditor(...args), []);
};

export const useNodeCtx = () => React.useContext(nodeContext);
