/* Copyright 2021, Milkdown by Mirone. */
import './codemirror.css';

import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
// import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { markdown } from '@codemirror/lang-markdown';
import {
    bracketMatching,
    defaultHighlightStyle,
    foldGutter,
    foldKeymap,
    indentOnInput,
    syntaxHighlighting,
} from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState, Extension } from '@codemirror/state';
import {
    crosshairCursor,
    drawSelection,
    dropCursor,
    EditorView,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    keymap,
    lineNumbers,
    rectangularSelection,
} from '@codemirror/view';
import React from 'react';

import className from './style.module.css';

const basicSetup: Extension = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
    ]),
];

type StateOptions = {
    onChange: (getString: () => string) => void;
    lock: React.MutableRefObject<boolean>;
    value?: string;
};

const createCodeMirrorState = ({ onChange, lock, value }: StateOptions) => {
    return EditorState.create({
        doc: value,
        extensions: [
            basicSetup,
            markdown(),
            EditorView.updateListener.of((v) => {
                if (v.focusChanged) {
                    lock.current = v.view.hasFocus;
                }
                if (v.docChanged) {
                    const getString = () => v.state.doc.toString();
                    onChange(getString);
                }
            }),
        ],
    });
};

type ViewOptions = {
    root: HTMLElement;
} & StateOptions;
const createCodeMirrorView = ({ root, ...options }: ViewOptions) => {
    return new EditorView({
        state: createCodeMirrorState(options),
        parent: root,
    });
};

type CodeMirrorProps = {
    value: string;
    onChange: (getString: () => string) => void;
    lock: React.MutableRefObject<boolean>;
};
export type CodeMirrorRef = { update: (markdown: string) => void };
export const CodeMirror = React.forwardRef<CodeMirrorRef, CodeMirrorProps>(({ value, onChange, lock }, ref) => {
    const divRef = React.useRef<HTMLDivElement>(null);
    const editorRef = React.useRef<ReturnType<typeof createCodeMirrorView>>();
    const [focus, setFocus] = React.useState(false);

    React.useEffect(() => {
        if (!divRef.current) return;

        const editor = createCodeMirrorView({ root: divRef.current, onChange, lock, value });
        editorRef.current = editor;

        return () => {
            editor.destroy();
        };
    }, [onChange, value, lock]);

    React.useImperativeHandle(ref, () => ({
        update: (value: string) => {
            const { current } = editorRef;
            if (!current) return;

            current.setState(createCodeMirrorState({ onChange, lock, value }));
        },
    }));

    return (
        <div
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            className={className['code'] + (focus ? ' ' + className['focus'] : '')}
        >
            <div ref={divRef} />
        </div>
    );
});
