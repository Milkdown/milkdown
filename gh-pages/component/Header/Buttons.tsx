import React from 'react';
import { Mode } from '../constant';
import { editorModeCtx, isDarkModeCtx, setEditorModeCtx, setIsDarkModeCtx } from '../Context';
import { useEditorMode } from '../hooks/userEditorMode';
import className from './style.module.css';

const materialIcon = `${className.icon} material-icons-outlined`;

export const Buttons: React.FC = () => {
    const editorMode = React.useContext(editorModeCtx);
    const isDarkMode = React.useContext(isDarkModeCtx);
    const setEditorMode = React.useContext(setEditorModeCtx);
    const setIsDarkMode = React.useContext(setIsDarkModeCtx);
    const showEditorToggle = useEditorMode();

    const onEditorModeToggle = () => setEditorMode((m) => (m === Mode.Default ? Mode.TwoSide : Mode.Default));

    return (
        <div className={className.part}>
            {showEditorToggle && (
                <span onClick={() => onEditorModeToggle()} className={[materialIcon, className.mode].join(' ')}>
                    {editorMode === Mode.Default ? 'chrome_reader_mode' : 'wysiwyg'}
                </span>
            )}
            <span onClick={() => setIsDarkMode(!isDarkMode)} className={materialIcon}>
                {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
            <a href="https://github.com/Saul-Mirone/milkdown" target="_blank" className={className.github}>
                <span className={materialIcon}>open_in_new</span>
            </a>
        </div>
    );
};
