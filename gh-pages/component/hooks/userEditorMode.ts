import React from 'react';

import { LocationType, useLocationType } from './useLocationType';

export const useEditorMode = () => {
    const [locationType] = useLocationType();
    const [showEditorToggle, setShowEditorToggle] = React.useState(false);

    React.useEffect(() => {
        setShowEditorToggle(locationType === LocationType.Demo);
    }, [locationType]);

    return showEditorToggle;
};
