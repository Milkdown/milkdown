/* Copyright 2021, Milkdown by Mirone. */
import React from 'react';

export const Link: React.FC = ({ children }) => {
    return (
        <a className="link" href="#">
            {children}
        </a>
    );
};
