import React, { useState } from 'react';
import { FiUsers, FiPlus } from 'react-icons/fi';
import { useCustomers } from './hooks/useCustomers';
import { CustomersFilters } from './components/CustomersFilters';
import { CustomersTable } from './components/CustomersTable';
import { CustomerModal } from './components/CustomerModal';
import { OrderModal } from '~/modules/orders/orders/components/OrderModal';
import { orderService } from '~/modules/orders/orders/services/orderService';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
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
                isDark
            />

            {error && !alertConfig && <div className="alert alert-warning">{error}</div>}

            <AppCard accent="var(--bs-success)">
                <AppCard.Section label="Filtros">
                    <div className="p-3 p-md-4 border-bottom">
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
                </AppCard.Section>

                <AppCard.Section label="Listado de clientes">
                    <CustomersTable
                        customers={customers}
                        isLoading={isLoading}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                        onCreateOrder={handleOpenOrderModal}
                    />

                    <AppPagination
                        page={page}
                        numPages={numPages}
                        count={count}
                        onPageChange={setPage}
                    />
                </AppCard.Section>
            </AppCard>

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

        </div>
    );
};

export default CustomersPage;
