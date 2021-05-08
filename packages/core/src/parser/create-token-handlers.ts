import type { Schema } from 'prosemirror-model';
import type { ParserSpec, TokenHandler } from './types';

import { attrs, isBlockSpec, isIgnoreSpec, isMarkSpec, isNodeSpec, noOp } from './utility';

export function createTokenHandlers(schema: Schema, specMap: Record<string, ParserSpec>) {
    const handlers = {} as Record<string, TokenHandler>;
    handlers.softbreak = (state) => state.addText('\n');

    Object.entries(specMap).forEach(([type, spec]) => {
        if (isBlockSpec(spec)) {
            const nodeType = schema.nodes[spec.block] || schema.nodes[type];
            if (!nodeType) throw new Error();
            if (spec.isAtom) {
                handlers[spec.block] = (state, tok, tokens, i) => {
                    state.stack.openNode(nodeType, attrs(spec, tok, tokens, i));
                    state.addText(tok.content);
                    state.stack.closeNode();
                };
                return;
            }
            handlers[spec.block + '_open'] = (state, tok, tokens, i) =>
                state.stack.openNode(nodeType, attrs(spec, tok, tokens, i));
            handlers[spec.block + '_close'] = (state) => state.stack.closeNode();
            return;
        }
        if (isNodeSpec(spec)) {
            const nodeType = schema.nodes[spec.node] || schema.nodes[type];
            if (!nodeType) throw new Error();
            handlers[spec.node] = (state, tok, tokens, i) => state.stack.addNode(nodeType, attrs(spec, tok, tokens, i));
            return;
        }
        if (isMarkSpec(spec)) {
            const markType = schema.marks[spec.mark] || schema.marks[type];
            if (!markType) throw new Error();
            if (spec.isAtom) {
                handlers[spec.mark] = (state, tok, tokens, i) => {
                    state.stack.openMark(markType.create(attrs(spec, tok, tokens, i)));
                    state.addText(tok.content);
                    state.stack.closeMark(markType);
                };
                return;
            }
            handlers[spec.mark + '_open'] = (state, tok, tokens, i) =>
                state.stack.openMark(markType.create(attrs(spec, tok, tokens, i)));
            handlers[spec.mark + '_close'] = (state) => state.stack.closeMark(markType);
            return;
        }
        if (isIgnoreSpec(spec)) {
            handlers[type + '_open'] = noOp;
            handlers[type + '_close'] = noOp;
            return;
        }
        throw new RangeError('Unrecognized parsing spec ' + JSON.stringify(spec));
    });

    handlers.inline = (state, tok) => state.parseTokens(tok.children ?? []);
    handlers.text = (state, tok) => state.addText(tok.content);

    return handlers;
}
