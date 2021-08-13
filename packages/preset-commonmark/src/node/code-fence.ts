import { createCmdKey, createCmd } from '@milkdown/core';
import { createNode } from '@milkdown/utils';
import { createShortcut } from '@milkdown/utils';
import { setBlockType } from 'prosemirror-commands';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
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

const inputRegex = /^```(?<language>[a-z]*)? $/;

export const TurnIntoCodeFence = createCmdKey();

const id = 'fence';
export const codeFence = createNode<Keys, { languageList?: string[] }>((options, utils) => ({
    id,
    schema: {
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
                'div',
                {
                    'data-language': node.attrs.language,
                    class: utils.getClassName(node.attrs, 'code-fence'),
                },
                ['pre', ['code', { spellCheck: 'false' }, 0]],
            ];
        },
    },
    parser: {
        match: ({ type }) => type === 'code',
        runner: (state, node, type) => {
            const language = node.lang as string;
            const value = node.value as string;
            state.openNode(type, { language });
            state.addText(value);
            state.closeNode();
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.addNode('code', undefined, node.content.firstChild?.text || '', { lang: node.attrs.language });
        },
    },
    inputRules: (nodeType) => [
        textblockTypeInputRule(inputRegex, nodeType, ([ok, language]) => {
            if (!ok) return;
            return { language };
        }),
    ],
    commands: (nodeType) => [createCmd(TurnIntoCodeFence, () => setBlockType(nodeType))],
    shortcuts: {
        [SupportedKeys.CodeFence]: createShortcut(TurnIntoCodeFence, 'Mod-Alt-c'),
    },
    view: (editor, nodeType, node, view, getPos, decorations) => {
        if (options?.view) {
            return options.view(editor, nodeType, node, view, getPos, decorations);
        }
        const container = document.createElement('div');
        const selectWrapper = document.createElement('div');
        const select = document.createElement('ul');
        const pre = document.createElement('pre');
        const code = document.createElement('code');

        const valueWrapper = document.createElement('div');
        valueWrapper.className = 'code-fence_value';
        const value = document.createElement('span');
        const button = document.createElement('span');
        button.className = 'icon material-icons material-icons-outlined';
        button.textContent = 'expand_more';
        valueWrapper.appendChild(value);
        valueWrapper.appendChild(button);

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

        languageOptions.concat(options?.languageList || []).forEach((lang) => {
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

        container.append(selectWrapper, pre);
        container.setAttribute('class', utils.getClassName(node.attrs, 'code-fence'));
        container.setAttribute('data-language', node.attrs.language);
        value.innerText = node.attrs.language || '--';
        select.setAttribute('data-fold', node.attrs.fold ? 'true' : 'false');

        return {
            dom: container,
            contentDOM: code,
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
}));
