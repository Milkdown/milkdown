import React from 'react';
import { MilkdownEditor } from './MilkdownEditor/MilkdownEditor';
import { Header } from './Header/Header';
import markdown from '../example.md';

export const App: React.FC = () => (
    <>
        <Header showToggle={false} />
        <MilkdownEditor content={markdown} />
    </>
);
