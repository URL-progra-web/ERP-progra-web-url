-- 1. Usuarios y Roles (Escalabilidad para Emprendedores y Staff)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'ADMIN', 'VISITOR', 'ENTREPRENEUR'
    description TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Emprendedores / Proveedores
CREATE TABLE entrepreneurs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id), -- Nullable por ahora
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Unidades de Medida y Conversiones (Inventario atómico)
CREATE TABLE uoms (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'lb', 'un'
    name VARCHAR(50) NOT NULL
);

CREATE TABLE uom_conversions (
    id SERIAL PRIMARY KEY,
    from_uom_id INT NOT NULL REFERENCES uoms(id),
    to_uom_id INT NOT NULL REFERENCES uoms(id),
    multiplier DECIMAL(10, 4) NOT NULL,
    UNIQUE(from_uom_id, to_uom_id)
);

-- 4. Puntos de Origen / Negocios (Distribuidora vs Tienda)
CREATE TABLE business_units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- 'DISTRIBUIDORA' (perecederos), 'TIENDA' (no perecederos)
    description TEXT
);

-- 5. Categorías (Árbol recursivo infinito)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES categories(id), -- NULL si es categoría principal/raíz
    name VARCHAR(100) NOT NULL,
    is_leaf BOOLEAN DEFAULT FALSE, -- TRUE si es la categoría final donde se asientan productos (no tiene más subcategorías)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Catálogo de Productos y Variantes
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    entrepreneur_id INT NOT NULL REFERENCES entrepreneurs(id),
    business_unit_id INT NOT NULL REFERENCES business_units(id), -- Para saber si es de la Distribuidora o Tienda
    category_id INT REFERENCES categories(id), -- Dónde se va a ubicar en el catálogo (idealmente en categorías leaf)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tablas de catálogo para Tallas y Colores (Estandarización)
CREATE TABLE sizes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- Ej: 'S', 'M', 'L', 'XL', 'Única'
);

CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- Ej: 'Rojo', 'Azul', 'Blanco'
    hex_code VARCHAR(10) -- Opcional, útil para UI/Front-end futuro
);

CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    size_id INT REFERENCES sizes(id), -- Puede ser NULL para perecederos
    color_id INT REFERENCES colors(id), -- Puede ser NULL para perecederos
    uom_id INT NOT NULL REFERENCES uoms(id),
    cost DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity_available INT NOT NULL DEFAULT 0, -- Stock actual consolidado
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Métodos de Pago
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- Ej: 'Efectivo', 'Transferencia', 'Tarjeta', 'Pago contra entrega'
    is_active BOOLEAN DEFAULT TRUE
);

-- 7. Control de Inventario (Auditoría estricta)
CREATE TABLE transaction_types (
    name VARCHAR(50) PRIMARY KEY, -- Ej: 'IN', 'OUT', 'ADJ_LOSS', 'ADJ_RETURN'
    factor SMALLINT NOT NULL CHECK (factor IN (-1, 0, 1)), -- 1 = Suma inventario, -1 = Resta inventario, 0 = Neutro (reserva)
    description TEXT
);

CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    variant_id INT NOT NULL REFERENCES product_variants(id),
    user_id INT REFERENCES users(id),
    transaction_type_name VARCHAR(50) NOT NULL REFERENCES transaction_types(name),
    quantity INT NOT NULL CHECK (quantity > 0), -- Siempre en absoluto. La suma/resta se hace multiplicando por el factor
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Clientes (Invitados)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT, -- Opcional, para envíos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Pedidos / Carrito Virtual / Envíos
CREATE TABLE order_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- Ej: 'REQUESTED', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'
    description TEXT
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    short_id VARCHAR(20) UNIQUE NOT NULL, -- Ej: PED-X89B
    customer_id INT NOT NULL REFERENCES customers(id),
    payment_method_id INT REFERENCES payment_methods(id), -- NULL al inicio si solo es reserva
    status_id INT NOT NULL REFERENCES order_statuses(id),
    shipping_address TEXT, -- Si el envío es a una dirección específica
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    variant_id INT NOT NULL REFERENCES product_variants(id),
    quantity INT NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    status_id INT NOT NULL REFERENCES order_statuses(id), -- Historial detallado por cada ítem
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Historial de Estados de Orden (Opcional pero muy útil para auditoría/rastreo)
CREATE TABLE order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    user_id INT REFERENCES users(id), -- Quién cambió el estado (si fue el Staff)
    status_id INT NOT NULL REFERENCES order_statuses(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_item_status_history (
    id SERIAL PRIMARY KEY,
    order_item_id INT NOT NULL REFERENCES order_items(id),
    user_id INT REFERENCES users(id), -- Quién hizo el cambio
    status_id INT NOT NULL REFERENCES order_statuses(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Recibos Internos (No Fiscales)
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    receipt_number VARCHAR(50) UNIQUE NOT NULL, -- Ej: REC-2026-001
    issued_by INT REFERENCES users(id), -- Qué usuario (Staff) emitió el recibo
    subtotal DECIMAL(10, 2) NOT NULL, -- Suma de los ítems
    shipping_total DECIMAL(10, 2) DEFAULT 0.00,
    discount_total DECIMAL(10, 2) DEFAULT 0.00,
    grand_total DECIMAL(10, 2) NOT NULL, -- subtotal + shipping - discount
    notes TEXT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para desglosar múltiples descuentos o recargos en un mismo recibo
CREATE TABLE receipt_adjustments (
    id SERIAL PRIMARY KEY,
    receipt_id INT NOT NULL REFERENCES receipts(id),
    adjustment_type VARCHAR(50) NOT NULL, -- 'DISCOUNT' (descuento), 'SURCHARGE' (recargo)
    reason VARCHAR(255) NOT NULL, -- Ej: 'Descuento por temporada', 'Empaque de regalo'
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
