import { MilkdownPlugin } from '../utility';
import { createCtx } from '../context';
import { Config } from './config';

type PR<K extends string, V = string> = Partial<Record<K, V>>;

const themeColor = (hex: string) => {
    const hex2rgb = (hex: string) => {
        const rgbShorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
        const rgbRegex = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        const parse16 = (x: string) => parseInt(x, 16);

        const fullHex = hex.slice(1).replace(rgbShorthandRegex, (_, r, g, b) => {
            return r + r + g + g + b + b;
        });

        const [ok, r, g, b] = fullHex.match(rgbRegex) || [];

        return ok ? [r, g, b].map(parse16) : null;
    };

    const rgb = hex2rgb(hex);
    if (!rgb) {
        console.warn(`Invalid hex: ${hex}`);
        return hex;
    }

    return rgb.join(', ');
};

export type Color = 'neutral' | 'solid' | 'shadow' | 'primary' | 'secondary' | 'line' | 'background' | 'surface';

export type Font = 'font' | 'fontCode';

export type Size = 'radius' | 'lineWidth';

export type Widget = 'icon' | 'scrollbar' | 'shadow' | 'border';

export type WidgetFactory = {
    icon: (id: string) => string;
    scrollbar: (direction: 'x' | 'y') => string;
    shadow: () => string;
    border: () => string;
};

export type ThemePack = {
    color?: { light?: PR<Color>; dark?: PR<Color> } & PR<Color>;
    font?: PR<Font, string[]>;
    size?: PR<Size>;
    widget?: (utils: Omit<ThemeTool, 'widget'>) => Partial<WidgetFactory>;
};

export type ThemeTool = {
    size: PR<Size>;
    widget: Partial<WidgetFactory>;
    palette: (key: Color, alpha?: number) => string;
    fonts: (key: Font) => string;
};
export const themeToolCtx = createCtx<ThemeTool>({
    size: {},
    widget: {},
    fonts: () => '',
    palette: () => '',
});
export const themePackCtx = createCtx<ThemePack>({});
export const isDarkCtx = createCtx(false);

export const theme: MilkdownPlugin = (pre) => {
    pre.inject(themeToolCtx).inject(isDarkCtx).inject(themePackCtx, {});
    return async (ctx) => {
        await ctx.wait(Config);
        const isDark = ctx.get(isDarkCtx);
        const themePack = ctx.get(themePackCtx);
        const { color, font, size = {}, widget } = themePack;
        const palette = (key: Color, alpha = 1) => {
            const value = color?.[isDark ? 'dark' : 'light']?.[key] ?? color?.[key];
            return value ? `rgba(${themeColor(value)}, ${alpha})` : '';
        };
        const fonts = (key: Font) => {
            const value = font?.[key] ?? [];
            return value.join(', ');
        };

        ctx.set(themeToolCtx, {
            size,
            widget: widget?.({ size, palette, fonts }) || {},
            palette,
            fonts,
        });
    };
};
