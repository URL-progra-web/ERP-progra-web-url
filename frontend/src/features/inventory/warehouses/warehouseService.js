// Aquí luego conectamos al backend real.
let mockWarehouses = [
  {
    id: 1,
    name: "Bodega Central",
    code: "CENTRAL",
    address: "Xela",
    is_active: true,
  },
  {
    id: 2,
    name: "Bodega Zona 1",
    code: "ZONA1",
    address: "Guatemala",
    is_active: false,
  },
];

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getWarehouses() {
  await delay();
  return [...mockWarehouses];
}

export async function createWarehouse(payload) {
  await delay();

  const exists = mockWarehouses.some(
    (warehouse) => warehouse.code.toLowerCase() === payload.code.toLowerCase()
  );

  if (exists) {
    throw {
      code: "Este código ya existe.",
    };
  }

  const newWarehouse = {
    id: Date.now(),
    ...payload,
  };

  mockWarehouses.push(newWarehouse);
  return newWarehouse;
}

export async function updateWarehouse(id, payload) {
  await delay();

  const exists = mockWarehouses.some(
    (warehouse) =>
      warehouse.id !== id &&
      warehouse.code.toLowerCase() === payload.code.toLowerCase()
  );

  if (exists) {
    throw {
      code: "Este código ya existe.",
    };
  }

  mockWarehouses = mockWarehouses.map((warehouse) =>
    warehouse.id === id ? { ...warehouse, ...payload } : warehouse
  );

  return mockWarehouses.find((warehouse) => warehouse.id === id);
}

export async function deactivateWarehouse(id) {
  await delay();

  mockWarehouses = mockWarehouses.map((warehouse) =>
    warehouse.id === id ? { ...warehouse, is_active: false } : warehouse
  );

  return mockWarehouses.find((warehouse) => warehouse.id === id);
}