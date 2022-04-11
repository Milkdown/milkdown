/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import type { Decoration, EditorView, NodeView, ViewFactory } from '@milkdown/prose';
import { Mark, Node } from '@milkdown/prose';
import { customAlphabet } from 'nanoid';
import React from 'react';
import { createPortal } from 'react-dom';

import { Content, ReactNodeContainer } from './ReactNode';

const nanoid = customAlphabet('abcedfghicklmn', 10);

export type RenderOptions = Partial<
    {
        as: string;
    } & Pick<NodeView, 'ignoreMutation' | 'deselectNode' | 'selectNode' | 'destroy' | 'update'>
>;

export const createReactView =
    (addPortal: (portal: React.ReactPortal) => void, removePortalByKey: (key: string) => void) =>
    (component: React.FC, options: RenderOptions = {}): ((ctx: Ctx) => ViewFactory) =>
    (ctx) =>
    (node, view, getPos, decorations) =>
        new ReactNodeView(ctx, component, addPortal, removePortalByKey, options, node, view, getPos, decorations);

export class ReactNodeView implements NodeView {
    dom: HTMLElement | undefined;
    contentDOM: HTMLElement | null | undefined;
    key: string;

    get isInlineOrMark() {
        return this.node instanceof Mark || this.node.isInline;
    }

    constructor(
        private ctx: Ctx,
        private component: React.FC<{ children: React.ReactNode }>,
        private addPortal: (portal: React.ReactPortal) => void,
        private removePortalByKey: (key: string) => void,
        private options: RenderOptions,
        private node: Node | Mark,
        private view: EditorView,
        private getPos: boolean | (() => number),
        private decorations: Decoration[],
    ) {
        const elementName = options.as ? options.as : this.isInlineOrMark ? 'span' : 'div';
        const dom = document.createElement(elementName);
        dom.classList.add('dom-wrapper');

        const contentDOM =
            node instanceof Node && node.isLeaf
                ? undefined
                : document.createElement(this.isInlineOrMark ? 'span' : 'div');
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
                ctx={this.ctx}
                node={this.node}
                view={this.view}
                getPos={this.getPos}
                decorations={this.decorations}
            >
                <Component>
                    <Content isInline={this.isInlineOrMark} dom={this.contentDOM} />
                </Component>
            </ReactNodeContainer>,
            this.dom,
            this.key,
        );
        this.addPortal(portal);
    }

    destroy() {
        this.options.destroy?.();
        this.dom = undefined;
        this.contentDOM = undefined;
        this.removePortalByKey(this.key);
    }

    ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
        if (this.options.ignoreMutation) {
            return this.options.ignoreMutation(mutation);
        }
        if (!this.contentDOM) {
            return true;
        }
        return !this.contentDOM.contains(mutation.target);
    }

    update = this.options?.update;

    selectNode = this.options?.selectNode;

    deselectNode = this.options?.deselectNode;
}
