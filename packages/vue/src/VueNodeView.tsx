/* Copyright 2021, Milkdown by Mirone. */
import type { Decoration, EditorView, NodeView, ViewFactory } from '@milkdown/prose';
import { Mark, Node } from '@milkdown/prose';
import { customAlphabet } from 'nanoid';
import { DefineComponent, defineComponent, h, markRaw, Teleport } from 'vue';

import { getRootInstance } from '.';
import { Content, VueNodeContainer } from './VueNode';

const nanoid = customAlphabet('abcedfghicklmn', 10);

export const createVueView =
    (addPortal: (portal: DefineComponent, key: string) => void, removePortalByKey: (key: string) => void) =>
    (component: DefineComponent): ViewFactory =>
    (node, view, getPos, decorations) =>
        new VueNodeView(component, addPortal, removePortalByKey, node, view, getPos, decorations);

export class VueNodeView implements NodeView {
    teleportDOM: HTMLElement;
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
        this.teleportDOM = document.createElement(node instanceof Mark ? 'span' : 'div');
        this.renderPortal();
    }

    get dom() {
        return this.teleportDOM.firstElementChild || this.teleportDOM;
    }

    get contentDOM() {
        if (this.node instanceof Node && this.node.isLeaf) {
            return null;
        }

        return this.teleportDOM.querySelector('[data-view-content]') || this.dom;
    }

    renderPortal() {
        if (!this.teleportDOM) return;

        const CustomComponent = this.component;
        const Portal = defineComponent({
            name: 'milkdown-portal',
            setup: () => {
                return () => (
                    <Teleport key={this.key} to={this.teleportDOM}>
                        <VueNodeContainer
                            node={this.node}
                            view={this.view}
                            getPos={this.getPos}
                            decorations={this.decorations}
                        >
                            <CustomComponent>
                                <Content isMark={this.node instanceof Mark} />
                            </CustomComponent>
                        </VueNodeContainer>
                    </Teleport>
                );
            },
        });
        this.addPortal(markRaw(Portal) as DefineComponent, this.key);
        const instance = getRootInstance();
        if (instance) {
            instance.update();
        }
    }

    destroy() {
        this.removePortalByKey(this.key);
    }

    ignoreMutation(mutation: MutationRecord | { type: 'selection'; target: Element }) {
        if (!this.dom || !this.contentDOM) {
            return true;
        }

        if (this.node instanceof Node) {
            if (this.node.isLeaf || this.node.isAtom) {
                return true;
            }
        }

        if (mutation.type === 'selection') {
            return false;
        }

        if (this.contentDOM === this.dom) {
            return false;
        }

        if (this.contentDOM.contains(mutation.target)) {
            return false;
        }

        return true;
    }

    update(node: Node | Mark, decorations: Decoration[]) {
        if (this.node.type !== node.type) {
            return false;
        }

        if (node === this.node && this.decorations === decorations) {
            return true;
        }

        this.node = node;
        this.decorations = decorations;
        return true;
    }
}
