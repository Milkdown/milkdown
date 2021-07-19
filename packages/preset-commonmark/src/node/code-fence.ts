import { createNode } from '@milkdown/utils';
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
            const lang = node.lang as string;
            const value = node.value as string;
            state.openNode(type, { language: lang });
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
    inputRules: (nodeType) => [textblockTypeInputRule(/^```$/, nodeType)],
    commands: (nodeType) => ({
        [SupportedKeys.CodeFence]: {
            defaultKey: 'Mod-Alt-c',
            command: setBlockType(nodeType),
        },
    }),
    view: (editor, nodeType, node, view, getPos, decorations) => {
        if (options?.view) {
            return options.view(editor, nodeType, node, view, getPos, decorations);
        }
        const container = document.createElement('div');
        const selectWrapper = document.createElement('div');
        const select = document.createElement('select');
        const pre = document.createElement('pre');
        const code = document.createElement('code');

        select.className = 'code-fence_select';
        select.addEventListener('mousedown', (e) => {
            if (view.editable) return;

            e.preventDefault();
        });
        select.addEventListener('change', (e) => {
            const el = e.target as HTMLSelectElement | null;
            if (!el) return;

            const { tr } = view.state;

            console.log(el.value);

            view.dispatch(
                tr.setNodeMarkup(getPos(), undefined, {
                    language: el.value,
                }),
            );
        });

        languageOptions.concat(options?.languageList || []).forEach((lang) => {
            const option = document.createElement('option');
            option.className = 'code-fence_select-option';
            option.value = lang;
            option.innerText = lang || '--';
            option.selected = node.attrs.language === lang;
            select.appendChild(option);
        });

        code.spellcheck = false;
        selectWrapper.contentEditable = 'false';

        selectWrapper.append(select);
        pre.append(code);
        container.append(selectWrapper, pre);

        container.setAttribute('class', utils.getClassName(node.attrs, 'code-fence'));
        container.setAttribute('data-language', node.attrs.language);

        return {
            dom: container,
            contentDOM: code,
            update: (updatedNode) => {
                if (updatedNode.type.name !== id) return false;

                container.dataset.language = updatedNode.attrs.language;

                return true;
            },
        };
    },
}));
