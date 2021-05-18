import {
    makeBlockMathInputRule,
    makeInlineMathInputRule,
    REGEX_BLOCK_MATH_DOLLARS,
    REGEX_INLINE_MATH_DOLLARS,
} from '@benrbray/prosemirror-math';
import { Node, SerializerNode } from '@milkdown/core';
import type { NodeSpec, NodeType } from 'prosemirror-model';

export class MathInline extends Node {
    id = 'math_inline';
    schema: NodeSpec = {
        group: 'inline math',
        content: 'text*',
        inline: true,
        atom: true,
        parseDOM: [{ tag: 'math-inline' }],
        toDOM: () => ['math-inline', { class: 'math-node' }, 0],
    };
    parser = {
        block: this.id,
        isAtom: true,
    };
    serializer: SerializerNode = (state, node) => {
        state.write('$');
        state.renderContent(node);
        state.write('$');
    };
    inputRules = (nodeType: NodeType) => [makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, nodeType)];
}

export class MathDisplay extends Node {
    id = 'math_display';
    schema: NodeSpec = {
        group: 'block math',
        content: 'text*',
        atom: true,
        code: true,
        parseDOM: [{ tag: 'math-display' }],
        toDOM: () => ['math-display', { class: 'math-node' }, 0],
    };
    parser = {
        block: 'math_block',
        isAtom: true,
    };
    serializer: SerializerNode = (state, node) => {
        state.write('$$').ensureNewLine().renderContent(node).ensureNewLine().write('$$').closeBlock(node);
    };
    inputRules = (nodeType: NodeType) => [makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, nodeType)];
}

export const nodes = [new MathInline(), new MathDisplay()];
