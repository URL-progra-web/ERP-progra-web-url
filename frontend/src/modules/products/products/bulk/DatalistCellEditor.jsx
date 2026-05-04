import React, { useId, useMemo, useRef, useEffect } from 'react';

const DatalistCellEditor = ({ value, onValueChange, values = [] }) => {
    const inputRef = useRef(null);
    const listId = useId();
    const options = useMemo(() => values.filter(Boolean), [values]);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    return (
        <>
            <input
                ref={inputRef}
                className="bulk-datalist-editor"
                value={value || ''}
                list={listId}
                onChange={(event) => onValueChange(event.target.value)}
            />
            <datalist id={listId}>
                {options.map((option) => (
                    <option key={option} value={option} />
                ))}
            </datalist>
        </>
    );
};

export default DatalistCellEditor;

