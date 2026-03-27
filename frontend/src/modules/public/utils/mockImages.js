const BASE_WIDTH = 1400;
const BASE_HEIGHT = 1100;

export const getProductMockImage = (productId, variantKey = 'cover', width = BASE_WIDTH, height = BASE_HEIGHT) => {
  const safeId = productId ?? 'catalog';
  const safeVariant = String(variantKey).replace(/[^a-zA-Z0-9-_]/g, '-');

  return `https://picsum.photos/seed/erp-store-${safeId}-${safeVariant}/${width}/${height}`;
};

export const getProductGalleryImages = (productId, variantId) => {
  const seedBase = variantId ? `${productId}-${variantId}` : `${productId}`;

  return [
    getProductMockImage(seedBase, 'hero', 1400, 1200),
    getProductMockImage(seedBase, 'detail-a', 1200, 1000),
    getProductMockImage(seedBase, 'detail-b', 1200, 1000),
    getProductMockImage(seedBase, 'detail-c', 1200, 1000),
  ];
};

export const getAmbientStoreImages = () => ([
  getProductMockImage('ambient', 'entrance', 1200, 900),
  getProductMockImage('ambient', 'atelier', 1200, 900),
  getProductMockImage('ambient', 'editorial', 1200, 900),
]);
