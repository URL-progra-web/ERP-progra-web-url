import React from 'react';
import { RecursiveHierarchySelector } from '~/core/components';

const CategoryCascadeSelector = ({
    categories = [],
    value = '',
    onChange,
    disabled = false,
    excludeIds = [],
}) => {
    return (
        <RecursiveHierarchySelector
            items={categories}
            value={value}
            onChange={onChange}
            disabled={disabled}
            excludeIds={excludeIds}
            getId={(item) => item?.id}
            getParentId={(item) => item?.parent}
            getLabel={(item) => item?.name}
            rootOptionLabel="Ninguna (categoría raíz)"
            levelRootLabel="Selecciona la categoría principal"
            levelChildLabel={(parentName) => `Subcategorías de "${parentName || 'Categoría'}"`}
            selectionMode="any"
        />
    );
};

export default CategoryCascadeSelector;
