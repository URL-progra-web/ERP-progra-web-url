import React from 'react';
import { useRecursiveHierarchy } from './hooks/useRecursiveHierarchy';

const RecursiveHierarchySelector = ({
    items = [],
    value = '',
    onChange,
    disabled = false,
    excludeIds = [],
    getId = (item) => item?.id,
    getParentId = (item) => item?.parent,
    getLabel = (item) => item?.name,
    getIsLeaf = () => false,
    rootOptionLabel = 'Selecciona una opción',
    stayInParentLabel = (parentName) => (parentName ? `Mantenerse en "${parentName}"` : 'Selecciona una opción'),
    levelRootLabel = 'Selecciona nivel principal',
    levelChildLabel = (parentName) => `Subniveles de "${parentName || 'Categoría'}"`,
    selectionMode = 'any',
}) => {
    const {
        itemMap,
        childrenMap,
        path,
        columns,
        handleLevelSelect,
        isSelectionBlocked,
    } = useRecursiveHierarchy({
        items,
        value,
        onChange,
        excludeIds,
        getId,
        getParentId,
        getLabel,
        getIsLeaf,
        selectionMode,
    });

    const activeColumn = columns[columns.length - 1] || {
        level: 0,
        parentId: null,
        options: [],
        selectedId: '',
    };

    const canSelectRoot = selectionMode !== 'leaf';

    const handleSelectRoot = () => {
        if (disabled || !onChange || !canSelectRoot) return;
        onChange('');
    };

    const handleSelectAncestor = (ancestorId) => {
        if (disabled || !onChange) return;
        onChange(ancestorId);
    };

    const parentNode = activeColumn.parentId ? itemMap.get(activeColumn.parentId) : null;
    const canSelectParent = parentNode ? !isSelectionBlocked(parentNode) : false;

    return (
        <div className="d-flex flex-column gap-2 w-100">
            <div
                className="border rounded-3 bg-body-tertiary p-2 d-flex flex-nowrap align-items-center gap-2"
                style={{ overflowX: 'auto' }}
            >
                <button
                    type="button"
                    className={`btn btn-sm ${path.length === 0 ? 'btn-primary' : 'btn-outline-secondary'}`}
                    disabled={disabled || !canSelectRoot}
                    onClick={handleSelectRoot}
                >
                    {rootOptionLabel}
                </button>

                {path.map((id) => {
                    const node = itemMap.get(id);
                    if (!node) return null;
                    const isActive = id === path[path.length - 1];
                    return (
                        <React.Fragment key={id}>
                            <span className="text-muted small">/</span>
                            <button
                                type="button"
                                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}
                                disabled={disabled}
                                onClick={() => handleSelectAncestor(id)}
                            >
                                {node.label}
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>

            <div>
                <div className="form-label fw-semibold small mb-1 text-muted">
                    {activeColumn.level === 0
                        ? levelRootLabel
                        : levelChildLabel(parentNode?.label)}
                </div>

                <div
                    className="border rounded-3 bg-body-tertiary p-2 d-flex flex-column gap-2"
                    style={{ maxHeight: '220px', overflowY: 'auto' }}
                >
                    {activeColumn.level > 0 && parentNode && (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary text-start"
                            disabled={disabled || !canSelectParent}
                            onClick={() => {
                                if (!onChange) return;
                                onChange(parentNode.id);
                            }}
                        >
                            {stayInParentLabel(parentNode.label)}
                        </button>
                    )}

                    {activeColumn.options.map((option) => {
                        const isCurrent = option.id === path[path.length - 1];
                        const hasChildren = (childrenMap.get(option.id) || []).length > 0;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                className={`btn btn-sm text-start d-flex justify-content-between align-items-center w-100 ${isCurrent ? 'btn-primary' : 'btn-outline-secondary'}`}
                                disabled={disabled || isSelectionBlocked(option)}
                                onClick={() => handleLevelSelect(activeColumn.level, option.id)}
                            >
                                <span>{option.label}</span>
                                <span className="small text-muted">{hasChildren ? '›' : ''}</span>
                            </button>
                        );
                    })}

                    {activeColumn.options.length === 0 && (
                        <div className="small text-muted px-1 py-2">
                            No hay más subniveles disponibles.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecursiveHierarchySelector;
