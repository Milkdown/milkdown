import React from 'react';

import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';

import { clipboard } from '@milkdown/plugin-clipboard';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { prism } from '@milkdown/plugin-prism';

import { emoji } from '@milkdown/plugin-emoji';
import '@milkdown/plugin-emoji/lib/style.css';

import { cursor } from '@milkdown/plugin-cursor';
import '@milkdown/plugin-cursor/lib/style.css';

import { math } from '@milkdown/plugin-math';
import '@milkdown/plugin-math/lib/style.css';

import { slash } from '@milkdown/plugin-slash';
import '@milkdown/plugin-slash/lib/style.css';

import { tooltip } from '@milkdown/plugin-tooltip';
import '@milkdown/plugin-tooltip/lib/style.css';

import { gfm } from '@milkdown/preset-gfm';
import '@milkdown/preset-gfm/lib/style.css';

import { ReactEditor, useEditor } from '@milkdown/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import className from './style.module.css';

type Props = {
    content: string | (() => Promise<{ default: string }>);
    readOnly?: boolean;
    onChange?: (getMarkdown: () => string) => void;
};

export const MilkdownEditor: React.FC<Props> = ({ content, readOnly, onChange }) => {
    const [md, setMd] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        if (typeof content === 'string') {
            setMd(content);
            setLoading(false);
            return;
        }
        content()
            .then((s) => {
                setMd(s.default);
                setLoading(false);
                return;
            })
            .catch((e) => {
                console.error(e);
                setLoading(false);
            });
    }, [content]);

    const editor = useEditor(
        (root) => {
            const editor = new Editor()
                .config((ctx) => {
                    ctx.set(rootCtx, root);
                    ctx.set(defaultValueCtx, md);
                    ctx.set(editorViewOptionsCtx, { editable: () => !readOnly });
                    ctx.set(listenerCtx, { markdown: onChange ? [onChange] : [] });
                })
                .use(clipboard)
                .use(gfm)
                .use(listener)
                .use(history)
                .use(cursor())
                .use(prism)
                .use(emoji)
                .use(tooltip)
                .use(math);

            if (!readOnly) {
                editor.use(slash);
            }
            return editor;
        },
        [readOnly, md],
    );

    return (
        <div className={className.editor}>
            {loading ? (
                <div className="milkdown">
                    <SkeletonTheme color="rgba(var(--background), 1)" highlightColor="rgba(var(--surface), 1)">
                        <Skeleton
                            height="3rem"
                            style={{
                                margin: '2.5rem 0',
                                width: '50%',
                                lineHeight: '3.5rem',
                            }}
                        />
                        <Skeleton height="1rem" style={{ lineHeight: '1.5rem', width: '80%' }} />
                        <Skeleton height="1rem" style={{ lineHeight: '1.5rem', width: '60%' }} />
                        <Skeleton height="1rem" style={{ lineHeight: '1.5rem', width: '90%' }} />
                        <Skeleton height="1rem" style={{ lineHeight: '1.5rem', width: '70%' }} />
                        <Skeleton height="1rem" style={{ lineHeight: '1.5rem', width: '80%' }} />
                    </SkeletonTheme>
                </div>
            ) : (
                <ReactEditor editor={editor} />
            )}
        </div>
    );
};
