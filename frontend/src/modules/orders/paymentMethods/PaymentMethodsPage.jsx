import React, { useMemo, useState } from 'react';
import { FiCreditCard, FiPlus } from 'react-icons/fi';
import { usePaymentMethods } from './hooks/usePaymentMethods';
import { PaymentMethodsTable } from './components/PaymentMethodsTable';
import { PaymentMethodModal } from './components/PaymentMethodModal';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
import AppPagination from '~/core/components/AppPagination';
import FilterTabs from '~/core/components/FilterTabs';
import PageHeader from '~/core/components/PageHeader';

const STATUS_FILTERS = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
];

const PaymentMethodsPage = () => {
    const {
        records,
        count,
        numPages,
        page,
        setPage,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        isLoading,
        error,
        setError,
        toggleActive,
        savePaymentMethod,
        deletePaymentMethod,
    } = usePaymentMethods();

    const [alertConfig, setAlertConfig] = useState(null);
    const [modalRecord, setModalRecord] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (record = null) => {
        setModalRecord(record);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalRecord(null);
        setIsModalOpen(false);
    };

    const handleSave = async (payload, id) => {
        try {
            await savePaymentMethod(payload, id);
            handleCloseModal();
        } catch (err) {
            const message = err?.response?.data?.error || 'No se pudo guardar el método.';
            setError(message);
        }
    };

    const handleDelete = (record) => {
        setAlertConfig({
            type: 'danger',
            header: 'Eliminar método',
            content: `¿Eliminar "${record.name}"? Esta acción no se puede deshacer.`,
            confirmLabel: 'Eliminar',
            onConfirm: async () => {
                const errMsg = await deletePaymentMethod(record.id);
                if (errMsg) {
                    setError(errMsg);
                }
                setAlertConfig(null);
            },
        });
    };

    const pageSummary = useMemo(() => {
        const active = records.filter((r) => r.is_active).length;
        return `En esta página: ${active} activo(s) / ${records.length - active} inactivo(s)`;
    }, [records]);

    const handleToggle = (record) => {
        setAlertConfig({
            type: record.is_active ? 'warning' : 'info',
            header: record.is_active ? 'Desactivar método' : 'Activar método',
            content: record.is_active
                ? `El método "${record.name}" quedará inactivo y no podrá usarse en nuevos pedidos.`
                : `El método "${record.name}" estará disponible nuevamente para crear pedidos.`,
            confirmLabel: record.is_active ? 'Desactivar' : 'Activar',
            onConfirm: async () => {
                await toggleActive(record);
                setAlertConfig(null);
            },
        });
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Métodos de Pago"
                subtitle={`${count} registro(s) total · ${pageSummary}`}
                icon={FiCreditCard}
                actionLabel="Nuevo Método"
                actionIcon={FiPlus}
                onAction={() => handleOpenModal()}
            />

            <AppCard accent="var(--bs-orange)">
                <AppCard.Section label="Filtros">
                    <div className="p-3 p-md-4 border-bottom">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-5">
                                <label className="form-label text-muted small mb-1">Buscar</label>
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Nombre del método"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-muted small mb-1">Estado</label>
                                <div>
                                    <FilterTabs
                                        options={STATUS_FILTERS}
                                        value={statusFilter}
                                        onChange={(val) => { setStatusFilter(val); setPage(1); }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </AppCard.Section>

                <AppCard.Section label="Listado">
                    <PaymentMethodsTable
                        records={records}
                        isLoading={isLoading}
                        onToggle={handleToggle}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
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
                <PaymentMethodModal
                    method={modalRecord}
                    onSave={handleSave}
                    onClose={handleCloseModal}
                />
            )}

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
                    type="danger"
                    header="Algo salió mal"
                    content={error}
                    onClose={() => setError(null)}
                />
            )}
        </div>
    );
};

export default PaymentMethodsPage;
