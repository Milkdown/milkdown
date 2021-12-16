/* Copyright 2021, Milkdown by Mirone. */
export type PR<K extends string, V = string> = Partial<Record<K, V>>;

export type Color = 'neutral' | 'solid' | 'shadow' | 'primary' | 'secondary' | 'line' | 'background' | 'surface';

export type Font = 'typography' | 'code';

export type Size = 'radius' | 'lineWidth';

export type Icon =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'loading'
    | 'quote'
    | 'code'
    | 'table'
    | 'divider'
    | 'image'
    | 'brokenImage'
    | 'bulletList'
    | 'orderedList'
    | 'taskList'
    | 'bold'
    | 'italic'
    | 'inlineCode'
    | 'strikeThrough'
    | 'link'
    | 'leftArrow'
    | 'rightArrow'
    | 'upArrow'
    | 'downArrow'
    | 'alignLeft'
    | 'alignRight'
    | 'alignCenter'
    | 'delete'
    | 'select'
    | 'unchecked'
    | 'checked'
    | 'undo'
    | 'redo'
    | 'liftList'
    | 'sinkList';

export type Slots = {
    icon: (id: Icon, config?: Record<string, string | number | boolean>) => HTMLElement;
    label: (id: Icon, config?: Record<string, string | number | boolean>) => string;
};

export type MixinFactory = {
    scrollbar: (direction?: 'x' | 'y') => string;
    shadow: () => string;
    border: (direction?: 'left' | 'right' | 'top' | 'bottom') => string;
};

export type ThemePack = {
    scope?: string;
    color?: PR<Color>;
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
