export const BULK_TEMPLATE_COLUMNS = [
    { key: 'name', header: 'Nombre del producto', required: true },
    { key: 'description', header: 'Descripción', required: false },
    { key: 'category', header: 'Categoría/Subcategoría', required: false },
    { key: 'entrepreneur', header: 'Emprendedor', required: true },
    { key: 'business_unit', header: 'Sede', required: true },
    { key: 'base_uom', header: 'Unidad base', required: true },
];

export const REQUIRED_FIELDS = BULK_TEMPLATE_COLUMNS
    .filter((column) => column.required)
    .map((column) => column.key);

export const createEmptyBulkRow = (index = 0) => ({
    rowId: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
    id: '',
    name: '',
    description: '',
    category: '',
    entrepreneur: '',
    business_unit: '',
    base_uom: '',
    status: 'draft',
    errors: [],
});

export const TEMPLATE_ROWS = [];

export const normalizeText = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const getOptionLabel = (item, fallback = 'name') => (
    item?.company_name || item?.[fallback] || item?.code || ''
);

export const buildDatalistValues = (items, fallback = 'name') => (
    items.map((item) => getOptionLabel(item, fallback)).filter(Boolean)
);

export const getCategoryPathLabel = (category, categories) => {
    if (!category) return '';
    const byId = new Map(categories.map((item) => [String(item.id), item]));
    const path = [];
    let current = category;
    const visited = new Set();

    while (current && !visited.has(String(current.id))) {
        visited.add(String(current.id));
        path.unshift(current.name);
        current = current.parent ? byId.get(String(current.parent)) : null;
    }

    return path.filter(Boolean).join(' > ');
};

export const buildCategoryDatalistValues = (categories) => (
    categories.map((category) => getCategoryPathLabel(category, categories)).filter(Boolean)
);

export const resolveCategoryId = (value, categories) => {
    if (!value) return null;
    const normalizedValue = normalizeText(value);

    const byId = categories.find((category) => String(category.id) === String(value));
    if (byId) return byId.id;

    const byPath = categories.find((category) => (
        normalizeText(getCategoryPathLabel(category, categories)) === normalizedValue
    ));
    if (byPath) return byPath.id;

    const byName = categories.filter((category) => normalizeText(category.name) === normalizedValue);
    return byName.length === 1 ? byName[0].id : null;
};

export const findMatchingCategoryLabel = (value, categories) => {
    const categoryId = resolveCategoryId(value, categories);
    if (!categoryId) return value || '';
    const category = categories.find((item) => String(item.id) === String(categoryId));
    return getCategoryPathLabel(category, categories) || value || '';
};

export const resolveOptionId = (value, items, fallback = 'name') => {
    if (!value) return null;
    const normalizedValue = normalizeText(value);
    const found = items.find((item) => (
        String(item.id) === String(value) ||
        normalizeText(getOptionLabel(item, fallback)) === normalizedValue ||
        normalizeText(item.code) === normalizedValue
    ));
    return found?.id || null;
};

export const findMatchingOptionLabel = (value, values) => {
    const normalizedValue = normalizeText(value);
    if (!normalizedValue) return value || '';
    return values.find((option) => normalizeText(option) === normalizedValue) || value || '';
};
