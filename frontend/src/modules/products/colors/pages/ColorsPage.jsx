import React, { useState } from 'react';
import { FiPlus, FiDroplet } from 'react-icons/fi';
import { useColors } from '../hooks/useColors';
import ColorsFilters from '../components/ColorsFilters';
import ColorsTable from '../components/ColorsTable';
import ColorModal from '../components/ColorModal';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
import AppPagination from '~/core/components/AppPagination';
import PageHeader from '~/core/components/PageHeader';

const ColorsPage = () => {
    const {
        colors, count, numPages, page, setPage, isLoading, error,
        searchInput, setSearchInput,
        handleSearch,
        saveColor, deleteColor,
    } = useColors();

    const [selectedColor, setSelectedColor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);

    const handleOpenModal = (color = null) => {
        setSelectedColor(color);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedColor(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data) => {
        await saveColor(data, selectedColor?.id);
        handleCloseModal();
    };

    const handleConfirmDelete = (color) => {
        setAlertConfig({
            type: 'danger',
            header: '¿Eliminar este color?',
            content: `Se eliminará "${color.name}". Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            onConfirm: async () => {
                await deleteColor(color.id);
                setAlertConfig(null);
            },
        });
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Colores de Productos"
                subtitle={`${count} color(es) registrado(s)`}
                icon={FiDroplet}
                actionLabel="Nuevo Color"
                actionIcon={FiPlus}
                onAction={() => handleOpenModal()}
                isDark
            />

            {error && <div className="alert alert-danger">{error}</div>}

            <AppCard accent="var(--bs-primary)">
                <AppCard.Section label="Filtros">
                    <div className="p-3 p-md-4 border-bottom">
                        <ColorsFilters
                            searchInput={searchInput}
                            onSearchChange={setSearchInput}
                            onSearch={handleSearch}
                        />
                    </div>
                </AppCard.Section>

                <AppCard.Section label="Listado">
                    <div className="table-responsive bg-body">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="text-uppercase text-muted small">
                                <tr>
                                    <th className="border-0 px-4 py-3">Color</th>
                                    <th className="border-0 py-3">Código</th>
                                    <th className="border-0 py-3">Vista</th>
                                    <th className="border-0 py-3">Creado</th>
                                    <th className="border-0 px-4 py-3 text-end">Acciones</th>
                                </tr>
                            </thead>

                            <ColorsTable
                                colors={colors}
                                isLoading={isLoading}
                                onEdit={handleOpenModal}
                                onDelete={handleConfirmDelete}
                            />
                        </table>
                    </div>

                    <AppPagination
                        page={page}
                        numPages={numPages}
                        count={count}
                        onPageChange={setPage}
                    />
                </AppCard.Section>
            </AppCard>

            {isModalOpen && (
                <ColorModal
                    color={selectedColor}
                    onClose={handleCloseModal}
                    onSave={handleSave}
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

export default ColorsPage;
