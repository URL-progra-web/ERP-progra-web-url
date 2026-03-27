import React, { useMemo, useCallback } from 'react';

const normalizeId = (value) => {
    if (value === null || value === undefined || value === '') return null;
    return String(value);
};

const CategoryCascadeSelector = ({
    categories = [],
    value = '',
    onChange,
    disabled = false,
    excludeIds = [],
}) => {
    const blockedIds = useMemo(() => {
        return new Set(
            (excludeIds || [])
                .filter(id => id !== null && id !== undefined && id !== '')
                .map(id => String(id))
        );
    }, [excludeIds]);

    const preparedCategories = useMemo(() => (
        categories
            .map(cat => ({
                ...cat,
                id: cat?.id !== undefined && cat?.id !== null ? String(cat.id) : null,
                parentId: normalizeId(cat?.parent),
            }))
            .filter(cat => cat.id !== null)
    ), [categories]);

    const categoryMap = useMemo(() => {
        const map = new Map();
        preparedCategories.forEach(cat => map.set(cat.id, cat));
        return map;
    }, [preparedCategories]);

    const childrenMap = useMemo(() => {
        const map = new Map();
        preparedCategories.forEach(cat => {
            const key = cat.parentId;
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(cat);
        });

        map.forEach(list => {
            list.sort((a, b) => a.name.localeCompare(b.name));
        });

        return map;
    }, [preparedCategories]);

    const normalizedValue = (value === null || value === undefined || value === '')
        ? ''
        : String(value);

    const path = useMemo(() => {
        if (!normalizedValue) return [];

        const visited = new Set();
        const chain = [];
        let currentId = normalizedValue;

        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const node = categoryMap.get(currentId);
            if (!node) break;
            chain.push(currentId);
            currentId = node.parentId;
        }

        return chain.reverse();
    }, [normalizedValue, categoryMap]);

    const columns = useMemo(() => {
        const result = [];
        let level = 0;
        let parentId = null;

        while (true) {
            const options = childrenMap.get(parentId) || [];
            const showColumn = options.length > 0 || level === 0;
            if (!showColumn) break;

            const selectedId = path[level] || '';
            result.push({
                level,
                parentId,
                options,
                selectedId,
            });

            const nextParent = path[level];
            if (!nextParent) break;
            parentId = nextParent;
            level += 1;
        }

        return result;
    }, [childrenMap, path]);

    const handleLevelSelect = useCallback((levelIndex, selectedId) => {
        if (!onChange) return;
        const newPath = path.slice(0, levelIndex);
        if (selectedId) {
            newPath[levelIndex] = selectedId;
        }
        const newValue = newPath.length ? newPath[newPath.length - 1] : '';
        onChange(newValue);
    }, [path, onChange]);

    return (
        <div className="d-flex flex-column gap-3">
            {columns.map(column => {
                const parentName = column.parentId ? categoryMap.get(column.parentId)?.name : null;
                return (
                    <div key={`level-${column.level}`}>
                        <div className="form-label fw-semibold small mb-1 text-muted">
                            {column.level === 0
                                ? 'Selecciona la categoría principal'
                                : `Subcategorías de "${parentName || 'Categoría'}"`}
                        </div>
                        <select
                            className="form-select"
                            value={column.selectedId}
                            disabled={disabled}
                            onChange={(e) => handleLevelSelect(column.level, e.target.value)}
                        >
                            {column.level === 0 ? (
                                <option value="">Ninguna (categoría raíz)</option>
                            ) : (
                                <option value="">
                                    {parentName ? `Mantenerse en "${parentName}"` : 'Selecciona una opción'}
                                </option>
                            )}
                            {column.options.map(option => (
                                <option
                                    key={option.id}
                                    value={option.id}
                                    disabled={blockedIds.has(option.id)}
                                >
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            })}
        </div>
    );
};

export default CategoryCascadeSelector;
