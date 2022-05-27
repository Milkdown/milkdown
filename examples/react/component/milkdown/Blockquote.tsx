/* Copyright 2021, Milkdown by Mirone. */
import React, { ReactNode } from 'react';

export const Blockquote: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <div className="react-renderer blockquote">{children}</div>;
};
