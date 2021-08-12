import React, { createContext } from 'react';
import { Local as Localize, pageRouter, Section } from '../route';
import { Mode } from './constant';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export const displaySidebarCtx = createContext(false);
export const scrolledCtx = createContext(false);
export const editorModeCtx = createContext(Mode.Default);
export const isDarkModeCtx = createContext(false);
export const localCtx = createContext<Localize>('en');
export const sectionsCtx = createContext<Section[]>([]);

export const setDisplaySidebarCtx = createContext<SetState<boolean>>(() => void 0);
export const setScrolledCtx = createContext<SetState<boolean>>(() => void 0);
export const setEditorModeCtx = createContext<SetState<Mode>>(() => void 0);
export const setIsDarkModeCtx = createContext<SetState<boolean>>(() => void 0);
export const setLocalCtx = createContext<SetState<Localize>>(() => void 0);

const DisplaySidebar: React.FC = ({ children }) => {
    const [displaySidebar, setDisplaySidebar] = React.useState(false);

    return (
        <displaySidebarCtx.Provider value={displaySidebar}>
            <setDisplaySidebarCtx.Provider value={setDisplaySidebar}>{children}</setDisplaySidebarCtx.Provider>
        </displaySidebarCtx.Provider>
    );
};

const EditorMode: React.FC = ({ children }) => {
    const [editorMode, setEditorMode] = React.useState(Mode.Default);

    return (
        <editorModeCtx.Provider value={editorMode}>
            <setEditorModeCtx.Provider value={setEditorMode}>{children}</setEditorModeCtx.Provider>
        </editorModeCtx.Provider>
    );
};

const Scrolled: React.FC = ({ children }) => {
    const [scrolled, setScrolled] = React.useState(false);

    return (
        <scrolledCtx.Provider value={scrolled}>
            <setScrolledCtx.Provider value={setScrolled}>{children}</setScrolledCtx.Provider>
        </scrolledCtx.Provider>
    );
};

const IsDarkMode: React.FC = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    return (
        <isDarkModeCtx.Provider value={isDarkMode}>
            <setIsDarkModeCtx.Provider value={setIsDarkMode}>{children}</setIsDarkModeCtx.Provider>
        </isDarkModeCtx.Provider>
    );
};

const Local: React.FC = ({ children }) => {
    const [local, setLocal] = React.useState<Localize>('en');
    const sections = React.useMemo(() => pageRouter[local], [local]);

    return (
        <sectionsCtx.Provider value={sections}>
            <localCtx.Provider value={local}>
                <setLocalCtx.Provider value={setLocal}>{children}</setLocalCtx.Provider>
            </localCtx.Provider>
        </sectionsCtx.Provider>
    );
};

export const Context: React.FC = ({ children }) => (
    <Local>
        <IsDarkMode>
            <Scrolled>
                <DisplaySidebar>
                    <EditorMode>{children}</EditorMode>
                </DisplaySidebar>
            </Scrolled>
        </IsDarkMode>
    </Local>
);
