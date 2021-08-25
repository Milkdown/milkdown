import { injectVar, pack2Tool, ThemePack, ThemeTool } from '@milkdown/design-system';

import { createCtx } from '../context';
import { MilkdownPlugin } from '../utility';

export const themeToolCtx = createCtx<ThemeTool>({
    widget: {},
    font: {},
    size: {},
    palette: () => '',
});

export { ThemeTool } from '@milkdown/design-system';

export const themeFactory =
    (themePack: ThemePack): MilkdownPlugin =>
    (pre) => {
        pre.inject(themeToolCtx);
        return (ctx) => {
            injectVar(themePack);
            const tool = pack2Tool(themePack);

            ctx.set(themeToolCtx, tool);
        };
    };
