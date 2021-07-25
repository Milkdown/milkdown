import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import { LocationType, useLocationType } from '../hooks/useLocationType';
import { Mode } from '../Demo/Demo';
import className from './style.module.css';

type Props = {
    scrolled: boolean;
    onToggle: () => void;
    editorMode: Mode;
    onEditorModeToggle: () => void;
    isDarkMode: boolean;
    setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const materialIcon = `${className.icon} material-icons-outlined`;

export const Header: React.FC<Props> = ({
    onToggle,
    scrolled,
    editorMode,
    onEditorModeToggle,
    isDarkMode,
    setIsDarkMode,
}) => {
    const [showToggle, setShowToggle] = React.useState(true);
    const [showEditorToggle, setShowEditorToggle] = React.useState(false);
    const [locationType] = useLocationType();

    React.useEffect(() => {
        if (locationType === LocationType.Page) {
            setShowToggle(true);
            return;
        }
        setShowToggle(false);
        if (locationType === LocationType.Demo) {
            setShowEditorToggle(true);
            return;
        }
        setShowEditorToggle(false);
    }, [locationType]);

    useDarkMode(isDarkMode, setIsDarkMode);

    const headerClass = [
        className.container,
        locationType === LocationType.Home || !scrolled ? className.homepage : '',
    ].join(' ');

    return (
        <div className={headerClass}>
            <header className={className.header}>
                <div className={className.part}>
                    {showToggle && (
                        <span
                            className={materialIcon}
                            onClick={(e) => {
                                onToggle?.();
                                e.stopPropagation();
                            }}
                        >
                            menu
                        </span>
                    )}
                    <Link to="/" className={className.logo}>
                        <img src="/milkdown/milkdown-mini.svg" />
                        <span style={{ opacity: scrolled ? 0 : 1, transition: 'all 0.2s ease-in' }}>Milkdown</span>
                    </Link>
                </div>
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
            </header>
        </div>
    );
};
