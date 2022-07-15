/* Copyright 2021, Milkdown by Mirone. */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { i18nConfig, Local } from '../../route';
import { Mode } from '../constant';
import { editorModeCtx, isDarkModeCtx, setEditorModeCtx, setIsDarkModeCtx, setLocalCtx } from '../Context';
import { useEditorMode } from '../hooks/userEditorMode';
import { useRoot } from '../hooks/useRoot';
import className from './style.module.css';

const materialIcon = `${className['icon']} material-icons-outlined`;

const LanguageList: React.FC<{ show: boolean; setShow: (show: boolean) => void }> = ({ show, setShow }) => {
    const root = useRoot();
    const setLocal = React.useContext(setLocalCtx);
    const navigate = useNavigate();
    const location = useLocation();

    return !show ? null : (
        <ul
            className={className['langList']}
            onClick={(e) => {
                e.stopPropagation();
                const { target } = e;
                if (!(target instanceof HTMLLIElement)) return;
                const { value, route } = target.dataset;
                if (!value) return;

                const path = location.pathname
                    .split('/')
                    .filter((x) => x)
                    .filter((x) => x !== root);
                setLocal(value as Local);
                setShow(false);
                const prefix = route;
                const next = [prefix, ...path].filter((x) => x).join('/');
                navigate('/' + next);
            }}
        >
            {Object.entries(i18nConfig).map(([key, { display, route }]) => (
                <li className={className['langItem']} data-value={key} data-route={route} key={key}>
                    {display}
                </li>
            ))}
        </ul>
    );
};

export const Buttons: React.FC = () => {
    const editorMode = React.useContext(editorModeCtx);
    const isDarkMode = React.useContext(isDarkModeCtx);
    const setEditorMode = React.useContext(setEditorModeCtx);
    const setIsDarkMode = React.useContext(setIsDarkModeCtx);
    const showEditorToggle = useEditorMode();
    const [showLangList, setShowLangList] = React.useState(false);

    const onEditorModeToggle = () => setEditorMode((m) => (m === Mode.Default ? Mode.TwoSide : Mode.Default));

    React.useEffect(() => {
        const hideList = () => {
            setShowLangList(false);
        };
        const body = document.body;
        body.addEventListener('click', hideList);

        if (docsearch && typeof docsearch === 'function') {
            docsearch({
                appId: 'ESBZP4AW9O',

                apiKey: '3c3f00caad4516fb13f96aea068122af',

                indexName: 'milkdown',

                container: '#docsearch',

                debug: true, // Set debug to true if you want to inspect the modal
            });
        }

        return () => {
            body.removeEventListener('click', hideList);
        };
    }, []);

    return (
        <div className={className['part']}>
            {showEditorToggle && (
                <span onClick={() => onEditorModeToggle()} className={[materialIcon, className['mode']].join(' ')}>
                    {editorMode === Mode.Default ? 'chrome_reader_mode' : 'wysiwyg'}
                </span>
            )}
            <div className={className['translate']}>
                <span
                    className={materialIcon}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowLangList(true);
                    }}
                >
                    translate
                </span>
                <LanguageList show={showLangList} setShow={setShowLangList} />
            </div>
            <span onClick={() => setIsDarkMode(!isDarkMode)} className={materialIcon}>
                {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
            <a href="https://github.com/Saul-Mirone/milkdown" target="_blank" className={className['github']}>
                <span className={className['icon']}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                </span>
            </a>
            <div id="docsearch"></div>
        </div>
    );
};
