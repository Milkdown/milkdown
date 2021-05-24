import React from 'react';
import { Editor } from '@milkdown/core';
import { marks, nodes } from '@milkdown/preset-commonmark';
import { prism } from '@milkdown/plugin-prism';
import { tooltip } from '@milkdown/plugin-tooltip';
import { math } from '@milkdown/plugin-math';
import { table } from '@milkdown/plugin-table';
import { slash } from '@milkdown/plugin-slash';

import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/plugin-math/lib/style.css';
import '@milkdown/plugin-table/lib/style.css';
import '@milkdown/plugin-tooltip/lib/style.css';
import '@milkdown/plugin-slash/lib/style.css';

export const editor = (root: HTMLElement, content: string) =>
    new Editor({
        root,
        defaultValue: content,
        listener: {
            markdown: [(getValue) => console.log(getValue())],
        },
    })
        .use(nodes)
        .use(marks)
        .use(prism)
        .use(tooltip)
        .use(table)
        .use(math)
        .use(slash)
        .create();

type Props = {
    content: string;
};

export const MilkdownEditor: React.FC<Props> = ({ content }) => {
    const divRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!divRef.current) {
            throw new Error();
        }
        editor(divRef.current, content);
        return () => {
            divRef.current?.remove();
        };
    }, [content]);

    return <div className="milkdown-demo" ref={divRef} />;
};
