/* Copyright 2021, Milkdown by Mirone. */

import { ReactEditor, useEditor } from '@milkdown/react';
import { nordDark, nordLight } from '@milkdown/theme-nord';
import { switchTheme } from '@milkdown/utils';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { isDarkModeCtx } from '../Context';
import { docRendererFactory } from './docRendererFactory';
import { Loading } from './Loading';
import { Outline, OutlineRenderer } from './Outline';
import className from './style.module.css';
import { Content, useLazy } from './useLazy';

type Props = {
    content: Content;
};

export const DocRenderer = ({ content }: Props) => {
    const isDarkMode = useContext(isDarkModeCtx);
    const [outlines, setOutlines] = useState<Outline[]>([]);
    const outlineRef = useRef<HTMLDivElement>(null);
    const carbonRef = useRef<HTMLDivElement>(null);

    const [loading, md] = useLazy(content);

    const {
        editor,
        getInstance,
        getDom,
        loading: milkdownLoading,
    } = useEditor((root) => docRendererFactory(root, md, setOutlines), [md]);

    useEffect(() => {
        const calc = () => {
            if (!milkdownLoading) {
                const editor$ = getDom();
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
    }, [getDom, milkdownLoading]);

    useEffect(() => {
        if (milkdownLoading) return;
        const editor = getInstance();
        try {
            editor?.action(switchTheme(isDarkMode ? nordDark : nordLight));
        } catch {
            // do nothing
        }
    }, [getInstance, isDarkMode, milkdownLoading]);

    useLayoutEffect(() => {
        const wrapper = carbonRef.current;
        if (!wrapper) return;

        const observer = new MutationObserver(() => {
            Array.from(wrapper.children).forEach((node) => {
                if (!['carbonads', '_carbonads_js'].includes(node.id)) {
                    node.remove();
                }
            });
        });

        const carbon = document.createElement('script');

        carbon.async = true;
        carbon.type = 'text/javascript';
        carbon.src = '//cdn.carbonads.com/carbon.js?serve=CEAI62QJ&placement=milkdowndev';
        carbon.id = '_carbonads_js';

        wrapper.appendChild(carbon);

        observer.observe(wrapper, { childList: true });

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className={className['doc-renderer']}>
            {loading ? <Loading /> : <ReactEditor editor={editor} />}
            <div ref={outlineRef} className={className['outline']}>
                <OutlineRenderer outline={outlines} />
                <div className={className['carbon-wrapper']} ref={carbonRef} />
            </div>
        </div>
    );
};
