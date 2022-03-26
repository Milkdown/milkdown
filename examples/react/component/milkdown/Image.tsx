/* Copyright 2021, Milkdown by Mirone. */
import { useNodeCtx } from '@milkdown/react';
import React from 'react';

export const Image: React.FC = () => {
    const { node } = useNodeCtx();
    return <img className="image" src={node.attrs['src']} alt={node.attrs['alt']} title={node.attrs['tittle']} />;
};
