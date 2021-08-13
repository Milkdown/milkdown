import React from 'react';
import { Local, i18nConfig } from '../../route';
import { Mode } from '../constant';
import { localCtx } from '../Context';
import { MilkdownEditor, MilkdownRef } from '../MilkdownEditor';
import { CodeMirror, CodeMirrorRef } from './CodeMirror';
import className from './style.module.css';

type DemoProps = {
    mode: Mode;
    isDarkMode: boolean;
};

const importDemo = (local: Local) => {
    const route = i18nConfig[local].route;
    const path = ['index', route].filter((x) => x).join('.');
    return import(`./content/${path}.md`);
};

export const Demo = ({ mode, isDarkMode }: DemoProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const lockCode = React.useRef(false);
    const milkdownRef = React.useRef<MilkdownRef>(null);
    const codeMirrorRef = React.useRef<CodeMirrorRef>(null);
    const local = React.useContext(localCtx);
    const [md, setMd] = React.useState('');

    React.useEffect(() => {
        importDemo(local)
            .then((x) => {
                setMd(x.default);
                return;
            })
            .catch(console.error);
    }, [local]);

    const milkdownListener = React.useCallback((getMarkdown: () => string) => {
        const lock = lockCode.current;
        if (lock) return;

        const { current } = codeMirrorRef;
        if (!current) return;
        const result = getMarkdown();
        current.update(result);
    }, []);

    const onCodeChange = React.useCallback((getCode: () => string) => {
        const { current } = milkdownRef;
        if (!current) return;
        const value = getCode();
        current.update(value);
    }, []);

    const classes = [className.container, mode === Mode.TwoSide ? className.twoSide : ''].join(' ');

    return !md.length ? null : (
        <div ref={ref} className={classes}>
            <div className={className.milk}>
                <MilkdownEditor ref={milkdownRef} content={md} onChange={milkdownListener} />
            </div>
            <CodeMirror ref={codeMirrorRef} value={md} onChange={onCodeChange} dark={isDarkMode} lock={lockCode} />
        </div>
    );
};
