import { AtRule } from 'postcss';

type ResultBasic = string | null | undefined | { [name: string]: ResultBasic };
type Result = Record<string, ResultBasic>;

export type Mixin<T extends unknown[] = []> = (mixin: AtRule, ...params: T[]) => void | Result;

export interface Renderer {
    Icon: Mixin<[type: string]>;
    ScrollBar: Mixin<[direction: 'col' | 'row']>;
    Shadow: Mixin;
    Line: Mixin;
    Border: Mixin;
}
