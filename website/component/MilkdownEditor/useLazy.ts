/* Copyright 2021, Milkdown by Mirone. */
import React from 'react';

export type Content = string | (() => Promise<{ default: string }>);

const notFound = `# 404

😿 This document is currently not been added.

💖 We're grateful if you're willing to help us improve it.`;

export const useLazy = (content: Content) => {
    const [md, setMd] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (typeof content === 'string') {
            setMd(content);
            setLoading(false);
            return;
        }
        setLoading(true);
        content()
            .then((s) => {
                setMd(s.default);
                setLoading(false);
                return;
            })
            .catch((e) => {
                console.error(e);
                setMd(notFound);
                setLoading(false);
            });
    }, [content]);

    return [loading, md] as const;
};
