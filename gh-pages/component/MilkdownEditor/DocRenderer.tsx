/* Copyright 2021, Milkdown by Mirone. */

import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { prism } from '@milkdown/plugin-prism';
import { gfm } from '@milkdown/preset-gfm';
import { EditorRef, ReactEditor, useEditor } from '@milkdown/react';
import { nord, nordDark, nordLight } from '@milkdown/theme-nord';
import { outline, switchTheme } from '@milkdown/utils';
import { useContext, useEffect, useRef, useState } from 'react';

import { isDarkModeCtx } from '../Context';
import { codeSandBox } from './codeSandBox';
import { Loading } from './Loading';
import { Outline, OutlineRenderer } from './Outline';
import className from './style.module.css';
import { Content, useLazy } from './useLazy';

type Props = {
    content: Content;
};

export const DocRenderer = ({ content }: Props) => {
    const editorRef = useRef<EditorRef>(null);
    const isDarkMode = useContext(isDarkModeCtx);
    const [outlines, setOutlines] = useState<Outline[]>([]);
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
        const main = document.querySelector('main');
        observer.observe(document.documentElement);
        if (main) {
            observer.observe(main);
        }

        return () => {
            observer.unobserve(document.documentElement);
            if (main) {
                observer.unobserve(main);
            }
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
                <OutlineRenderer outline={outlines} />
            </div>
        </div>
    );
};
