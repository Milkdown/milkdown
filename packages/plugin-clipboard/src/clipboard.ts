/* Copyright 2021, Milkdown by Mirone. */
import { parserCtx, schemaCtx, serializerCtx } from '@milkdown/core';
import { Node, Plugin, Slice } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

type R = Record<string, unknown>;
const isPureText = (content: R | R[] | undefined | null): boolean => {
    if (!content) return false;
    if (Array.isArray(content)) {
        if (content.length > 1) return false;
        return isPureText(content[0]);
    }

    const child = content.content;
    if (child) {
        return isPureText(child as R[]);
    }

    return content.type === 'text';
};

export const clipboardPlugin = createPlugin(() => {
    return {
        prosePlugins: (_, ctx) => {
            const schema = ctx.get(schemaCtx);
            const parser = ctx.get(parserCtx);
            const serializer = ctx.get(serializerCtx);
            const plugin = new Plugin({
                props: {
                    handlePaste: (view, event) => {
                        const editable = view.props.editable?.(view.state);
                        const { clipboardData } = event;
                        if (!editable || !clipboardData) {
                            return false;
                        }

                        const text = clipboardData.getData('text/plain');
                        const html = clipboardData.getData('text/html');
                        if (html.length > 0) {
                            return false;
                        }

                        const slice = parser(text);
                        if (!slice || typeof slice === 'string') return false;

                        const contentSlice = view.state.selection.content();
                        view.dispatch(
                            view.state.tr.replaceSelection(
                                new Slice(slice.content, contentSlice.openStart, contentSlice.openEnd),
                            ),
                        );

                        return true;
                    },
                    clipboardTextSerializer: (slice) => {
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
