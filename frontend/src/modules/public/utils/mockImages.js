const BASE_WIDTH = 1200;
const BASE_HEIGHT = 900;

const PRODUCT_LIBRARY = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518',
  'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
];

const AMBIENT_LIBRARY = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
  'https://images.unsplash.com/photo-1445205170230-053b83016050',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
];

const hashString = (value) => {
  return String(value || 'erp-store').split('').reduce((accumulator, char) => {
    return (accumulator * 31 + char.charCodeAt(0)) >>> 0;
  }, 7);
};

const buildImageUrl = (baseUrl, width, height) => {
  return `${baseUrl}?auto=format&fit=crop&w=${width}&h=${height}&q=72`;
};

export const getProductMockImage = (productId, variantKey = 'cover', width = BASE_WIDTH, height = BASE_HEIGHT) => {
  const imageIndex = hashString(`${productId}-${variantKey}`) % PRODUCT_LIBRARY.length;
  return buildImageUrl(PRODUCT_LIBRARY[imageIndex], width, height);
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
  buildImageUrl(AMBIENT_LIBRARY[0], 1280, 720),
  buildImageUrl(AMBIENT_LIBRARY[1], 1280, 720),
  buildImageUrl(AMBIENT_LIBRARY[2], 1280, 720),
]);
