import React from 'react';
import { NavLink as Link } from 'react-router-dom';

import className from './style.module.css';

const NavLink: React.FC<Item> = ({ title, link }) => (
    <Link className={className.link} activeClassName={className.active} to={link}>
        {title}
    </Link>
);

const NavSection: React.FC<Section> = ({ title, items }) => (
    <section className={className.section}>
        <section className={className.sectionTitle}>{title}</section>
        {items.map((item, i) => (
            <NavLink key={i.toString()} {...item} />
        ))}
    </section>
);

type Item = {
    title: string;
    link: string;
    content: string;
};
export type Section = {
    title: string;
    items: Item[];
};

type SidebarProps = {
    sections: Section[];
};

export const Sidebar: React.FC<SidebarProps> = ({ sections }) => (
    <nav className={className.sidebar}>
        {sections.map((section, i) => (
            <>
                <NavSection key={i.toString()} {...section} />
                {i < sections.length - 1 && <hr className={className.hr} />}
            </>
        ))}
    </nav>
);
