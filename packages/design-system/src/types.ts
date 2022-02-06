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

export type IconValue = {
    dom: HTMLElement;
    label: string;
};

// export type ThemePack = {
// color?: PR<Color>;
// font?: PR<Font, string[]>;
// size?: PR<Size>;
// mixin?: (utils: Omit<ThemeTool, 'slots' | 'global' | 'mixin'>) => Partial<MixinFactory>;
// icons?: (utils: Omit<ThemeTool, 'slots' | 'global'>) => Partial<Record<Icon, IconValue>>;
// global?: (utils: Omit<ThemeTool, 'global'>) => void;
// };

// export type ThemeTool = {
//     palette: (key: Color, alpha?: number) => string;
//     mixin: MixinFactory;
//     slots: Slots;
//     font: Record<Font, string>;
//     size: Record<Size, string>;
// };
