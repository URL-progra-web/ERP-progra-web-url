import React, { useState } from 'react';
import { FiUsers, FiPlus } from 'react-icons/fi';
import { useCustomers } from './hooks/useCustomers';
import { CustomersFilters } from './components/CustomersFilters';
import { CustomersTable } from './components/CustomersTable';
import { CustomerModal } from './components/CustomerModal';
import { OrderModal } from '~/modules/orders/orders/components/OrderModal';
import { orderService } from '~/modules/orders/orders/services/orderService';
import AppAlert from '~/core/components/AppAlert';
import PageHeader from '~/core/components/PageHeader';
import AppPagination from '~/core/components/AppPagination';

const CustomersPage = () => {
    const {
        customers,
        count,
        numPages,
        page,
        setPage,
        search,
        setSearch,
        createdFrom,
        setCreatedFrom,
        createdTo,
        setCreatedTo,
        isLoading,
        error,
        setError,
        saveCustomer,
        deleteCustomer,
        refetch,
    } = useCustomers();

    const [modalCustomer, setModalCustomer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);
    const [orderCustomer, setOrderCustomer] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);

    const handleOpenModal = (customer = null) => {
        setModalCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalCustomer(null);
        setIsModalOpen(false);
    };

    const handleSave = async (payload, id) => {
        try {
            await saveCustomer(payload, id);
            handleCloseModal();
        } catch (err) {
            const message = err?.response?.data?.error || 'No se pudo guardar el cliente.';
            setError(message);
        }
    };

    const handleDelete = (customer) => {
        setAlertConfig({
            type: 'danger',
            header: 'Eliminar cliente',
            content: `¿Eliminar a ${customer.name}? Se eliminarán sus pedidos invitados asociados.`,
            confirmLabel: 'Eliminar',
            onConfirm: async () => {
                const errMsg = await deleteCustomer(customer.id);
                if (errMsg) {
                    setError(errMsg);
                }
                setAlertConfig(null);
            },
        });
    };

    const handleOpenOrderModal = (customer) => {
        setOrderCustomer(customer);
        setIsOrderModalOpen(true);
    };

    const handleCloseOrderModal = () => {
        setOrderCustomer(null);
        setIsOrderModalOpen(false);
    };

    const handleCreateOrder = async (payload) => {
        setIsOrderSubmitting(true);
        try {
            await orderService.create(payload);
            handleCloseOrderModal();
            return true;
        } catch (err) {
            const message = err?.response?.data?.message || err?.response?.data?.error || 'No se pudo crear el pedido.';
            setError(message);
            return false;
        } finally {
            setIsOrderSubmitting(false);
        }
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Clientes"
                subtitle={`${count} registro(s) encontrados`}
                icon={FiUsers}
                actionLabel="Nuevo cliente"
                actionIcon={FiPlus}
                onAction={() => handleOpenModal()}
            />

            <div className="card border-0 shadow-lg mb-4 overflow-hidden">
                <div className="bg-black text-white px-4 py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h6 className="mb-0 text-uppercase small">Filtros avanzados</h6>
                        <span className="badge bg-dark-subtle text-dark">{customers.length} visibles</span>
                    </div>
                </div>
                <div className="card-body bg-body-secondary">
                    <CustomersFilters
                        search={search}
                        onSearchChange={(value) => { setSearch(value); setPage(1); }}
                        createdFrom={createdFrom}
                        onCreatedFromChange={(value) => { setCreatedFrom(value); setPage(1); }}
                        createdTo={createdTo}
                        onCreatedToChange={(value) => { setCreatedTo(value); setPage(1); }}
                        onSubmit={() => { refetch(); }}
                    />
                </div>
            </div>

            <div className="card border-0 shadow-lg overflow-hidden">
                <div className="bg-black text-white px-4 py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h6 className="mb-0 text-uppercase small">Listado de clientes</h6>
                        <small className="text-white-50">{count} registro(s) totales</small>
                    </div>
                    <span className="badge bg-dark-subtle text-dark">Página {page} de {numPages}</span>
                </div>
                <div className="bg-body px-3 px-md-4 py-3">
                    <CustomersTable
                        customers={customers}
                        isLoading={isLoading}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                        onCreateOrder={handleOpenOrderModal}
                    />
                </div>

                <AppPagination
                    page={page}
                    numPages={numPages}
                    count={count}
                    onPageChange={setPage}
                />
            </div>

            {isModalOpen && (
                <CustomerModal
                    customer={modalCustomer}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            )}

            <OrderModal
                isOpen={isOrderModalOpen}
                onClose={handleCloseOrderModal}
                onSubmit={handleCreateOrder}
                isSubmitting={isOrderSubmitting}
                initialCustomer={orderCustomer}
            />

            {alertConfig && (
                <AppAlert
                    type={alertConfig.type}
                    header={alertConfig.header}
                    content={alertConfig.content}
                    confirmLabel={alertConfig.confirmLabel}
                    onConfirm={alertConfig.onConfirm}
                    onClose={() => setAlertConfig(null)}
                />
            )}

            {error && !alertConfig && (
                <AppAlert
                    type="warning"
                    header="Atención"
                    content={error}
                    onClose={() => setError(null)}
                />
            )}
        </div>
    );
};

export default CustomersPage;
