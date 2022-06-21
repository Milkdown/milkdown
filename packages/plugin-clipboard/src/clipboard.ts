/* Copyright 2021, Milkdown by Mirone. */
import { editorViewOptionsCtx, parserCtx, schemaCtx, serializerCtx } from '@milkdown/core';
import { DOMParser, Node, Slice } from '@milkdown/prose/model';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { createPlugin } from '@milkdown/utils';

type R = Record<string, unknown>;
const isPureText = (content: R | R[] | undefined | null): boolean => {
    if (!content) return false;
    if (Array.isArray(content)) {
        if (content.length > 1) return false;
        return isPureText(content[0]);
    }

    const child = content['content'];
    if (child) {
        return isPureText(child as R[]);
    }

    return content['type'] === 'text';
};

export const key = new PluginKey('MILKDOWN_CLIPBOARD');

export const clipboardPlugin = createPlugin(() => {
    return {
        prosePlugins: (_, ctx) => {
            const schema = ctx.get(schemaCtx);

            // Set editable props for https://github.com/Saul-Mirone/milkdown/issues/190
            ctx.update(editorViewOptionsCtx, (prev) => ({
                ...prev,
                editable: prev.editable ?? (() => true),
            }));

            const plugin = new Plugin({
                key,
                props: {
                    handlePaste: (view, event, originalSlice) => {
                        const parser = ctx.get(parserCtx);
                        const serializer = ctx.get(serializerCtx);
                        const editable = view.props.editable?.(view.state);
                        const { clipboardData } = event;
                        if (!editable || !clipboardData) {
                            return false;
                        }

                        const currentNode = view.state.selection.$from.node();
                        if (currentNode.type.spec.code) {
                            return false;
                        }

                        let text = clipboardData.getData('text/plain');
                        const html = clipboardData.getData('text/html');
                        if (html.length === 0 && text.length === 0) {
                            return false;
                        }
                        if (html.length > 0 || text.length === 0) {
                            const dom = document.createElement('template');
                            dom.innerHTML = html;
                            const node = DOMParser.fromSchema(schema).parse(dom.content);
                            dom.remove();
                            text = serializer(node);
                        }

                        const slice = parser(text);
                        if (!slice || typeof slice === 'string') return false;

                        view.dispatch(
                            view.state.tr.replaceSelection(
                                new Slice(slice.content, originalSlice.openStart, originalSlice.openEnd),
                            ),
                        );

                        return true;
                    },
                    clipboardTextSerializer: (slice) => {
                        const serializer = ctx.get(serializerCtx);
                        const isText = isPureText(slice.content.toJSON());
                        if (isText) {
                            return (slice.content as unknown as Node).textBetween(0, slice.content.size, '\n\n');
                        }
                        const doc = schema.topNodeType.createAndFill(undefined, slice.content);
                        if (!doc) return '';
                        const value = serializer(doc);
                        return value;
                    },
                },
            });

            return [plugin];
        },
    };
});
