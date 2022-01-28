/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, themeToolCtx } from '@milkdown/core';
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
export const codeFence = createNode<Keys, { languageList?: string[] }>((utils, options) => {
    const style = utils.getStyle(({ palette, mixin, size, font }, { css }) => {
        const { shadow, scrollbar, border } = mixin;
        const { lineWidth, radius } = size;
        return css`
            background-color: ${palette('background')};
            color: ${palette('neutral')};
            font-size: 0.85rem;
            padding: 1.2rem 0.4rem 1.4rem;
            border-radius: ${radius};
            font-family: ${font.typography};

            * {
                margin: 0;
            }

            .code-fence_select-wrapper {
                position: relative;
            }

            .code-fence_value {
                width: 10.25rem;
                box-sizing: border-box;
                border-radius: ${size.radius};
                margin: 0 1.2rem 1.2rem;
                ${border()};
                ${shadow()};
                cursor: pointer;
                background-color: ${palette('surface')};
                position: relative;
                display: flex;
                color: ${palette('neutral', 0.87)};
                letter-spacing: 0.5px;
                height: 2.625rem;
                align-items: center;

                & > .icon {
                    width: 2.625rem;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: ${palette('solid', 0.87)};
                    border-left: ${lineWidth} solid ${palette('line')};

                    text-align: center;
                    transition: all 0.2s ease-in-out;
                    &:hover {
                        background: ${palette('background')};
                        color: ${palette('primary')};
                    }
                }

                > span:first-child {
                    padding-left: 1rem;
                    flex: 1;
                    font-weight: 500;
                }
            }

            .code-fence_select-option {
                list-style: none;
                line-height: 2rem;
                padding-left: 1rem;
                cursor: pointer;
                :hover {
                    background: ${palette('secondary', 0.12)};
                    color: ${palette('primary')};
                }
            }

            .code-fence_select {
                &[data-fold='true'] {
                    display: none;
                }

                font-weight: 500;
                position: absolute;
                z-index: 1;
                top: 2.625rem;
                box-sizing: border-box;
                left: 1.2rem;
                padding: 0.5rem 0;
                max-height: 16.75rem;
                width: 10.25rem;
                ${border()};
                ${shadow()};
                background-color: ${palette('surface')};
                border-top: none;
                overflow-y: auto;
                display: flex;
                flex-direction: column;

                ${scrollbar('y')}
            }

            code {
                line-height: 1.5;
                font-family: ${font.code};
            }

            pre {
                font-family: ${font.code};
                margin: 0 1.2rem !important;
                white-space: pre;
                overflow: auto;
                ${scrollbar('x')};
            }
        `;
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
                        return { language: dom.dataset.language };
                    },
                },
            ],
            toDOM: (node) => {
                return [
                    'pre',
                    {
                        'data-language': node.attrs.language,
                        class: utils.getClassName(node.attrs, 'code-fence', style),
                    },
                    ['code', { spellCheck: 'false' }, 0],
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === 'code',
                runner: (state, node, type) => {
                    const language = node.lang as string;
                    const value = node.value as string;
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
                        lang: node.attrs.language,
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
            valueWrapper.className = 'code-fence_value';
            const value = document.createElement('span');
            valueWrapper.appendChild(value);
            if (view.editable) {
                valueWrapper.appendChild(ctx.get(themeToolCtx).slots.icon('downArrow'));
            }

            select.className = 'code-fence_select';
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
                        language: el.dataset.value,
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
                        language: container.dataset.language,
                    }),
                );
            });
            document.addEventListener('mousedown', () => {
                if (!view.editable || select.dataset.fold === 'true') return;

                const { tr } = view.state;

                view.dispatch(
                    tr.setNodeMarkup(getPos(), undefined, {
                        fold: true,
                        language: container.dataset.language,
                    }),
                );
            });

            (options?.languageList || languageOptions).forEach((lang) => {
                const option = document.createElement('li');
                option.className = 'code-fence_select-option';
                option.innerText = lang || '--';
                select.appendChild(option);
                option.setAttribute('data-value', lang);
            });

            code.spellcheck = false;
            selectWrapper.className = 'code-fence_select-wrapper';
            selectWrapper.contentEditable = 'false';
            selectWrapper.append(valueWrapper);
            selectWrapper.append(select);
            pre.append(code);
            const codeContent = document.createElement('div');
            code.append(codeContent);
            codeContent.style.whiteSpace = 'inherit';

            container.append(selectWrapper, pre);
            container.setAttribute('class', utils.getClassName(node.attrs, 'code-fence', style));
            container.setAttribute('data-language', node.attrs.language);
            value.innerText = node.attrs.language || '--';
            select.setAttribute('data-fold', node.attrs.fold ? 'true' : 'false');

            return {
                dom: container,
                contentDOM: codeContent,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== id) return false;

                    const lang = updatedNode.attrs.language;
                    container.dataset.language = lang;
                    value.innerText = lang || '--';
                    select.setAttribute('data-fold', updatedNode.attrs.fold ? 'true' : 'false');

                    return true;
                },
            };
        },
    };
});
