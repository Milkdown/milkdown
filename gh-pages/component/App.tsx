import React from 'react';
import { MilkdownEditor } from './MilkdownEditor/MilkdownEditor';

import markdown from '../example.md';
import { Header } from './Header/Header';

export const App: React.FC = () => (
    <>
        <Header />
        <MilkdownEditor content={markdown} />
    </>
);
