/* Copyright 2021, Milkdown by Mirone. */
import { Node } from '@milkdown/prose/model';
import { useNodeCtx } from '@milkdown/react';
import { FC, ReactNode, useState } from 'react';

import { languageListSlice } from './codeFence.node';

export const CodeFence: FC<{ children: ReactNode }> = ({ children }) => {
    const { node, ctx, view, getPos } = useNodeCtx<Node>();
    const showInput = node.attrs['showInput'];
    const filename = node.attrs['filename'];
    const language = ctx.get(languageListSlice);

    const [input, setInput] = useState('');

    return (
        <div className="code-fence" style={{ border: '1px solid #ccc', padding: 10 }}>
            <div className="control" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span className="filename">
                    <span style={{ marginRight: 10 }}>{filename || 'No File Name'}</span>
                    {showInput ? (
                        <>
                            <input
                                onChange={(e) => {
                                    const { target } = e;
                                    if (!(target instanceof HTMLInputElement)) return;
                                    if (!view.editable) {
                                        return;
                                    }
                                    setInput(target.value);
                                }}
                            />
                            <button
                                onClick={() => {
                                    const { tr } = view.state;

                                    view.dispatch(
                                        tr.setNodeMarkup(getPos(), undefined, {
                                            ...node.attrs,
                                            filename: input,
                                            showInput: false,
                                        }),
                                    );
                                }}
                            >
                                OK
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                if (!view.editable) {
                                    return;
                                }
                                const show = node.attrs['showInput'];
                                const { tr } = view.state;
                                view.dispatch(
                                    tr.setNodeMarkup(getPos(), undefined, {
                                        ...node.attrs,
                                        showInput: !show,
                                    }),
                                );
                            }}
                        >
                            edit
                        </button>
                    )}
                </span>
                <select
                    defaultValue={node.attrs['language']}
                    onChange={(event) => {
                        const { target } = event;
                        if (!(target instanceof HTMLSelectElement) || !view || !node) {
                            return;
                        }
                        const { value } = target;
                        if (!view.editable) {
                            target.value = node.attrs['language'];
                            return;
                        }
                        const { tr } = view.state;
                        view.dispatch(
                            tr.setNodeMarkup(getPos(), undefined, {
                                ...node.attrs,
                                language: value,
                            }),
                        );
                    }}
                >
                    {language.map((lang) => (
                        <option key={lang} value={lang}>
                            {lang}
                        </option>
                    ))}
                </select>
            </div>
            <div
                className="code"
                style={{ background: '#ccc', margin: '0 auto', whiteSpace: 'pre', borderRadius: 4, padding: 10 }}
            >
                {children}
            </div>
        </div>
    );
};
