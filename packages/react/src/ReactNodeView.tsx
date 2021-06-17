import type { Editor, NodeViewFactory } from '@milkdown/core';
import type { Node } from 'prosemirror-model';
import type { Decoration, EditorView, NodeView } from 'prosemirror-view';
import React from 'react';
import { createPortal } from 'react-dom';
import { Content, ReactNodeContainer } from './ReactNode';
import { getId } from './utils';

export const createReactView =
    (setPortals: React.Dispatch<React.SetStateAction<React.ReactPortal[]>>) =>
    (component: React.FC): NodeViewFactory =>
    (editor, _type, node, view, getPos, decorations) =>
        new ReactNodeView(component, setPortals, editor, node, view, getPos, decorations);

export class ReactNodeView implements NodeView {
    dom: HTMLElement | undefined;
    contentDOM: HTMLElement | null | undefined;
    key: string;

    constructor(
        private component: React.FC,
        private setPortal: React.Dispatch<React.SetStateAction<React.ReactPortal[]>>,
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
        this.key = getId();

        this.renderPortal();
    }

    renderPortal() {
        if (!this.dom) return;

        const Component = this.component;
        const portal = createPortal(
            <ReactNodeContainer
                editor={this.editor}
                node={this.node}
                view={this.view}
                getPos={this.getPos}
                decorations={this.decorations}
            >
                <Component>
                    <Content dom={this.contentDOM} />
                </Component>
            </ReactNodeContainer>,
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
