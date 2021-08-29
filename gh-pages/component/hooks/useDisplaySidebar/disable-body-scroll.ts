/* Copyright 2021, Milkdown by Mirone. */
export const scroll = document.createElement('div');
scroll.style.position = 'fixed';
scroll.style.right = '0';
scroll.style.top = '0';
scroll.style.bottom = '0';
scroll.style.background = 'rgba(var(--background), 1)';
scroll.style.zIndex = '99';

let timer: number;
export const stopBodyScroll = () => {
    if (timer) {
        window.clearTimeout(timer);
    }
    const { body } = document;
    const header = document.getElementById('header');
    const width = window.innerWidth - body.clientWidth;
    body.style.marginRight = `${width}px`;
    body.style.overflow = 'hidden';
    body.style.transition = 'none';
    scroll.style.width = width + 'px';
    if (header) {
        header.style.marginRight = `${width}px`;
        header.style.transition = 'none';
    }
    scroll.style.display = 'block';
};

export const resumeBodyScroll = () => {
    const { body } = document;
    const header = document.getElementById('header');
    body.style.overflow = '';
    body.style.marginRight = '';
    if (header) {
        header.style.marginRight = '';
    }
    timer = window.setTimeout(() => {
        body.style.transition = '';
        if (header) {
            header.style.transition = '';
        }
    }, 400);
    scroll.style.display = 'none';
};
