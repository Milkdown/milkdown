import {
    makeBlockMathInputRule,
    makeInlineMathInputRule,
    REGEX_BLOCK_MATH_DOLLARS,
    REGEX_INLINE_MATH_DOLLARS,
} from '@benrbray/prosemirror-math';
import { AtomList, createNode } from '@milkdown/utils';

export const mathInline = createNode(() => {
    const id = 'math_inline';
    return {
        id,
        schema: {
            group: 'inline math',
            content: 'text*',
            inline: true,
            atom: true,
            parseDOM: [{ tag: 'math-inline' }],
            toDOM: () => ['math-inline', { class: 'math-node' }, 0],
        },
        parser: {
            match: (node) => node.type === 'inlineMath',
            runner: (state, node, type) => {
                state.openNode(type);
                state.addText(node.value as string);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                let text = '';
                node.forEach((n) => {
                    text += n.text as string;
                });
                state.addNode('inlineMath', undefined, text);
            },
        },
        inputRules: (nodeType) => [makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, nodeType)],
    };
});

export const mathDisplay = createNode(() => {
    const id = 'math_display';
    return {
        id,
        schema: {
            group: 'block math',
            content: 'text*',
            atom: true,
            code: true,
            parseDOM: [{ tag: 'math-display' }],
            toDOM: () => ['math-display', { class: 'math-node' }, 0],
        },
        parser: {
            match: (node) => node.type === 'math',
            runner: (state, node, type) => {
                state.openNode(type);
                state.addText(node.value as string);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                let text = '';
                node.forEach((n) => {
                    text += n.text as string;
                });
                state.addNode('math', undefined, text);
            },
        },
        inputRules: (nodeType) => [makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, nodeType)],
    };
});

export const nodes = AtomList.create([mathInline(), mathDisplay()]);
