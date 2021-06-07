export const createDropdown = () => {
    const div = document.createElement('div');
    div.setAttribute('role', 'listbox');
    div.setAttribute('tabindex', '-1');
    div.classList.add('slash-dropdown');

    return div;
};

export const createPlaceholder = (text: string) => {
    const span = document.createElement('span');
    span.textContent = text;
    span.classList.add('slash-placeholder');
    return span;
};

export const createDropdownItem = (text: string, icon: string) => {
    const div = document.createElement('div');
    div.setAttribute('role', 'option');
    div.classList.add('slash-dropdown-item');

    const iconSpan = document.createElement('span');
    iconSpan.textContent = icon;
    iconSpan.className = 'icon material-icons material-icons-outlined';

    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.className = 'text';

    div.appendChild(iconSpan);
    div.appendChild(textSpan);

    return div;
};
