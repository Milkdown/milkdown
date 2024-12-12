import type { Ctx, SliceType } from '@milkdown/ctx';
import type { Command } from '@milkdown/prose/state';
import type { $Ctx } from '../$ctx';
import type { $Shortcut, Keymap } from '../$shortcut';
export type KeymapConfig<K extends string> = Record<K, string | string[]>;
export interface KeymapItem {
    shortcuts: string | string[];
    command: (ctx: Ctx) => Command;
}
export type UserKeymapConfig<Key extends string> = Record<Key, KeymapItem>;
export type $UserKeymap<N extends string, Key extends string> = [
    $Ctx<KeymapConfig<Key>, `${N}Keymap`>,
    $Shortcut
] & {
    key: SliceType<KeymapConfig<Key>, `${N}Keymap`>;
    keymap: Keymap;
    ctx: $Ctx<KeymapConfig<Key>, `${N}Keymap`>;
    shortcuts: $Shortcut;
};
export declare function $useKeymap<N extends string, Key extends string>(name: N, userKeymap: UserKeymapConfig<Key>): $UserKeymap<N, Key>;
//# sourceMappingURL=$user-keymap.d.ts.map