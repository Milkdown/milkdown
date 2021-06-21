import type { Editor, NodeViewFactory } from '@milkdown/core';
import { getId } from '@milkdown/utils';
import type { Node } from 'prosemirror-model';
import type { Decoration, EditorView, NodeView } from 'prosemirror-view';
import React from 'react';
import { createPortal } from 'react-dom';
import { Content, ReactNodeContainer } from './ReactNode';

export const createReactView =
    (addPortal: (portal: React.ReactPortal) => void, removePortalByKey: (key: string) => void) =>
    (component: React.FC): NodeViewFactory =>
    (editor, _type, node, view, getPos, decorations) =>
        new ReactNodeView(component, addPortal, removePortalByKey, editor, node, view, getPos, decorations);

export class ReactNodeView implements NodeView {
    dom: HTMLElement | undefined;
    contentDOM: HTMLElement | null | undefined;
    key: string;

    constructor(
        private component: React.FC,
        private addPortal: (portal: React.ReactPortal) => void,
        private removePortalByKey: (key: string) => void,
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
        this.addPortal(portal);
    }

    destroy() {
        this.dom = undefined;
        this.contentDOM = undefined;
        this.removePortalByKey(this.key);
    }

    ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
        if (!this.contentDOM) {
            return true;
        }
        return !this.contentDOM.contains(mutation.target);
    }
}
