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
import { DefineComponent, defineComponent, h, markRaw, Teleport } from 'vue';

import { getRootInstance } from '.';
import { Content, VueNodeContainer } from './VueNode';

const nanoid = customAlphabet('abcedfghicklmn', 10);

export type RenderOptions = Partial<
    {
        as: string;
        update?: (node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource) => boolean;
    } & Pick<NodeView, 'ignoreMutation' | 'deselectNode' | 'selectNode' | 'destroy'>
>;

export const createVueView =
    (addPortal: (portal: DefineComponent, key: string) => void, removePortalByKey: (key: string) => void) =>
    (
        component: DefineComponent,
        options: RenderOptions = {},
    ): ((ctx: Ctx) => NodeViewConstructor | MarkViewConstructor) =>
    (ctx) =>
    (node, view, getPos, decorations) =>
        new VueNodeView(ctx, component, addPortal, removePortalByKey, options, node, view, getPos, decorations);

export class VueNodeView implements NodeView {
    teleportDOM: HTMLElement;
    key: string;

    get isInlineOrMark() {
        return this.node instanceof Mark || this.node.isInline;
    }

    constructor(
        private ctx: Ctx,
        private component: DefineComponent,
        private addPortal: (portal: DefineComponent, key: string) => void,
        private removePortalByKey: (key: string) => void,
        private options: RenderOptions,
        private node: Node | Mark,
        private view: EditorView,
        private getPos: boolean | (() => number),
        private decorations: readonly Decoration[],
    ) {
        this.key = nanoid();
        const elementName = options.as ? options.as : this.isInlineOrMark ? 'span' : 'div';
        this.teleportDOM = document.createElement(elementName);
        this.renderPortal();
    }

    get dom() {
        return (this.teleportDOM.firstElementChild || this.teleportDOM) as HTMLElement;
    }

    get contentDOM() {
        if (this.node instanceof Node && this.node.isLeaf) {
            return undefined;
        }

        return this.teleportDOM.querySelector<HTMLElement>('[data-view-content]') || this.dom;
    }

    renderPortal() {
        if (!this.teleportDOM) return;

        const CustomComponent = this.component;
        const elementName = this.options.as ? this.options.as : this.isInlineOrMark ? 'span' : 'div';
        const Portal = defineComponent({
            name: 'milkdown-portal',
            setup: () => {
                return () => (
                    <Teleport key={this.key} to={this.teleportDOM}>
                        <VueNodeContainer
                            as={elementName}
                            ctx={this.ctx}
                            node={this.node}
                            view={this.view}
                            getPos={this.getPos}
                            decorations={this.decorations}
                        >
                            <CustomComponent>
                                <Content isInline={this.isInlineOrMark} />
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
        this.options.destroy?.();
        this.teleportDOM.remove();
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

        if (this.contentDOM.contains(mutation.target)) {
            return false;
        }

        return true;
    }

    update(node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource) {
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
    }

    selectNode = this.options?.selectNode;

    deselectNode = this.options?.deselectNode;
}
