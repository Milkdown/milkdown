/* Copyright 2021, Milkdown by Mirone. */
import type { Editor, ViewFactory } from '@milkdown/core';
import type { Decoration, EditorView, NodeView } from '@milkdown/prose';
import { Mark, Node } from '@milkdown/prose';
import { customAlphabet } from 'nanoid';
import React from 'react';
import { createPortal } from 'react-dom';

import { Content, ReactNodeContainer } from './ReactNode';

const nanoid = customAlphabet('abcedfghicklmn', 10);

export const createReactView =
    (addPortal: (portal: React.ReactPortal) => void, removePortalByKey: (key: string) => void) =>
    (component: React.FC): ViewFactory =>
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
        private node: Node | Mark,
        private view: EditorView,
        private getPos: boolean | (() => number),
        private decorations: Decoration[],
    ) {
        const dom = document.createElement(node instanceof Mark ? 'span' : 'div');
        dom.classList.add('dom-wrapper');

        const contentDOM =
            node instanceof Node && node.isLeaf
                ? undefined
                : document.createElement(node instanceof Mark ? 'span' : 'div');
        if (contentDOM) {
            contentDOM.classList.add('content-dom');
            dom.appendChild(contentDOM);
        }
        this.dom = dom;
        this.contentDOM = contentDOM;
        this.key = nanoid();

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
                    <Content isMark={this.node instanceof Mark} dom={this.contentDOM} />
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
