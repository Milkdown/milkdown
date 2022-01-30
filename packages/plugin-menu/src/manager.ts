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

    constructor(originalConfig: Config, private utils: Utils, private ctx: Ctx, menu: HTMLElement, view: EditorView) {
        this.config = originalConfig
            .map((xs) =>
                xs.map((x) => ({
                    ...x,
                    $: this.$create(x, view),
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
                return [...xs, { ...dividerConfig, $: this.$create(dividerConfig, view) }];
            })
            .flat();
        this.config.forEach((x) => menu.appendChild(x.$));
    }

    public update(view: EditorView) {
        this.config.forEach((config) => {
            if (config.type === 'button') {
                if (config.active) {
                    const active = config.active(view);
                    if (active) {
                        config.$.classList.add('active');
                    } else {
                        config.$.classList.remove('active');
                    }
                }
                if (config.disabled) {
                    const disabled = config.disabled(view);
                    if (disabled) {
                        config.$.setAttribute('disabled', 'true');
                    } else {
                        config.$.removeAttribute('disabled');
                    }
                }
                return;
            }

            if (config.type === 'select') {
                if (config.disabled) {
                    const disabled = config.disabled(view);
                    const button = config.$.children[0];
                    if (button) {
                        if (disabled) {
                            config.$.classList.add('disabled');
                            button.setAttribute('disabled', 'true');
                        } else {
                            config.$.classList.remove('disabled');
                            button.removeAttribute('disabled');
                        }
                    }
                }
            }

            if (config.type === 'divider') {
                const disabled = config.group.every(
                    (x) => x.getAttribute('disabled') || x.classList.contains('disabled'),
                );
                if (disabled) {
                    config.$.classList.add('disabled');
                } else {
                    config.$.classList.remove('disabled');
                }
            }
        });
    }

    private $create(item: ButtonConfig | DividerConfig | SelectConfig, view: EditorView): HTMLElement {
        const { utils, ctx } = this;

        switch (item.type) {
            case 'button': {
                const $ = button(utils, item, ctx);
                return $;
            }
            case 'select': {
                const $ = select(utils, item, ctx, view);
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
