import React, { useState } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useOrders } from './hooks/useOrders';
import { OrdersTable } from './components/OrdersTable';
import { OrderModal } from './components/OrderModal';
import AppAlert from '~/core/components/AppAlert';
import PageHeader from '~/core/components/PageHeader';

const OrdersPage = () => {
    const {
        orders,
        search,
        setSearch,
        isLoadingOrders,
        error,
        setError,
        createOrder,
    } = useOrders();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateOrder = async (payload) => {
        setIsSubmitting(true);
        const success = await createOrder(payload);
        setIsSubmitting(false);
        if (success) {
            setIsModalOpen(false);
        }
        return success;
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Pedidos"
                subtitle={`${orders.length} pedido(s) registrado(s)`}
                icon={FiShoppingCart}
                actionLabel="Nuevo Pedido"
                actionIcon={FiShoppingCart}
                onAction={() => setIsModalOpen(true)}
            />

            <div className="d-flex flex-column gap-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-body py-3">
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                                <h6 className="mb-0 text-uppercase text-muted small">Listado</h6>
                                <span className="badge bg-dark-subtle text-dark-emphasis">{orders.length}</span>
                            </div>
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <OrdersTable
                        orders={orders}
                        isLoading={isLoadingOrders}
                    />
                </div>
            </div>

            <OrderModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateOrder}
                isSubmitting={isSubmitting}
            />

            {error && (
                <AppAlert
                    type="danger"
                    header="Error"
                    content={error}
                    onClose={() => setError(null)}
                />
            )}
        </div>
    );
};

export default OrdersPage;
