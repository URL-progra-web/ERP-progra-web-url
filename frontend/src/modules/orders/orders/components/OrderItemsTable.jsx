import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../helpers/formatCurrency';
import TableActions from '~/core/components/TableActions';

export const OrderItemsTable = ({ items, isLoading, onEdit, onDelete, canEdit = true }) => {
    if (isLoading) {
        return <div className="text-center p-3">Cargando items...</div>;
    }

    if (!items?.length) {
        return <div className="text-center p-3 text-muted">Este pedido aún no tiene items.</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="border-0 bg-transparent text-secondary py-3 ps-3">ID</th>
                        <th className="border-0 bg-transparent text-secondary py-3">SKU</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-end">Cantidad</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-end">Precio Unitario</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-end">Subtotal</th>
                        <th className="border-0 bg-transparent text-secondary py-3">Estado</th>
                        <th className="border-0 bg-transparent text-secondary py-3 pe-3 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td className="ps-3">#{item.id}</td>
                            <td>{item.variant_sku || `Variant #${item.variant}`}</td>
                            <td className="text-end">{item.quantity}</td>
                            <td className="text-end">{formatCurrency(item.unit_price)}</td>
                            <td className="text-end fw-semibold">{formatCurrency(item.line_total)}</td>
                            <td>{item.status_name || `#${item.status}`}</td>
                            <td className="text-end pe-3">
                                <TableActions actions={[
                                    {
                                        icon: FiEdit2,
                                        onClick: () => onEdit?.(item),
                                        title: canEdit ? 'Editar' : 'Solo editable en estado SOLICITADO o BORRADOR',
                                        title: canEdit ? 'Editar' : 'Solo editable en estado SOLICITADO',
                                        variant: 'primary',
                                        disabled: !canEdit,
                                    },
                                    {
                                        icon: FiTrash2,
                                        onClick: () => onDelete?.(item),
                                        title: canEdit ? 'Eliminar' : 'Solo editable en estado SOLICITADO o BORRADOR',
                                        title: canEdit ? 'Eliminar' : 'Solo editable en estado SOLICITADO',
                                        variant: 'danger',
                                        disabled: !canEdit,
                                    },
                                ]} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
