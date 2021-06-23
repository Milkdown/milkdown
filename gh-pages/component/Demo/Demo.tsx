import React from 'react';

import { MilkdownEditor } from '../MilkdownEditor/MilkdownEditor';
import className from './style.module.css';

export enum Mode {
    Default,
    TwoSide,
}

type DemoProps = {
    content: string;
    mode: Mode;
};

export const Demo = ({ content, mode }: DemoProps): JSX.Element => {
    const [value, setValue] = React.useState(content);
    const defaultValueForMilkdown = React.useRef(content);
    const lock = React.useRef(false);

    const milkdownListener = React.useCallback(
        (getMarkdown: () => string) => {
            if (lock.current) return;

            const result = getMarkdown();
            if (result === value) return;

            setValue(result);
        },
        [value],
    );

    const classes = [className.container, mode === Mode.TwoSide ? className.twoSide : ''].join(' ');

    return (
        <div className={classes}>
            <MilkdownEditor content={defaultValueForMilkdown.current} onChange={milkdownListener} />
            <textarea
                onChange={(e) => {
                    setValue(e.target.value);
                    defaultValueForMilkdown.current = e.target.value;
                }}
                onBlur={() => {
                    lock.current = false;
                }}
                onFocus={() => {
                    lock.current = true;
                }}
                value={value}
            />
        </div>
    );
};
