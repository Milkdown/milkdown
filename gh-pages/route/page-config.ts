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
            'collaborative-editing',
            'i18n',
            'faq',
        ],
    },
    {
        dir: 'integrations',
        items: ['react', 'vue', 'svelte', 'solidjs', 'nextjs', 'angular', 'vue2'],
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
        items: ['design-system', 'using-themes', 'writing-themes', 'theme-pack-helper', 'theme-nord', 'theme-tokyo'],
    },
    {
        dir: 'official-plugins',
        items: [
            'preset-commonmark',
            'preset-gfm',
            'plugin-listener',
            'plugin-history',
            'plugin-prism',
            'plugin-tooltip',
            'plugin-slash',
            'plugin-menu',
            'plugin-indent',
            'plugin-trailing',
            'plugin-emoji',
            'plugin-collaborative',
            'plugin-upload',
            'plugin-cursor',
            'plugin-math',
            'plugin-diagram',
            'plugin-clipboard',
        ],
    },
    {
        dir: 'core-modules',
        items: ['core', 'prose', 'ctx', 'transformer'],
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
