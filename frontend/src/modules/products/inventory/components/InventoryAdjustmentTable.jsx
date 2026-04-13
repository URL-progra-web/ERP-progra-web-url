import React from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import TableActions from '~/core/components/TableActions';

const InventoryAdjustmentTable = ({ products, isLoading, onAddStock, onRemoveStock }) => {
    if (isLoading) {
        return (
            <tbody>
                <tr>
                    <td colSpan="6" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                        <span className="text-muted">Cargando...</span>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {products.length === 0 ? (
                <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                        No se encontraron productos. Crea uno nuevo para empezar.
                    </td>
                </tr>
            ) : products.map(product => (
                <tr key={product.id} className="border-bottom border-light-subtle">
                    <td className="px-4 py-3">
                        <div className="fw-bold text-body">{product.name}</div>
                        {product.description && (
                            <small className="text-muted d-block text-truncate" style={{ maxWidth: 300 }}>
                                {product.description}
                            </small>
                        )}
                    </td>
                    <td className="py-3">
                        {product.category_name
                            ? <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1">{product.category_name}</span>
                            : <span className="text-muted fst-italic">Sin categoría</span>
                        }
                    </td>
                    <td className="py-3 text-secondary">
                        {product.entrepreneur_name || <span className="text-muted fst-italic">—</span>}
                    </td>
                    <td className="py-3 text-secondary">
                        {product.business_unit_name || <span className="text-muted fst-italic">—</span>}
                    </td>
                    <td className="py-3 text-secondary">
                        {product.base_uom_name || <span className="text-muted fst-italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-end">
                        <TableActions actions={[
                            { icon: FiPlus,  onClick: () => onAddStock(product),   title: 'Agregar Stock',   variant: 'success' },
                            { icon: FiMinus, onClick: () => onRemoveStock(product), title: 'Remover Stock', variant: 'warning'  },
                        ]} />
                    </td>
                </tr>
            ))}
        </tbody>
    );
};

export default InventoryAdjustmentTable;
