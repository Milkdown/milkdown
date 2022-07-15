/* Copyright 2021, Milkdown by Mirone. */
import { createContext, Dispatch, ReactNode, SetStateAction, useMemo, useState } from 'react';

import { Local as Localize, pageRouter, Section } from '../route';
import { Mode } from './constant';

type SetState<T> = Dispatch<SetStateAction<T>>;

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

const DisplaySidebar: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [displaySidebar, setDisplaySidebar] = useState(false);

    return (
        <displaySidebarCtx.Provider value={displaySidebar}>
            <setDisplaySidebarCtx.Provider value={setDisplaySidebar}>{children}</setDisplaySidebarCtx.Provider>
        </displaySidebarCtx.Provider>
    );
};

const EditorMode: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [editorMode, setEditorMode] = useState(Mode.Default);

    return (
        <editorModeCtx.Provider value={editorMode}>
            <setEditorModeCtx.Provider value={setEditorMode}>{children}</setEditorModeCtx.Provider>
        </editorModeCtx.Provider>
    );
};

const Scrolled: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [scrolled, setScrolled] = useState(false);

    return (
        <scrolledCtx.Provider value={scrolled}>
            <setScrolledCtx.Provider value={setScrolled}>{children}</setScrolledCtx.Provider>
        </scrolledCtx.Provider>
    );
};

const IsDarkMode: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <isDarkModeCtx.Provider value={isDarkMode}>
            <setIsDarkModeCtx.Provider value={setIsDarkMode}>{children}</setIsDarkModeCtx.Provider>
        </isDarkModeCtx.Provider>
    );
};

const Local: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [local, setLocal] = useState<Localize>('en');
    const sections = useMemo(() => pageRouter[local], [local]);

    return (
        <sectionsCtx.Provider value={sections}>
            <localCtx.Provider value={local}>
                <setLocalCtx.Provider value={setLocal}>{children}</setLocalCtx.Provider>
            </localCtx.Provider>
        </sectionsCtx.Provider>
    );
};

export const Context: React.FC<{ children: ReactNode }> = ({ children }) => (
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
