/* Copyright 2021, Milkdown by Mirone. */

import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
import format from 'xml-formatter';

import { config } from '../route/page-config';

export const sitemapPlugin = () =>
    ({
        name: 'vite-plugin-sitemap',
        enforce: 'pre',
        apply() {
            const routes = config.flatMap(({ items }) => items);
            const sitemapStream = new SitemapStream({ hostname: 'https://milkdown.dev/' });
            routes.forEach((url) => {
                sitemapStream.write({ url: url });
            });
            streamToPromise(sitemapStream)
                .then((sitemap) => {
                    return writeFile(resolve(__dirname, '../public/sitemap.xml'), format(sitemap.toString('utf-8')));
                })
                .catch(console.error);
            sitemapStream.end();
            return true;
        },
    } as const);
