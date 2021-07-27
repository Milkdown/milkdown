import { contextNotFound } from '@milkdown/exception';
import { Context, Meta } from './ctx';

export const createContainer = () => {
    const contextMap: Map<symbol, Context> = new Map();

    const getCtx = <T>(meta: Meta<T>): Context<T> => {
        const context = contextMap.get(meta.id);
        if (!context) {
            throw contextNotFound();
        }
        return context as Context<T>;
    };

    return { getCtx, contextMap };
};
