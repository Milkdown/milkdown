import React from 'react';
import { Link } from 'react-router-dom';
import className from './style.module.css';

export const Home: React.FC = () => (
    <section className={className.body}>
        <section className={className.main}>
            <div className={className.container}>
                <div className={className.content}>
                    <h1 className={className.title}>Milkdown</h1>
                    <p className={className.desc}>Plugin Based WYSIWYG Markdown Editor</p>
                    <section className={className.buttons}>
                        <Link to="/getting-started">Get Started</Link>
                        <Link to="/online-demo">Online Demo</Link>
                    </section>
                </div>
                <section className={className.logo}>
                    <img src="/milkdown/milkdown-homepage.svg" />
                </section>
            </div>
        </section>
        <div className={className.curve}>
            <svg viewBox="0 0 1152 73">
                <path d="M99.0331 0.252716C59.2655 0.284556 0 25.2197 0 25.2197V0.252716H99.0331C99.0585 0.252696 99.0839 0.252686 99.1093 0.252686C99.1538 0.252686 99.1982 0.252696 99.2427 0.252716H1152V73C1018.73 21.6667 957.818 24.4226 819.692 22.7693C672.54 21.008 573.085 73 427.919 73C308.414 73 218.068 0.307089 99.2427 0.252716H99.0331Z" />
            </svg>
        </div>
    </section>
);
