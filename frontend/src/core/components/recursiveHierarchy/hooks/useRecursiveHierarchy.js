import { useMemo, useCallback } from 'react';
import { buildBlockedIds, buildPreparedItems } from '../helpers';

export const useRecursiveHierarchy = ({
    items,
    value,
    onChange,
    excludeIds,
    getId,
    getParentId,
    getLabel,
    getIsLeaf,
    selectionMode,
}) => {
    const blockedIds = useMemo(() => buildBlockedIds(excludeIds), [excludeIds]);

    const preparedItems = useMemo(() => (
        buildPreparedItems({ items, getId, getParentId, getLabel, getIsLeaf })
    ), [items, getId, getParentId, getLabel, getIsLeaf]);

    const itemMap = useMemo(() => {
        const map = new Map();
        preparedItems.forEach((item) => map.set(item.id, item));
        return map;
    }, [preparedItems]);

    const childrenMap = useMemo(() => {
        const map = new Map();
        preparedItems.forEach((item) => {
            const key = item.parentId;
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(item);
        });

        map.forEach((list) => {
            list.sort((a, b) => a.label.localeCompare(b.label));
        });

        return map;
    }, [preparedItems]);

    const normalizedValue = value === null || value === undefined || value === ''
        ? ''
        : String(value);

    const path = useMemo(() => {
        if (!normalizedValue) return [];

        const visited = new Set();
        const chain = [];
        let currentId = normalizedValue;

        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const node = itemMap.get(currentId);
            if (!node) break;
            chain.push(currentId);
            currentId = node.parentId;
        }

        return chain.reverse();
    }, [normalizedValue, itemMap]);

    const columns = useMemo(() => {
        const result = [];
        let level = 0;
        let parentId = null;

        while (true) {
            const options = childrenMap.get(parentId) || [];
            const showColumn = options.length > 0 || level === 0;
            if (!showColumn) break;

            const selectedId = path[level] || '';
            result.push({ level, parentId, options, selectedId });

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
        if (selectedId) newPath[levelIndex] = selectedId;
        const newValue = newPath.length ? newPath[newPath.length - 1] : '';
        onChange(newValue);
    }, [path, onChange]);

    const isSelectionBlocked = useCallback((item) => {
        if (blockedIds.has(item.id)) return true;
        if (selectionMode === 'leaf') return !item.isLeaf;
        if (selectionMode === 'branch') return item.isLeaf;
        return false;
    }, [blockedIds, selectionMode]);

    return {
        itemMap,
        childrenMap,
        path,
        columns,
        handleLevelSelect,
        isSelectionBlocked,
    };
};
