/* Copyright 2021, Milkdown by Mirone. */
import { stackOverFlow } from '@milkdown/exception';

type ElInstance<U> = {
    push: (node: U, ...rest: U[]) => void;
};

type StackCtx<T extends ElInstance<U>, U> = {
    readonly elements: T[];
};

export const getStackUtil = <Node, El extends ElInstance<Node>, Ctx extends StackCtx<El, Node>>() => {
    const size = (ctx: Ctx): number => ctx.elements.length;

    const top = (ctx: Ctx): El | undefined => ctx.elements[size(ctx) - 1];

    const push =
        (ctx: Ctx) =>
        (node: Node): void => {
            top(ctx)?.push(node);
        };

    const open =
        (ctx: Ctx) =>
        (node: El): void => {
            ctx.elements.push(node);
        };

    const close = (ctx: Ctx): El => {
        const el = ctx.elements.pop();
        if (!el) throw stackOverFlow();

        return el;
    };

    return {
        size,
        top,
        push,
        open,
        close,
    };
};
