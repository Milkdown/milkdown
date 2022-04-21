/* Copyright 2021, Milkdown by Mirone. */

import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { prism } from '@milkdown/plugin-prism';
import { gfm } from '@milkdown/preset-gfm';
import { EditorRef, ReactEditor, useEditor } from '@milkdown/react';
import { nord, nordDark, nordLight } from '@milkdown/theme-nord';
import { outline, switchTheme } from '@milkdown/utils';
import { FC, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { isDarkModeCtx } from '../Context';
import { codeSandBox } from './codeSandBox';
import { Loading } from './Loading';
import className from './style.module.css';
import { Content, useLazy } from './useLazy';

type Props = {
    content: Content;
};

const NestedDiv: FC<{ level: number; children: ReactNode }> = ({ level, children }) => {
    if (level === 0) {
        return <>{children}</>;
    }

    return (
        <div className={className['pl-10px']}>
            <NestedDiv level={level - 1}>{children}</NestedDiv>
        </div>
    );
};

export const DocRenderer = ({ content }: Props) => {
    const editorRef = useRef<EditorRef>(null);
    const isDarkMode = useContext(isDarkModeCtx);
    const [outlines, setOutlines] = useState<Array<{ text: string; level: number }>>([]);
    const outlineRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    const [loading, md] = useLazy(content);

    const editor = useEditor(
        (root) => {
            const editor = Editor.make()
                .config((ctx) => {
                    ctx.set(rootCtx, root);
                    ctx.set(defaultValueCtx, md);
                    ctx.update(editorViewOptionsCtx, (prev) => ({ ...prev, editable: () => false }));
                    setReady(false);
                    ctx.get(listenerCtx).mounted((ctx) => {
                        setOutlines(outline()(ctx));
                        setReady(true);
                    });
                })
                .use(gfm)
                .use(listener)
                .use(codeSandBox)
                .use(prism)
                .use(nord);

            return editor;
        },
        [md],
    );

    useEffect(() => {
        if (!ready) return;
        const calc = () => {
            if (ready) {
                const editor$ = editorRef.current?.dom();
                const outline$ = outlineRef.current;
                if (!editor$ || !outline$) return;
                const rect = editor$.getBoundingClientRect();
                outline$.style.left = `${rect.right + 10}px`;
            }
        };
        const observer = new ResizeObserver((entries) => {
            if (entries) {
                calc();
            }
        });
        observer.observe(document.documentElement);

        return () => {
            observer.unobserve(document.documentElement);
        };
    }, [ready]);

    useEffect(() => {
        const editor = editorRef.current?.get();
        editor?.action(switchTheme(isDarkMode ? nordDark : nordLight));
    }, [isDarkMode]);

    return (
        <div className={className['doc-renderer']}>
            {loading ? <Loading /> : <ReactEditor ref={editorRef} editor={editor} />}
            <div ref={outlineRef} className={className['outline']}>
                {outlines.map((item, index) => {
                    const url = '#' + item.text.toLowerCase().split(' ').join('-');
                    return (
                        <div className={className['pl-10px']} key={index.toString()}>
                            <div className={className['outline-container']}>
                                <NestedDiv level={item.level}>
                                    <div className={className['outline-item']}>
                                        <a
                                            href={url}
                                            className={`no-underline truncate text-sm block pl-16px py-8px leading-20px ${
                                                location.hash === url ? className['active'] : ''
                                            }`}
                                        >
                                            {item.text}
                                        </a>
                                    </div>
                                </NestedDiv>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
