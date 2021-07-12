import React from 'react';

import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup';
import { markdown } from '@codemirror/lang-markdown';

import { MilkdownEditor } from '../MilkdownEditor/MilkdownEditor';
import className from './style.module.css';
import './codemirror.css';

export enum Mode {
    Default,
    TwoSide,
}

type DemoProps = {
    content: string;
    mode: Mode;
    isDarkMode: boolean;
};

function createCodeMirror(
    root: HTMLElement,
    onChange: (getString: () => string) => void,
    lock: React.MutableRefObject<boolean>,
    dark: boolean,
    defaultValue?: string,
) {
    return new EditorView({
        state: EditorState.create({
            doc: defaultValue,
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
        }),
        parent: root,
    });
}

const CodeMirror = ({
    value,
    onChange,
    lock,
    dark,
}: {
    value: string;
    onChange: (getString: () => string) => void;
    lock: React.MutableRefObject<boolean>;
    dark: boolean;
}): JSX.Element => {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!ref.current) return;

        const editor = createCodeMirror(ref.current, onChange, lock, dark, value);

        return () => {
            editor.destroy();
        };
    }, [onChange, value, lock, dark]);

    return (
        <div className={className.code}>
            <div ref={ref} />
        </div>
    );
};

export const Demo = ({ content, mode, isDarkMode }: DemoProps): JSX.Element => {
    const defaultValueForCode = React.useRef(content);
    const defaultValueForMilkdown = React.useRef(content);
    const [stateCountMilkdown, setStateCountMilkdown] = React.useState(0);
    const [stateCountCode, setStateCountCode] = React.useState(0);
    const triggerMilkdown = React.useCallback(() => setStateCountMilkdown((x) => x + 1), []);
    const triggerCode = React.useCallback(() => setStateCountCode((x) => x + 1), []);
    const lockCode = React.useRef(false);

    const milkdownListener = React.useCallback(
        (getMarkdown: () => string) => {
            if (lockCode.current) return;

            const result = getMarkdown();
            if (result === defaultValueForCode.current) return;
            defaultValueForCode.current = result;
            triggerCode();
        },
        [triggerCode],
    );

    const onCodeChange = React.useCallback(
        (getCode: () => string) => {
            const value = getCode();
            if (value === defaultValueForMilkdown.current) return;
            defaultValueForMilkdown.current = value;
            triggerMilkdown();
        },
        [triggerMilkdown],
    );

    const classes = [className.container, mode === Mode.TwoSide ? className.twoSide : ''].join(' ');

    return (
        <div className={classes}>
            <div className={className.milk}>
                <MilkdownEditor
                    key={'milkdown' + stateCountMilkdown.toString()}
                    content={defaultValueForMilkdown.current}
                    onChange={milkdownListener}
                />
            </div>
            <CodeMirror
                key={'code' + stateCountCode.toString()}
                value={defaultValueForCode.current}
                onChange={onCodeChange}
                dark={isDarkMode}
                lock={lockCode}
            />
        </div>
    );
};
