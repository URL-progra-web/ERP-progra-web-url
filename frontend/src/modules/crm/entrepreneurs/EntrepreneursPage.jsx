import React, { useState } from 'react';
import { FiBriefcase, FiPlus } from 'react-icons/fi';
import { useEntrepreneurs } from './hooks/useEntrepreneurs';
import { EntrepreneursFilters } from './components/EntrepreneursFilters';
import { EntrepreneursTable } from './components/EntrepreneursTable';
import { EntrepreneurModal } from './components/EntrepreneurModal';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
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
                isDark
            />

            {error && !alertConfig && <div className="alert alert-warning">{error}</div>}

            <AppCard accent="var(--bs-success)">
                <AppCard.Section label="Filtros">
                    <div className="p-3 p-md-4 border-bottom">
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
                </AppCard.Section>

                <AppCard.Section label="Listado de emprendedores">
                    <EntrepreneursTable
                        entrepreneurs={entrepreneurs}
                        isLoading={isLoading}
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

        </div>
    );
};

export default EntrepreneursPage;
