import { LocationType, useLocationType } from '../hooks/useLocationType';
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
    display: boolean;
    setDisplay: (display: boolean) => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ sections, setDisplay, display }) => {
    const [locationType, location] = useLocationType();

    React.useEffect(() => {
        if (locationType !== LocationType.Page) {
            setDisplay(false);
            return;
        }
        if (document.documentElement.clientWidth < 1080) {
            setDisplay(false);
            return;
        }
        setDisplay(true);
    }, [locationType, setDisplay, location]);

    const navClassName = React.useMemo(() => `${className.sidebar} ${display ? '' : className.fold}`, [display]);

    return (
        <nav className={navClassName}>
            {sections.map((section, i) => (
                <section key={i.toString()}>
                    <NavSection key={i.toString()} {...section} />
                    {i < sections.length - 1 && <hr className={className.hr} />}
                </section>
            ))}
        </nav>
    );
};
