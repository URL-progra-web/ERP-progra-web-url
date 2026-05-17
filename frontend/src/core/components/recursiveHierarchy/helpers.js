export const normalizeId = (value) => {
    if (value === null || value === undefined || value === '') return null;
    return String(value);
};

export const buildPreparedItems = ({
    items,
    getId,
    getParentId,
    getLabel,
    getIsLeaf,
}) => {
    return items.flatMap((item) => {
        const id = normalizeId(getId(item));
        if (id === null) return [];
        return [{
            raw: item,
            id,
            parentId: normalizeId(getParentId(item)),
            label: getLabel(item) || '',
            isLeaf: Boolean(getIsLeaf(item)),
        }];
    });
};

export const buildBlockedIds = (excludeIds = []) => {
    return new Set(
        (excludeIds || []).flatMap((id) =>
            (id !== null && id !== undefined && id !== '') ? [String(id)] : []
        ),
    );
};
