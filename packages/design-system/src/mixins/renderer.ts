import { AtRule } from 'postcss';

type ResultBasic = string | null | undefined | { [name: string]: ResultBasic };
type Result = Record<string, ResultBasic>;

type Mixin<T extends unknown[] = []> = (mixin: AtRule, ...params: T[]) => void | Result;

export interface Renderer {
    Icon: Mixin<[string]>;
    ScrollBar: Mixin<['col' | 'row']>;
}
