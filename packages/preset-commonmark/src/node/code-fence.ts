/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, createThemeSliceKey, ThemeIcon, themeManagerCtx } from '@milkdown/core';
import { setBlockType, textblockTypeInputRule } from '@milkdown/prose';
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

export const ThemeCodeFence = createThemeSliceKey<string>('code-fence');
export type ThemeCodeFenceType = typeof ThemeCodeFence;

export const codeFence = createNode<Keys, { languageList?: string[] }>((utils, options) => {
    utils.themeManager.inject(ThemeCodeFence);
    const style = utils.getStyle((themeManager) => {
        return themeManager.get(ThemeCodeFence);
    });

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
                        class: utils.getClassName(node.attrs, 'code-fence', style),
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
        view: (ctx) => (node, view, getPos) => {
            const container = document.createElement('div');
            const selectWrapper = document.createElement('div');
            const select = document.createElement('ul');
            const pre = document.createElement('pre');
            const code = document.createElement('code');

            const valueWrapper = document.createElement('div');
            valueWrapper.className = 'code-fence_selector';
            const value = document.createElement('span');
            valueWrapper.appendChild(value);
            const downIcon = ctx.get(themeManagerCtx).get(ThemeIcon, 'downArrow');
            if (view.editable && downIcon) {
                valueWrapper.appendChild(downIcon.dom);
            }

            select.className = 'code-fence_selector-list';
            select.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!view.editable) return;

                const el = e.target;
                if (!(el instanceof HTMLLIElement)) return;
                const { tr } = view.state;

                view.dispatch(
                    tr.setNodeMarkup(getPos(), undefined, {
                        fold: true,
                        language: el.dataset['value'],
                    }),
                );
            });
            valueWrapper.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!view.editable) return;
                const { tr } = view.state;

                view.dispatch(
                    tr.setNodeMarkup(getPos(), undefined, {
                        fold: false,
                        language: container.dataset['language'],
                    }),
                );
            });
            document.addEventListener('mousedown', () => {
                if (!view.editable || select.dataset['fold'] === 'true') return;

                const { tr } = view.state;

                view.dispatch(
                    tr.setNodeMarkup(getPos(), undefined, {
                        fold: true,
                        language: container.dataset['language'],
                    }),
                );
            });

            (options?.languageList || languageOptions).forEach((lang) => {
                const option = document.createElement('li');
                option.className = 'code-fence_selector-list-item';
                option.innerText = lang || '--';
                select.appendChild(option);
                option.setAttribute('data-value', lang);
            });

            code.spellcheck = false;
            selectWrapper.className = 'code-fence_selector-wrapper';
            selectWrapper.contentEditable = 'false';
            selectWrapper.append(valueWrapper);
            selectWrapper.append(select);
            pre.append(code);
            const codeContent = document.createElement('div');
            code.append(codeContent);
            codeContent.style.whiteSpace = 'inherit';

            container.append(selectWrapper, pre);
            container.setAttribute('class', utils.getClassName(node.attrs, 'code-fence', style));
            container.setAttribute('data-language', node.attrs['language']);
            value.innerText = node.attrs['language'] || '--';
            select.setAttribute('data-fold', node.attrs['fold'] ? 'true' : 'false');

            return {
                dom: container,
                contentDOM: codeContent,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== id) return false;

                    const lang = updatedNode.attrs['language'];
                    container.dataset['language'] = lang;
                    value.innerText = lang || '--';
                    select.setAttribute('data-fold', updatedNode.attrs['fold'] ? 'true' : 'false');

                    return true;
                },
            };
        },
    };
});
