import React from 'react';
import { useLocation } from 'react-router-dom';

import className from './style.module.css';

const copyright = 'MIT Licensed | Copyright © 2021-present Mirone Saul';

export const Footer: React.FC = () => {
    const location = useLocation();

    const classes = location.pathname === '/' ? [className.footer, className.footerHome] : [className.footer];

    return <footer className={classes.join(' ')}>{copyright}</footer>;
};
