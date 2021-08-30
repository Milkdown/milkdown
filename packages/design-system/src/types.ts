/* Copyright 2021, Milkdown by Mirone. */
export type PR<K extends string, V = string> = Partial<Record<K, V>>;

export type Color = 'neutral' | 'solid' | 'shadow' | 'primary' | 'secondary' | 'line' | 'background' | 'surface';

export type Font = 'typography' | 'code';

export type Size = 'radius' | 'lineWidth';

export type Slots = {
    icon: (id: string, config?: Record<string, string | number | boolean>) => HTMLElement;
};

export type MixinFactory = {
    scrollbar: (direction?: 'x' | 'y') => string;
    shadow: () => string;
    border: (direction?: 'left' | 'right' | 'top' | 'bottom') => string;
};

export type ThemePack = {
    scope?: string;
    color?: { light?: PR<Color>; dark?: PR<Color> } & PR<Color>;
    font?: PR<Font, string[]>;
    size?: PR<Size>;
    mixin?: (utils: Omit<ThemeTool, 'slots' | 'global' | 'mixin'>) => Partial<MixinFactory>;
    slots?: (utils: Omit<ThemeTool, 'slots' | 'global'>) => Partial<Slots>;
    global?: (utils: Omit<ThemeTool, 'global'>) => void;
};

export type ThemeTool = {
    palette: (key: Color, alpha?: number) => string;
    mixin: MixinFactory;
    slots: Slots;
    font: Record<Font, string>;
    size: Record<Size, string>;
};
