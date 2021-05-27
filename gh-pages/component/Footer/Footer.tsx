import { LocationType, useLocationType } from '../hooks/useLocationType';
import React from 'react';

import className from './style.module.css';

const copyright = 'MIT Licensed | Copyright © 2021-present Mirone Saul';

export const Footer: React.FC = () => {
    const locationType = useLocationType();

    const classes = locationType === LocationType.Home ? [className.footer, className.footerHome] : [className.footer];

    return <footer className={classes.join(' ')}>{copyright}</footer>;
};
