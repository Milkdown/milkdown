/* Copyright 2021, Milkdown by Mirone. */
import React from 'react';

export type Content = string | (() => Promise<{ default: string }>);

export const useLazy = (content: Content) => {
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
                setMd('# 404 Not Found');
                setLoading(false);
            });
    }, [content]);

    return [loading, md] as const;
};
