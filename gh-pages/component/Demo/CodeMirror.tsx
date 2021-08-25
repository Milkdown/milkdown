import './codemirror.css';

import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { markdown } from '@codemirror/lang-markdown';
import React from 'react';

import className from './style.module.css';

type StateOptions = {
    onChange: (getString: () => string) => void;
    lock: React.MutableRefObject<boolean>;
    dark: boolean;
    value?: string;
};

const createCodeMirrorState = ({ onChange, lock, dark, value }: StateOptions) => {
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
            EditorView.theme(
                {
                    '&.cm-focused': {
                        outline: 'none',
                    },
                },
                { dark },
            ),
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
    dark: boolean;
};
export type CodeMirrorRef = { update: (markdown: string) => void };
export const CodeMirror = React.forwardRef<CodeMirrorRef, CodeMirrorProps>(({ value, onChange, lock, dark }, ref) => {
    const divRef = React.useRef<HTMLDivElement>(null);
    const editorRef = React.useRef<ReturnType<typeof createCodeMirrorView>>();
    const [focus, setFocus] = React.useState(false);

    React.useEffect(() => {
        if (!divRef.current) return;

        const editor = createCodeMirrorView({ root: divRef.current, onChange, lock, dark, value });
        editorRef.current = editor;

        return () => {
            editor.destroy();
        };
    }, [onChange, value, lock, dark]);

    React.useImperativeHandle(ref, () => ({
        update: (value: string) => {
            const { current } = editorRef;
            if (!current) return;

            current.setState(createCodeMirrorState({ onChange, lock, dark, value }));
        },
    }));

    return (
        <div
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            className={className.code + (focus ? ' ' + className.focus : '')}
        >
            <div ref={divRef} />
        </div>
    );
});
