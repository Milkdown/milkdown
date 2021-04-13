import type { DOMOutputSpec, NodeSpec, NodeType } from 'prosemirror-model';
import type { ParserSpec } from '../parser/types';
import type { SerializerNode } from '../serializer/types';

import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { Node } from '../abstract';
import { LoadState } from '../editor';

const languageOptions = [
    '',
    'javascript',
    'typescript',
    'bash',
    'sql',
    'json',
    'c',
    'cpp',
    'java',
    'ruby',
    'python',
    'go',
    'rust',
];

export class CodeFence extends Node {
    name = 'fence';
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
        block: this.name,
        getAttrs: (tok) => ({ language: tok.info }),
    };
    serializer: SerializerNode = (state, node) => {
        state.write('```' + node.attrs.language + '\n');
        state.text(node.textContent);
        state.ensureNewLine();
        state.write('```');
        state.closeBlock(node);
    };
    inputRules = (nodeType: NodeType) => [textblockTypeInputRule(/^```$/, nodeType)];

    private onChangeLanguage(top: number, left: number, language: string) {
        const { view } = this.editor;
        const result = view.posAtCoords({ top, left });

        if (!result) {
            return;
        }
        const transaction = view.state.tr.setNodeMarkup(result.inside, void 0, {
            language,
        });
        view.dispatch(transaction);
    }

    private createSelectElement(currentLanguage: string) {
        const select = document.createElement('select');
        select.className = 'code-fence_select';
        select.addEventListener('change', (e) => {
            if (this.editor.loadState !== LoadState.Complete) {
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
