/* Copyright 2021, Milkdown by Mirone. */
import type { ConfigItem, Local } from './page-router';

export const config: ConfigItem[] = [
    {
        dir: 'guide',
        items: [
            'why-milkdown',
            'getting-started',
            'interacting-with-editor',
            'commands',
            'styling',
            'keyboard-shortcuts',
            'macros',
        ],
    },
    {
        dir: 'integrations',
        items: ['react', 'vue', 'angular', 'svelte', 'vue2'],
    },
    {
        dir: 'plugins',
        items: [
            'using-plugins',
            'plugins-101',
            'plugin-factories',
            'composable-plugins',
            'example-iframe-plugin',
            'internal-plugins',
        ],
    },
    {
        dir: 'theme',
        items: ['design-system', 'using-themes', 'writing-themes'],
    },
    {
        dir: 'reference-manual',
        items: [
            'core',
            'prose',
            'preset-commonmark',
            'preset-gfm',
            'plugin-listener',
            'plugin-prism',
            'plugin-tooltip',
            'plugin-slash',
            'plugin-menu',
            'plugin-math',
            'ctx',
            'transformer',
        ],
    },
];

export const i18nConfig: Record<Local, { display: string; route: string }> = {
    en: {
        display: 'English',
        route: '',
    },
    'zh-hans': {
        display: '简体中文',
        route: 'zh-hans',
    },
};
