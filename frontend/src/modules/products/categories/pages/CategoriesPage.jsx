import React, { useMemo, useState, useEffect } from 'react';
import { FiPlus, FiGrid } from 'react-icons/fi';
import { useCategories } from '../hooks/useCategories';
import CategoriesFilters from '../components/CategoriesFilters';
import CategoriesTable from '../components/CategoriesTable';
import CategoryModal from '../components/CategoryModal';
import CategoriesTabs from '../components/CategoriesTabs';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
import PageHeader from '~/core/components/PageHeader';

const CategoriesPage = () => {
    const {
        categories, isLoading, error,
        searchInput, setSearchInput,
        handleSearch,
        leafFilter, setLeafFilter,
        saveCategory, deleteCategory,
    } = useCategories();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);
    const [activeRoot, setActiveRoot] = useState('all');

    const categoriesWithRoot = useMemo(() => {
        if (!categories.length) return [];

        const map = new Map(categories.map(cat => [cat.id, cat]));
        const cache = new Map();

        const findRootId = (category) => {
            if (!category?.parent) return category?.id;
            if (cache.has(category.id)) return cache.get(category.id);
            const parent = map.get(category.parent);
            if (!parent) return category.id;
            const rootId = findRootId(parent);
            cache.set(category.id, rootId);
            return rootId;
        };

        return categories.map(category => ({
            ...category,
            root_id: findRootId(category),
        }));
    }, [categories]);

    const rootCategories = useMemo(() => (
        categoriesWithRoot
            .filter(category => !category.parent)
            .sort((a, b) => a.name.localeCompare(b.name))
    ), [categoriesWithRoot]);

    const branchCounts = useMemo(() => {
        return categoriesWithRoot.reduce((acc, category) => {
            const key = category.root_id || category.id;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }, [categoriesWithRoot]);

    const filteredCategories = useMemo(() => {
        if (activeRoot === 'all') return categoriesWithRoot;
        return categoriesWithRoot.filter(category => category.root_id === activeRoot);
    }, [activeRoot, categoriesWithRoot]);

    useEffect(() => {
        if (activeRoot === 'all') return;
        const rootStillExists = rootCategories.some(category => category.id === activeRoot);
        if (!rootStillExists) {
            setActiveRoot('all');
        }
    }, [activeRoot, rootCategories]);

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

            <AppCard accent="var(--bs-primary)">
                <AppCard.Section label="Filtros">
                    <div className="p-3 p-md-4 border-bottom">
                        <CategoriesFilters
                            searchInput={searchInput}
                            onSearchChange={setSearchInput}
                            onSearch={handleSearch}
                            leafFilter={leafFilter}
                            onLeafChange={setLeafFilter}
                        />
                    </div>
                </AppCard.Section>

                <AppCard.Section label="Listado">
                    {rootCategories.length > 0 && (
                        <CategoriesTabs
                            rootCategories={rootCategories}
                            activeRoot={activeRoot}
                            onChange={setActiveRoot}
                            branchCounts={branchCounts}
                            totalCount={categoriesWithRoot.length}
                        />
                    )}
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
                                categories={filteredCategories}
                                isLoading={isLoading}
                                onEdit={handleOpenModal}
                                onDelete={handleConfirmDelete}
                            />
                        </table>
                    </div>
                </AppCard.Section>
            </AppCard>

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
