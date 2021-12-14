/* Copyright 2021, Milkdown by Mirone. */
import type { Decoration, EditorView, NodeView, ViewFactory } from '@milkdown/prose';
import { Mark, Node } from '@milkdown/prose';
import { customAlphabet } from 'nanoid';
import { DefineComponent, defineComponent, h, Teleport } from 'vue';

import { Content, VueNodeContainer } from './VueNode';

const nanoid = customAlphabet('abcedfghicklmn', 10);

export const createVueView =
    (addPortal: (portal: DefineComponent, key: string) => void, removePortalByKey: (key: string) => void) =>
    (component: DefineComponent): ViewFactory =>
    (node, view, getPos, decorations) =>
        new VueNodeView(component, addPortal, removePortalByKey, node, view, getPos, decorations);

export class VueNodeView implements NodeView {
    dom: HTMLElement | undefined;
    contentDOM: HTMLElement | undefined;
    key: string;

    constructor(
        private component: DefineComponent,
        private addPortal: (portal: DefineComponent, key: string) => void,
        private removePortalByKey: (key: string) => void,
        private node: Node | Mark,
        private view: EditorView,
        private getPos: boolean | (() => number),
        private decorations: Decoration[],
    ) {
        this.key = nanoid();
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
        this.renderPortal();
    }

    renderPortal() {
        if (!this.dom) return;

        const CustomComponent = this.component;
        const Portal = defineComponent({
            name: 'milkdown-portal',
            setup: () => {
                return () => (
                    <Teleport to={this.dom}>
                        <VueNodeContainer
                            key={this.key}
                            node={this.node}
                            view={this.view}
                            getPos={this.getPos}
                            decorations={this.decorations}
                        >
                            <CustomComponent>
                                <Content dom={this.contentDOM} />
                            </CustomComponent>
                        </VueNodeContainer>
                    </Teleport>
                );
            },
        });
        this.addPortal(Portal as DefineComponent, this.key);
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
