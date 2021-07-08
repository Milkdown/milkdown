export const scrollbar = (_: unknown, direction?: 'col' | 'row') => {
    const isCol = !direction || direction === 'col';
    return {
        'scrollbar-width': 'thin',
        'scrollbar-color': 'palette(secondary, 0.38) palette(secondary, 0.12)',
        '-webkit-overflow-scrolling': 'touch',
        '&::-webkit-scrollbar': {
            [isCol ? 'width' : 'height']: '4px',
            padding: '0 2px',
            background: 'palette(surface)',
        },
        '&::-webkit-scrollbar-track': {
            'border-radius': '4px',
            background: 'palette(secondary, 0.12)',
        },
        '&::-webkit-scrollbar-thumb': {
            'border-radius': '4px',
            background: 'palette(secondary, 0.38)',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: 'palette(secondary)',
        },
    };
};
