import { Context, Meta } from './ctx';

export const createContainer = () => {
    const contextMap: Map<symbol, Context> = new Map();

    const getCtx = <T>(meta: Meta<T>): Context<T> => {
        return contextMap.get(meta.id) as Context<T>;
    };

    return { getCtx, contextMap };
};
