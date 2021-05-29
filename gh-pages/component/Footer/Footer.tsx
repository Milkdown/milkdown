import React from 'react';

import className from './style.module.css';

const copyright = 'MIT Licensed | Copyright © 2021-present Mirone Saul';

export const Footer: React.FC = () => {

    return <footer className={className.footer}>{copyright}</footer>;
};
