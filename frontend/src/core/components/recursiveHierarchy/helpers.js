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
    return items
        .map((item) => ({
            raw: item,
            id: normalizeId(getId(item)),
            parentId: normalizeId(getParentId(item)),
            label: getLabel(item) || '',
            isLeaf: Boolean(getIsLeaf(item)),
        }))
        .filter((item) => item.id !== null);
};

export const buildBlockedIds = (excludeIds = []) => {
    return new Set(
        (excludeIds || [])
            .filter((id) => id !== null && id !== undefined && id !== '')
            .map((id) => String(id)),
    );
};
