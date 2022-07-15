/* Copyright 2021, Milkdown by Mirone. */
import React, { useEffect, useState } from 'react';
import { NavLink as Link, useLocation } from 'react-router-dom';

import type { Item, Section } from '../../route';
import { displaySidebarCtx, sectionsCtx } from '../Context';
import { useDisplaySidebar } from '../hooks/useDisplaySidebar';
import className from './style.module.css';

const NavLink: React.FC<Item> = ({ title, link }) => (
    <Link
        className={({ isActive }) => {
            return [className['link'], isActive ? className['active'] : ''].join(' ');
        }}
        to={link}
    >
        {title}
    </Link>
);

const NavSection: React.FC<Section> = ({ title, items }) => {
    const [fold, setFold] = useState(true);
    const location = useLocation();

    useEffect(() => {
        setFold(items.findIndex((item) => item.link === location.pathname) === -1);
    }, [items, location.pathname]);

    return (
        <section className={className['section']}>
            <section onClick={() => setFold((x) => !x)} className={className['sectionTitle']}>
                {title}
            </section>
            {!fold && items.map((item, i) => <NavLink key={i.toString()} {...item} />)}
        </section>
    );
};

export const Sidebar: React.FC = () => {
    const sections = React.useContext(sectionsCtx);
    const display = React.useContext(displaySidebarCtx);
    useDisplaySidebar();
    const navClassName = React.useMemo(() => `${className['sidebar']} ${display ? '' : className['fold']}`, [display]);

    return (
        <nav className={navClassName}>
            {sections.map((section, i) => (
                <section key={i.toString()}>
                    <NavSection key={i.toString()} {...section} />
                    {i < sections.length - 1 && <hr className={className['hr']} />}
                </section>
            ))}
        </nav>
    );
};
