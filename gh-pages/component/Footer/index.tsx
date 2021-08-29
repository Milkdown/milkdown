/* Copyright 2021, Milkdown by Mirone. */
import React from 'react';

import { LocationType, useLocationType } from '../hooks/useLocationType';
import className from './style.module.css';

const copyright = 'MIT Licensed | Copyright © 2021-present Mirone ♡ Meo';

export const Footer: React.FC = () => {
    const [locationType] = useLocationType();

    const classes = [className.footer, locationType === LocationType.Home ? className.homepage : ''].join(' ');

    return <footer className={classes}>{copyright}</footer>;
};
