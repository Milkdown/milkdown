/* Copyright 2021, Milkdown by Mirone. */
import { FC, ReactNode } from 'react';

export const Paragraph: FC<{ children: ReactNode }> = ({ children }) => (
    <div className="react-renderer paragraph">{children}</div>
);
