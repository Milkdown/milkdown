import type { Editor, NodeViewFactory } from '@milkdown/core';
import { defineComponent, DefineComponent } from 'vue';
import { getId } from '@milkdown/utils';
import type { Node } from 'prosemirror-model';
import type { Decoration, EditorView, NodeView } from 'prosemirror-view';
import { Content, VueNodeContainer } from './VueNode';

export const createVueView =
    (
        addPortal: (portal: DefineComponent, key: string, dom: HTMLElement) => void,
        removePortalByKey: (key: string) => void,
    ) =>
    (component: DefineComponent): NodeViewFactory =>
    (editor, _type, node, view, getPos, decorations) =>
        new VueNodeView(component, addPortal, removePortalByKey, editor, node, view, getPos, decorations);

export class VueNodeView implements NodeView {
    dom: HTMLElement | undefined;
    contentDOM: HTMLElement | undefined;
    key: string;

    constructor(
        private component: DefineComponent,
        private addPortal: (portal: DefineComponent, key: string, dom: HTMLElement) => void,
        private removePortalByKey: (key: string) => void,
        private editor: Editor,
        private node: Node,
        private view: EditorView,
        private getPos: boolean | (() => number),
        private decorations: Decoration[],
    ) {
        this.key = getId();
        const dom = document.createElement('div');

        const contentDOM = node.isLeaf ? undefined : document.createElement(node.isInline ? 'span' : 'div');
        if (contentDOM) {
            dom.appendChild(contentDOM);
        }
        this.dom = dom;
        this.contentDOM = contentDOM;

        // console.log(this.key);
        this.renderPortal();
    }

    renderPortal() {
        if (!this.dom) return;

        const CustomComponent = this.component;
        const Portal = defineComponent(() => {
            // return () => <div key={this.key} />;
            return () => (
                <VueNodeContainer
                    key={this.key}
                    editor={this.editor}
                    node={this.node}
                    view={this.view}
                    getPos={this.getPos}
                    decorations={this.decorations}
                >
                    <CustomComponent>
                        <Content dom={this.contentDOM} />
                    </CustomComponent>
                </VueNodeContainer>
            );
        });
        this.addPortal(Portal, this.key, this.dom);
    }

    destroy() {
        this.removePortalByKey(this.key);
        this.dom = undefined;
        this.contentDOM = undefined;
    }
}
