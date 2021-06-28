import type { DOMOutputSpec, NodeSpec, NodeType } from 'prosemirror-model';
import { SerializerNode, LoadState, CompleteContext, NodeParserSpec } from '@milkdown/core';

import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { Keymap } from 'prosemirror-commands';
import { EditorState } from 'prosemirror-state';
import { CommonNode } from '../utility';

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
];

type CodeFenceOptions = {
    languageList?: string[];
};

export class CodeFence extends CommonNode<CodeFenceOptions> {
    override readonly id = 'fence';
    override readonly schema: NodeSpec = {
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
                        throw new Error();
                    }
                    return { language: dom.dataset.language };
                },
            },
        ],
        toDOM: (node) => {
            const select = this.#createSelectElement(node.attrs.language) as unknown;
            const className = this.getClassName(node.attrs, 'code-fence');
            return [
                'div',
                {
                    'data-language': '',
                    class: className,
                },
                ['div', { contentEditable: 'false' }, select as DOMOutputSpec],
                ['pre', ['code', { spellCheck: 'false' }, 0]],
            ];
        },
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type }) => type === 'code',
        runner: (type, state, node) => {
            const lang = node.lang as string;
            const value = node.value as string;
            state.openNode(type, { language: lang });
            state.addText(value);
            state.closeNode();
        },
    };
    override readonly serializer: SerializerNode = (state, node) => {
        state.write('```' + node.attrs.language + '\n');
        state.text(node.textContent);
        state.ensureNewLine();
        state.write('```');
        state.closeBlock(node);
    };

    override readonly inputRules = (nodeType: NodeType) => [textblockTypeInputRule(/^```$/, nodeType)];

    override readonly keymap = (): Keymap => ({
        Tab: (state: EditorState, dispatch) => {
            const { tr, selection } = state;
            if (!dispatch) {
                return false;
            }
            dispatch(tr.insertText('  ', selection.from, selection.to));
            return true;
        },
    });

    #onChangeLanguage(top: number, left: number, language: string) {
        const { editorView } = this.context as CompleteContext;
        const result = editorView.posAtCoords({ top, left });

        if (!result) {
            return;
        }
        const transaction = editorView.state.tr.setNodeMarkup(result.inside, void 0, {
            language,
        });
        editorView.dispatch(transaction);
    }

    #createSelectElement(currentLanguage: string) {
        const select = document.createElement('select');
        select.className = 'code-fence_select';
        select.addEventListener('mousedown', (e) => {
            const { editorView } = this.context as CompleteContext;
            if (editorView.editable) return;

            e.preventDefault();
        });
        select.addEventListener('change', (e) => {
            if (this.context.loadState !== LoadState.Complete) {
                throw new Error('Should not trigger event before milkdown ready.');
            }

            const el = e.target as HTMLSelectElement | null;
            if (!el) return;
            const { top, left } = el.getBoundingClientRect();
            this.#onChangeLanguage(top, left, el.value);
        });

        languageOptions.concat(this.options.languageList || []).forEach((lang) => {
            const option = document.createElement('option');
            option.className = 'code-fence_select-option';
            option.value = lang;
            option.innerText = lang || '--';
            option.selected = currentLanguage === lang;
            select.appendChild(option);
        });
        return select;
    }
}
