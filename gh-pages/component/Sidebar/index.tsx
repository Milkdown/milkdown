/* Copyright 2021, Milkdown by Mirone. */
import React from 'react';
import { NavLink as Link } from 'react-router-dom';

import type { Item, Section } from '../../route';
import { displaySidebarCtx, sectionsCtx } from '../Context';
import { useDisplaySidebar } from '../hooks/useDisplaySidebar';
import className from './style.module.css';

const NavLink: React.FC<Item> = ({ title, link }) => (
    <Link className={({ isActive }) => [className['link'], isActive ? className['active'] : ''].join(' ')} to={link}>
        {title}
    </Link>
);

const NavSection: React.FC<Section> = ({ title, items }) => (
    <section className={className['section']}>
        <section className={className['sectionTitle']}>{title}</section>
        {items.map((item, i) => (
            <NavLink key={i.toString()} {...item} />
        ))}
    </section>
);

export const Sidebar: React.FC = () => {
    const sections = React.useContext(sectionsCtx);
    const display = React.useContext(displaySidebarCtx);
    const ref = useDisplaySidebar();
    const navClassName = React.useMemo(() => `${className['sidebar']} ${display ? '' : className['fold']}`, [display]);

    return (
        <nav ref={ref} className={navClassName}>
            {sections.map((section, i) => (
                <section key={i.toString()}>
                    <NavSection key={i.toString()} {...section} />
                    {i < sections.length - 1 && <hr className={className['hr']} />}
                </section>
            ))}
        </nav>
    );
};
