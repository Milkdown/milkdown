/* Copyright 2021, Milkdown by Mirone. */
import 'react-loading-skeleton/dist/skeleton.css';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

export const Loading = () => {
    return (
        <div className="loading">
            <SkeletonTheme baseColor="rgba(var(--background), 1)" highlightColor="rgba(var(--surface), 1)">
                <Skeleton
                    height="3rem"
                    style={{
                        margin: '2.5rem 0',
                        width: '50%',
                        lineHeight: '3.5rem',
                    }}
                />
                <Skeleton height="1rem" style={{ lineHeight: '1.5rem', width: '80%' }} />
                <Skeleton height="1rem" style={{ lineHeight: '1.5rem', width: '60%' }} />
                <Skeleton height="1rem" style={{ lineHeight: '1.5rem', width: '90%' }} />
                <Skeleton height="1rem" style={{ lineHeight: '1.5rem', width: '70%' }} />
                <Skeleton height="1rem" style={{ lineHeight: '1.5rem', width: '80%' }} />
            </SkeletonTheme>
        </div>
    );
};
