/* Copyright 2021, Milkdown by Mirone. */
import { useNodeCtx } from '@milkdown/react';
import { FC } from 'react';

export const Image: FC = () => {
    const { node } = useNodeCtx();
    return (
        <img
            className="image"
            style={{ border: '1px solid red' }}
            src={node.attrs['src']}
            alt={node.attrs['alt']}
            title={node.attrs['tittle']}
        />
    );
};
