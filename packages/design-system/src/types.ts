// Shortcut
export type PR<K extends string, V = string> = Partial<Record<K, V>>;

export type Color = 'neutral' | 'solid' | 'shadow' | 'primary' | 'secondary' | 'line' | 'background' | 'surface';

export type Font = 'font' | 'fontCode';

export type Size = 'radius' | 'lineWidth';
