export enum Theme {
    font = 'font',
    fontCode = 'font-code',
    neutral = 'neutral',
    solid = 'solid',
    shadow = 'shadow',
    primary = 'primary',
    secondary = 'secondary',
    line = 'line',
    background = 'background',
    surface = 'surface',
    radius = 'radius',
}

export type ThemePack = {
    light: Partial<Record<Theme, string>>;
    dark: Partial<Record<Theme, string>>;
} & Partial<Record<string, string>>;

const themeValue = (value: string) => (value.startsWith('#') ? `themeColor(${value})` : value);

export const theme = (options: ThemePack) => (_: unknown, mode: 'light' | 'dark') => {
    const { light, dark, ...rest } = options;
    const target = {
        ...rest,
        ...options[mode],
    };
    return Object.entries(target).reduce(
        (acc, [key, value]) => ({
            ...acc,
            [`--${key}`]: themeValue(value),
        }),
        {},
    );
};
