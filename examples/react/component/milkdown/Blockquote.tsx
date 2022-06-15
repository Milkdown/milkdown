/* Copyright 2021, Milkdown by Mirone. */
import { FC, ReactNode } from 'react';

export const Blockquote: FC<{ children: ReactNode }> = ({ children }) => {
    return <div className="react-renderer blockquote">{children}</div>;
};
