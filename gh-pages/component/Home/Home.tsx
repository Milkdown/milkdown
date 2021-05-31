import React from 'react';
import { Link } from 'react-router-dom';
import className from './style.module.css';

export const Home: React.FC = () => {
    return (
        <section className={className.body}>
            <section className={className.main}>
                <section className={className.logo}>
                    <img src="/milkdown/milkdown.svg" />
                </section>
                <h1 className={className.title}>Milkdown</h1>
                <p className={className.desc}>Plugin Based WYSIWYG Markdown Editor</p>
                <section className={className.buttons}>
                    <Link to="/getting-started">Get Started</Link>
                    <Link to="/online-demo">Online Demo</Link>
                </section>
            </section>
        </section>
    );
};
