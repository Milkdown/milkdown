import React from 'react';
import ReactDOM from 'react-dom';

export type Renderer = {
    reactElement: React.ReactNode;
    element: HTMLElement;
};

export const Portals: React.FC<{ renderers: Record<string, Renderer> }> = ({ renderers }) => (
    <>
        {Object.entries(renderers).map(([key, renderer]) =>
            ReactDOM.createPortal(renderer.reactElement, renderer.element, key),
        )}
    </>
);
