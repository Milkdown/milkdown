import type { MilkdownPlugin, Telemetry } from '@milkdown/ctx';
import { Ctx } from '@milkdown/ctx';
import type { Config } from '../internal-plugin';
export declare enum EditorStatus {
    Idle = "Idle",
    OnCreate = "OnCreate",
    Created = "Created",
    OnDestroy = "OnDestroy",
    Destroyed = "Destroyed"
}
export type OnStatusChange = (status: EditorStatus) => void;
export declare class Editor {
    #private;
    static make(): Editor;
    get ctx(): Ctx;
    get status(): EditorStatus;
    readonly enableInspector: (enable?: boolean) => this;
    readonly onStatusChange: (onChange: OnStatusChange) => this;
    readonly config: (configure: Config) => this;
    readonly removeConfig: (configure: Config) => this;
    readonly use: (plugins: MilkdownPlugin | MilkdownPlugin[]) => this;
    readonly remove: (plugins: MilkdownPlugin | MilkdownPlugin[]) => Promise<Editor>;
    readonly create: () => Promise<Editor>;
    readonly destroy: (clearPlugins?: boolean) => Promise<Editor>;
    readonly action: <T>(action: (ctx: Ctx) => T) => T;
    readonly inspect: () => Telemetry[];
}
//# sourceMappingURL=editor.d.ts.map