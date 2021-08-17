import { injectGlobal } from '@emotion/css';
import { MilkdownPlugin } from '../utility';
import { createCtx } from '../context';

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

const obj2var = <T extends string, U>(x: PR<T, U> = {}, transform = (x: U): string => `${x}`) =>
    Object.entries(x)
        .map(([k, v]) => {
            return `--${k}: ${transform(v as U)};`;
        })
        .join('\n');
const obj2color = (x: PR<Color> = {}) => obj2var(x, themeColor);

export type Color = 'neutral' | 'solid' | 'shadow' | 'primary' | 'secondary' | 'line' | 'background' | 'surface';

export type Font = 'font' | 'fontCode';

export type Size = 'radius' | 'lineWidth';

export type Widget = 'icon' | 'scrollbar' | 'shadow' | 'border';

export type WidgetFactory = {
    icon: (id: string) => string;
    scrollbar: (direction?: 'x' | 'y') => string;
    shadow: () => string;
    border: () => string;
};

export type ThemePack = {
    scope?: string;
    color?: { light?: PR<Color>; dark?: PR<Color> } & PR<Color>;
    font?: PR<Font, string[]>;
    size?: PR<Size>;
    widget?: (utils: Omit<ThemeTool, 'widget' | 'global'>) => Partial<WidgetFactory>;
    global?: (utils: Omit<ThemeTool, 'global'>) => void;
};

export type ThemeTool = {
    widget: Partial<WidgetFactory>;
    palette: (key: Color, alpha?: number) => string;
    font: PR<Font>;
    size: PR<Size>;
};
export const themeToolCtx = createCtx<ThemeTool>({
    widget: {},
    font: {},
    size: {},
    palette: () => '',
});

export const themeFactory =
    (themePack: ThemePack): MilkdownPlugin =>
    (pre) => {
        pre.inject(themeToolCtx);
        return (ctx) => {
            const { color = {}, font, size = {}, widget, global } = themePack;
            const { light, dark, ...rest } = color;

            const palette = (key: Color, alpha = 1) => {
                return `rgba(var(--${key}), ${alpha})`;
            };
            const toMap = <T extends string, U>(x: PR<T, U> = {}): PR<T> =>
                Object.fromEntries(
                    Object.keys(x).map((k) => {
                        return [k, `var(--${k})`];
                    }),
                ) as PR<T>;

            const tool = {
                palette,
                size: toMap(size),
                font: toMap(font),
            };

            injectGlobal`
                :root {
                    ${obj2color(light)}
                    ${obj2color(rest)}
                    ${obj2var(font, (x) => x.join(', '))}
                    ${obj2var(size)}
                }
                [data-theme="dark"] {
                    ${obj2color(dark)}
                }
            `;
            global?.({
                ...tool,
                widget: widget?.(tool) || {},
            });

            ctx.set(themeToolCtx, {
                widget: widget?.(tool) || {},
                ...tool,
            });
        };
    };
