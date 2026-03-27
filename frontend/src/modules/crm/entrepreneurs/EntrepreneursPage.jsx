import React, { useState } from 'react';
import { FiBriefcase, FiPlus } from 'react-icons/fi';
import { useEntrepreneurs } from './hooks/useEntrepreneurs';
import { EntrepreneursFilters } from './components/EntrepreneursFilters';
import { EntrepreneursTable } from './components/EntrepreneursTable';
import { EntrepreneurModal } from './components/EntrepreneurModal';
import AppAlert from '~/core/components/AppAlert';
import PageHeader from '~/core/components/PageHeader';
import AppPagination from '~/core/components/AppPagination';

const EntrepreneursPage = () => {
    const {
        entrepreneurs,
        users,
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
        saveEntrepreneur,
        deleteEntrepreneur,
        applyFilters,
    } = useEntrepreneurs();

    const [modalEntrepreneur, setModalEntrepreneur] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);

    const handleOpenModal = (entrepreneur = null) => {
        setModalEntrepreneur(entrepreneur);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalEntrepreneur(null);
        setIsModalOpen(false);
    };

    const handleSave = async (payload, id) => {
        try {
            await saveEntrepreneur(payload, id);
            handleCloseModal();
        } catch (err) {
            const message = err?.response?.data?.error || 'No se pudo guardar el emprendedor.';
            setError(message);
        }
    };

    const handleDelete = (entrepreneur) => {
        setAlertConfig({
            type: 'danger',
            header: 'Eliminar emprendedor',
            content: `¿Eliminar a ${entrepreneur.company_name}? Esta acción no se puede deshacer.`,
            confirmLabel: 'Eliminar',
            onConfirm: async () => {
                const errMsg = await deleteEntrepreneur(entrepreneur.id);
                if (errMsg) {
                    setError(errMsg);
                }
                setAlertConfig(null);
            },
        });
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Emprendedores"
                subtitle={`${count} registro(s) encontrados`}
                icon={FiBriefcase}
                actionLabel="Nuevo emprendedor"
                actionIcon={FiPlus}
                onAction={() => handleOpenModal()}
            />

            <div className="card border-0 shadow-lg mb-4 overflow-hidden">
                <div className="bg-black text-white px-4 py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h6 className="mb-0 text-uppercase small">Filtros avanzados</h6>
                        <span className="badge bg-dark-subtle text-dark">{entrepreneurs.length} visibles</span>
                    </div>
                </div>
                <div className="card-body bg-body-secondary">
                    <EntrepreneursFilters
                        search={search}
                        onSearchChange={setSearch}
                        createdFrom={createdFrom}
                        onCreatedFromChange={setCreatedFrom}
                        createdTo={createdTo}
                        onCreatedToChange={setCreatedTo}
                        onSubmit={applyFilters}
                    />
                </div>
            </div>

            <div className="card border-0 shadow-lg overflow-hidden">
                <div className="bg-black text-white px-4 py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h6 className="mb-0 text-uppercase small">Listado de emprendedores</h6>
                        <small className="text-white-50">{count} registro(s) totales</small>
                    </div>
                    <span className="badge bg-dark-subtle text-dark">Página {page} de {numPages}</span>
                </div>
                <div className="bg-body px-3 px-md-4 py-3">
                    <EntrepreneursTable
                        entrepreneurs={entrepreneurs}
                        isLoading={isLoading}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
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
                <EntrepreneurModal
                    entrepreneur={modalEntrepreneur}
                    users={users}
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
                    type="warning"
                    header="Atención"
                    content={error}
                    onClose={() => setError(null)}
                />
            )}
        </div>
    );
};

export default EntrepreneursPage;
