import React, { useState } from 'react';
import { FiPlus, FiGrid } from 'react-icons/fi';
import { useCategories } from '../hooks/useCategories';
import CategoriesFilters from '../components/CategoriesFilters';
import CategoriesTable from '../components/CategoriesTable';
import CategoryModal from '../components/CategoryModal';
import AppAlert from '~/core/components/AppAlert';
import PageHeader from '~/core/components/PageHeader';

const CategoriesPage = () => {
    const {
        categories, isLoading, error,
        searchInput, setSearchInput,
        leafFilter, setLeafFilter,
        saveCategory, deleteCategory,
    } = useCategories();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);

    const handleOpenModal = (category = null) => { setSelectedCategory(category); setIsModalOpen(true); };
    const handleCloseModal = () => { setSelectedCategory(null); setIsModalOpen(false); };

    const handleSave = async (data) => {
        await saveCategory(data, selectedCategory?.id);
        handleCloseModal();
    };

    const handleConfirmDelete = (category) => {
        setAlertConfig({
            type: 'danger',
            header: '¿Eliminar esta categoría?',
            content: `Se eliminará "${category.name}" y los productos que la usen quedarán sin categoría. Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            onConfirm: async () => {
                await deleteCategory(category.id);
                setAlertConfig(null);
            },
        });
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Categorías de Productos"
                subtitle={`${categories.length} categoría(s) registrada(s)`}
                icon={FiGrid}
                actionLabel="Nueva Categoría"
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
                    <CategoriesFilters
                        searchInput={searchInput}
                        onSearchChange={setSearchInput}
                        leafFilter={leafFilter}
                        onLeafChange={setLeafFilter}
                    />
                </div>

                <div className="bg-dark text-white px-4 py-3 border-bottom">
                    <h6 className="mb-0 text-uppercase">Listado</h6>
                </div>
                <div className="table-responsive bg-body">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="text-uppercase text-muted small">
                            <tr>
                                <th className="border-0 px-4 py-3">Categoría</th>
                                <th className="border-0 py-3">Tipo</th>
                                <th className="border-0 py-3">Creada</th>
                                <th className="border-0 px-4 py-3 text-end">Acciones</th>
                            </tr>
                        </thead>
                        <CategoriesTable
                            categories={categories}
                            isLoading={isLoading}
                            onEdit={handleOpenModal}
                            onDelete={handleConfirmDelete}
                        />
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <CategoryModal
                    category={selectedCategory}
                    categories={categories}
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

export default CategoriesPage;
