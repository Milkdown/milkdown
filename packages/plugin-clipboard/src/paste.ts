import {
    MilkdownPlugin,
    Parser,
    parserCtx,
    ParserReady,
    prosePluginsCtx,
    schemaCtx,
    serializerCtx,
    SerializerReady,
} from '@milkdown/core';
import { Node as ProseNode, Schema, Slice } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

const clipboardPlugin = (schema: Schema, parser: Parser, serializer: (node: ProseNode) => string) =>
    new Plugin({
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

                parser(text)
                    .then((slice) => {
                        if (!slice || typeof slice === 'string') return;

                        const { $from } = view.state.selection;
                        const depth = slice.content.childCount > 1 ? 0 : $from.depth;
                        view.dispatch(view.state.tr.replaceSelection(new Slice(slice.content, depth, depth)));
                        return;
                    })
                    .catch((e) => {
                        throw e;
                    });

                return true;
            },
            clipboardTextSerializer: (slice) => {
                const doc = schema.topNodeType.createAndFill(undefined, slice.content);
                if (!doc) return '';
                const value = serializer(doc);
                return value;
            },
        },
    });

export const clipboard: MilkdownPlugin = () => {
    return async (ctx) => {
        await Promise.all([ctx.wait(ParserReady), ctx.wait(SerializerReady)]);
        const schema = ctx.get(schemaCtx);
        const parser = ctx.get(parserCtx);
        const serializer = ctx.get(serializerCtx);
        const plugin = clipboardPlugin(schema, parser, serializer);
        ctx.update(prosePluginsCtx, (prev) => prev.concat(plugin));
    };
};
