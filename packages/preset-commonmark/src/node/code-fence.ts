import type { DOMOutputSpec, NodeSpec, NodeType } from 'prosemirror-model';
import { ParserSpec, SerializerNode, Node, LoadState, ProsemirrorReadyContext } from '@milkdown/core';

import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { Keymap } from 'prosemirror-commands';
import { EditorState } from 'prosemirror-state';

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

export class CodeFence extends Node {
    id = 'fence';
    schema: NodeSpec = {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { tag: 'pre', preserveWhitespace: 'full', getAttrs: (dom: any) => ({ language: dom.dataset.language }) },
        ],
        toDOM: (node) => {
            const select = this.createSelectElement(node.attrs.language) as unknown;
            return [
                'div',
                {
                    'data-language': node.attrs.language,
                    class: 'code-fence',
                },
                ['div', { contentEditable: 'false' }, select as DOMOutputSpec],
                ['pre', ['code', { spellCheck: 'false' }, 0]],
            ];
        },
    };
    parser: ParserSpec = {
        block: this.id,
        getAttrs: (tok) => ({ language: tok.info }),
        isAtom: true,
    };
    serializer: SerializerNode = (state, node) => {
        state.write('```' + node.attrs.language + '\n');
        state.text(node.textContent);
        state.ensureNewLine();
        state.write('```');
        state.closeBlock(node);
    };

    override inputRules = (nodeType: NodeType) => [textblockTypeInputRule(/^```$/, nodeType)];

    override keymap = (): Keymap => ({
        Tab: (state: EditorState, dispatch) => {
            const { tr, selection } = state;
            if (!dispatch) {
                return false;
            }
            dispatch(tr.insertText('  ', selection.from, selection.to));
            return true;
        },
    });

    private onChangeLanguage(top: number, left: number, language: string) {
        const { editorView } = this.context as ProsemirrorReadyContext;
        const result = editorView.posAtCoords({ top, left });

        if (!result) {
            return;
        }
        const transaction = editorView.state.tr.setNodeMarkup(result.inside, void 0, {
            language,
        });
        editorView.dispatch(transaction);
    }

    private createSelectElement(currentLanguage: string) {
        const select = document.createElement('select');
        select.className = 'code-fence_select';
        select.addEventListener('mousedown', (e) => {
            const { editorView } = this.context as ProsemirrorReadyContext;
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
            this.onChangeLanguage(top, left, el.value);
        });
        languageOptions.forEach((lang) => {
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
