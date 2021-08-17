import { ThemeTool, ThemePack, pack2Tool, injectVar } from '@milkdown/design-system';
import { MilkdownPlugin } from '../utility';
import { createCtx } from '../context';

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
