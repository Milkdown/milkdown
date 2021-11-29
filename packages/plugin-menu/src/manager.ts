/* Copyright 2021, Milkdown by Mirone. */

import { Ctx } from '@milkdown/core';
import { EditorView } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import { button, ButtonConfig } from './button';
import { Config, ConfigItem } from './default-config';
import { divider, DividerConfig } from './divider';
import { select, SelectConfig } from './select';

type InnerConfig = (ConfigItem | DividerConfig) & { $: HTMLElement };

export class Manager {
    private config: InnerConfig[];

    constructor(originalConfig: Config, private utils: Utils, private ctx: Ctx, menu: HTMLElement) {
        this.config = originalConfig
            .map((xs) =>
                xs.map((x) => ({
                    ...x,
                    $: this.$create(x),
                })),
            )
            .map((xs, i): Array<InnerConfig> => {
                if (i === originalConfig.length - 1) {
                    return xs;
                }
                const dividerConfig: DividerConfig = {
                    type: 'divider',
                    group: xs.map((x) => x.$),
                };
                return [...xs, { ...dividerConfig, $: this.$create(dividerConfig) }];
            })
            .flat();
        this.config.forEach((x) => menu.appendChild(x.$));
    }

    public update(view: EditorView) {
        view;
    }

    private $create(item: ButtonConfig | DividerConfig | SelectConfig): HTMLElement {
        const { utils, ctx } = this;

        switch (item.type) {
            case 'button': {
                const $ = button(utils, item, ctx);
                return $;
            }
            case 'select': {
                const $ = select(utils, item);
                return $;
            }
            case 'divider': {
                const $ = divider(utils);
                return $;
            }
            default:
                throw new Error();
        }
    }
}
