/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { Mark, Node } from '@milkdown/prose/model';
import type {
    Decoration,
    DecorationSource,
    EditorView,
    MarkViewConstructor,
    NodeView,
    NodeViewConstructor,
} from '@milkdown/prose/view';
import { customAlphabet } from 'nanoid';
import { FC, ReactNode, ReactPortal } from 'react';
import { createPortal } from 'react-dom';

import { Content, ReactNodeContainer } from './ReactNode';

const nanoid = customAlphabet('abcedfghicklmn', 10);

export type RenderOptions = Partial<
    {
        as: string;
        update?: (node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource) => boolean;
    } & Pick<NodeView, 'ignoreMutation' | 'deselectNode' | 'selectNode' | 'destroy'>
>;

export const createReactView =
    (
        addPortal: (portal: ReactPortal) => void,
        removePortalByKey: (key: string) => void,
        replacePortalByKey: (key: string, portal: ReactPortal) => void,
    ) =>
    (
        component: FC<{ children: ReactNode }>,
        options: RenderOptions = {},
    ): ((ctx: Ctx) => NodeViewConstructor | MarkViewConstructor) =>
    (ctx) =>
    (node, view, getPos, decorations) =>
        new ReactNodeView(
            ctx,
            component,
            addPortal,
            removePortalByKey,
            replacePortalByKey,
            options,
            node,
            view,
            getPos,
            decorations,
        );

export class ReactNodeView implements NodeView {
    teleportDOM: HTMLElement;
    contentDOMElement: HTMLElement | null;
    key: string;

    get isInlineOrMark() {
        return this.node instanceof Mark || this.node.isInline;
    }

    constructor(
        private ctx: Ctx,
        private component: React.FC<{ children: React.ReactNode }>,
        private addPortal: (portal: ReactPortal) => void,
        private removePortalByKey: (key: string) => void,
        private replacePortalByKey: (key: string, portal: ReactPortal) => void,
        private options: RenderOptions,
        private node: Node | Mark,
        private view: EditorView,
        private getPos: boolean | (() => number),
        private decorations: readonly Decoration[],
    ) {
        this.key = nanoid();
        const elementName = options.as ? options.as : this.isInlineOrMark ? 'span' : 'div';
        this.teleportDOM = document.createElement(elementName);

        const contentDOM =
            node instanceof Node && node.isLeaf ? null : document.createElement(this.isInlineOrMark ? 'span' : 'div');
        if (contentDOM) {
            contentDOM.classList.add('content-dom');
        }
        this.contentDOMElement = contentDOM;

        this.key = nanoid();

        this.renderPortal();
    }

    get dom() {
        return this.teleportDOM;
    }

    get contentDOM() {
        if ((this.node instanceof Node && this.node.isLeaf) || this.isInlineOrMark) {
            return null;
        }

        return this.contentDOMElement;
    }

    getPortal = () => {
        const CustomComponent = this.component;
        const contentRef = (element: HTMLElement | null) => {
            if (element && this.contentDOMElement && element.firstChild !== this.contentDOMElement) {
                element.appendChild(this.contentDOMElement);
            }
        };
        return createPortal(
            <ReactNodeContainer
                ctx={this.ctx}
                node={this.node}
                view={this.view}
                getPos={this.getPos}
                decorations={this.decorations}
            >
                <CustomComponent>
                    <Content isInline={this.isInlineOrMark} contentRef={contentRef} />
                </CustomComponent>
            </ReactNodeContainer>,
            this.teleportDOM,
            this.key,
        );
    };

    renderPortal() {
        this.addPortal(this.getPortal());
    }

    destroy() {
        this.options.destroy?.();
        this.contentDOMElement = null;
        this.removePortalByKey(this.key);
    }

    ignoreMutation(mutation: MutationRecord) {
        if (this.options.ignoreMutation) {
            return this.options.ignoreMutation(mutation);
        }

        if (!this.dom || !this.contentDOM) {
            return true;
        }

        if (this.node instanceof Node) {
            if (this.node.isLeaf || this.node.isAtom) {
                return true;
            }
        }

        if ((mutation as unknown as { type: string }).type === 'selection') {
            return false;
        }

        if (this.contentDOM === this.dom) {
            return false;
        }

        if (this.contentDOM === mutation.target && mutation.type === 'attributes') {
            return true;
        }

        if (this.contentDOM.contains(mutation.target)) {
            return false;
        }

        return true;
    }

    update(node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource) {
        const innerUpdate = () => {
            if (this.options.update) {
                const result = this.options.update?.(node, decorations, innerDecorations);
                if (result != null) {
                    return result;
                }
            }

            if (this.node.type !== node.type) {
                return false;
            }

            if (node === this.node && this.decorations === decorations) {
                return true;
            }

            this.node = node;
            this.decorations = decorations;
            return true;
        };

        const shouldUpdate = innerUpdate();

        if (shouldUpdate) {
            this.replacePortalByKey(this.key, this.getPortal());
        }

        return shouldUpdate;
    }

    selectNode = this.options?.selectNode;

    deselectNode = this.options?.deselectNode;
}
