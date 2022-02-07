/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, createThemeSliceKey } from '@milkdown/core';
import { Node, setBlockType, textblockTypeInputRule } from '@milkdown/prose';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['CodeFence'];

const languageOptions = [
    '',
    'javascript',
    'typescript',
    'bash',
    'sql',
    'json',
    'html',
    'css',
    'c',
    'cpp',
    'java',
    'ruby',
    'python',
    'go',
    'rust',
    'markdown',
];

export const backtickInputRegex = /^```(?<language>[a-z]*)?[\s\n]$/;
export const tildeInputRegex = /^~~~(?<language>[a-z]*)?[\s\n]$/;

export const TurnIntoCodeFence = createCmdKey('TurnIntoCodeFence');

const id = 'fence';

type ThemeOptions = {
    onSelectLanguage: (language: string) => void;
    editable: () => boolean;
    onFocus: () => void;
    onBlur: () => void;
    languageList: string[];
};
type Output = {
    dom: HTMLElement;
    contentDOM: HTMLElement;
    onUpdate: (node: Node) => void;
};
export const ThemeCodeFence = createThemeSliceKey<Output, ThemeOptions>('code-fence');
export type ThemeCodeFenceType = typeof ThemeCodeFence;

export const codeFence = createNode<Keys, { languageList?: string[] }>((utils, options) => {
    utils.themeManager.inject(ThemeCodeFence);
    // const style = utils.getStyle((themeManager) => {
    //     return themeManager.get(ThemeCodeFence);
    // });

    return {
        id,
        schema: () => ({
            content: 'text*',
            group: 'block',
            marks: '',
            defining: true,
            code: true,
            attrs: {
                language: {
                    default: '',
                },
                fold: {
                    default: true,
                },
            },
            parseDOM: [
                {
                    tag: 'pre',
                    preserveWhitespace: 'full',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error('Parse DOM error.');
                        }
                        return { language: dom.dataset['language'] };
                    },
                },
            ],
            toDOM: (node) => {
                return [
                    'pre',
                    {
                        'data-language': node.attrs['language'],
                        class: utils.getClassName(node.attrs, 'code-fence'),
                    },
                    ['code', { spellCheck: 'false' }, 0],
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === 'code',
                runner: (state, node, type) => {
                    const language = node['lang'] as string;
                    const value = node['value'] as string;
                    state.openNode(type, { language });
                    if (value) {
                        state.addText(value);
                    }
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.addNode('code', undefined, node.content.firstChild?.text || '', {
                        lang: node.attrs['language'],
                    });
                },
            },
        }),
        inputRules: (nodeType) => [
            textblockTypeInputRule(backtickInputRegex, nodeType, (match) => {
                const [ok, language] = match;
                if (!ok) return;
                return { language };
            }),
            textblockTypeInputRule(tildeInputRegex, nodeType, (match) => {
                const [ok, language] = match;
                if (!ok) return;
                return { language };
            }),
        ],
        commands: (nodeType) => [createCmd(TurnIntoCodeFence, () => setBlockType(nodeType))],
        shortcuts: {
            [SupportedKeys.CodeFence]: createShortcut(TurnIntoCodeFence, 'Mod-Alt-c'),
        },
        view: () => (node, view, getPos) => {
            let currNode = node;

            const onSelectLanguage = (language: string) => {
                const { tr } = view.state;
                view.dispatch(
                    tr.setNodeMarkup(getPos(), undefined, {
                        fold: true,
                        language,
                    }),
                );
            };
            const onBlur = () => {
                const { tr } = view.state;

                view.dispatch(
                    tr.setNodeMarkup(getPos(), undefined, {
                        ...currNode.attrs,
                        fold: true,
                    }),
                );
            };
            const onFocus = () => {
                const { tr } = view.state;

                view.dispatch(
                    tr.setNodeMarkup(getPos(), undefined, {
                        ...currNode.attrs,
                        fold: false,
                    }),
                );
            };

            const renderer = utils.themeManager.get(ThemeCodeFence, {
                onBlur,
                onFocus,
                onSelectLanguage,
                editable: () => view.editable,
                languageList: options?.languageList || languageOptions,
            });
            if (!renderer) return {};

            const { dom, contentDOM, onUpdate } = renderer;
            onUpdate(currNode);

            return {
                dom,
                contentDOM,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== id) return false;
                    currNode = updatedNode;
                    onUpdate(currNode);

                    return true;
                },
            };
        },
    };
});
