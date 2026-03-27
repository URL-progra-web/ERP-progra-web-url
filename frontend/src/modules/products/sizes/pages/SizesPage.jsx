import React, { useState } from 'react';
import { FiPlus, FiTag } from 'react-icons/fi';
import { useSizes } from '../hooks/useSizes';
import SizesFilters from '../components/SizesFilters';
import SizesTable from '../components/SizesTable';
import SizeModal from '../components/SizeModal';
import AppAlert from '~/core/components/AppAlert';
import PageHeader from '~/core/components/PageHeader';

const SizesPage = () => {
    const {
        sizes, isLoading, error,
        searchInput, setSearchInput,
        handleSearch,
        saveSize, deleteSize,
    } = useSizes();

    const [selectedSize, setSelectedSize] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);

    const handleOpenModal = (size = null) => {
        setSelectedSize(size);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedSize(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data) => {
        await saveSize(data, selectedSize?.id);
        handleCloseModal();
    };

    const handleConfirmDelete = (size) => {
        setAlertConfig({
            type: 'danger',
            header: '¿Eliminar esta talla?',
            content: `Se eliminará "${size.name}". Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            onConfirm: async () => {
                await deleteSize(size.id);
                setAlertConfig(null);
            },
        });
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Tallas de Productos"
                subtitle={`${sizes.length} talla(s) registrada(s)`}
                icon={FiTag}
                actionLabel="Nueva Talla"
                actionIcon={FiPlus}
                onAction={() => handleOpenModal()}
                isDark
            />

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="rounded-4 border shadow-sm overflow-hidden bg-body">
                <div className="bg-dark text-white px-4 py-3 border-bottom">
                    <h6 className="mb-0 text-uppercase">Filtros</h6>
                </div>

                <div className="p-3 p-md-4 border-bottom">
                    <SizesFilters
                        searchInput={searchInput}
                        onSearchChange={setSearchInput}
                        onSearch={handleSearch}
                    />
                </div>

                <div className="bg-dark text-white px-4 py-3 border-bottom">
                    <h6 className="mb-0 text-uppercase">Listado</h6>
                </div>

                <div className="table-responsive bg-body">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="text-uppercase text-muted small">
                            <tr>
                                <th className="border-0 px-4 py-3">Talla</th>
                                <th className="border-0 py-3">Creada</th>
                                <th className="border-0 px-4 py-3 text-end">Acciones</th>
                            </tr>
                        </thead>

                        <SizesTable
                            sizes={sizes}
                            isLoading={isLoading}
                            onEdit={handleOpenModal}
                            onDelete={handleConfirmDelete}
                        />
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <SizeModal
                    size={selectedSize}
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

export default SizesPage;