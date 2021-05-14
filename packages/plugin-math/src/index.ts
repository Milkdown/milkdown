import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SerializerNode, Node, createProsemirrorPlugin, createMarkdownItPlugin } from '@milkdown/core';
import {
    mathPlugin,
    makeInlineMathInputRule,
    REGEX_INLINE_MATH_DOLLARS,
    makeBlockMathInputRule,
    REGEX_BLOCK_MATH_DOLLARS,
    mathBackspaceCmd,
} from '@benrbray/prosemirror-math';
import markdownItMath from '@traptitech/markdown-it-katex';
import { keymap } from 'prosemirror-keymap';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import type { PluginSimple } from 'markdown-it';

class MathInline extends Node {
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

class MathDisplay extends Node {
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

const keys = keymap({
    Backspace: chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
});

export const math = [
    new MathInline(),
    new MathDisplay(),
    createProsemirrorPlugin('mathProsemirrorPlugin', () => [mathPlugin, keys]),
    createMarkdownItPlugin('mathMarkdownItPlugin', () => [markdownItMath as PluginSimple]),
];
