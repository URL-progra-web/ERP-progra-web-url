import React, { useState } from 'react';
import { FiPlus, FiPackage } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import ProductsFilters from '../components/ProductsFilters';
import ProductsTable from '../components/ProductsTable';
import ProductModal from '../components/ProductModal';
import AppAlert from '~/core/components/AppAlert';
import PageHeader from '~/core/components/PageHeader';

const ProductsPage = () => {
    const {
        products, categories, entrepreneurs, businessUnits,
        isLoading, error,
        searchInput, setSearchInput,
        handleSearch,
        categoryFilter, setCategoryFilter,
        entrepreneurFilter, setEntrepreneurFilter,
        businessUnitFilter, setBusinessUnitFilter,
        saveProduct, deleteProduct,
    } = useProducts();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);

    const handleOpenModal = (product = null) => { setSelectedProduct(product); setIsModalOpen(true); };
    const handleCloseModal = () => { setSelectedProduct(null); setIsModalOpen(false); };

    const handleSave = async (data) => {
        await saveProduct(data, selectedProduct?.id);
        handleCloseModal();
    };

    const handleConfirmDelete = (product) => {
        setAlertConfig({
            type: 'danger',
            header: '¿Eliminar este producto?',
            content: `Se eliminará "${product.name}" junto con todas sus variantes (presentaciones, SKUs). Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            onConfirm: async () => {
                await deleteProduct(product.id);
                setAlertConfig(null);
            },
        });
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Catálogo de Productos"
                subtitle={`${products.length} producto(s) registrado(s)`}
                icon={FiPackage}
                actionLabel="Nuevo Producto"
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
                    <ProductsFilters
                        searchInput={searchInput}
                        onSearchChange={setSearchInput}
                        onSearch={handleSearch}
                        categoryFilter={categoryFilter}
                        onCategoryChange={setCategoryFilter}
                        entrepreneurFilter={entrepreneurFilter}
                        onEntrepreneurChange={setEntrepreneurFilter}
                        businessUnitFilter={businessUnitFilter}
                        onBusinessUnitChange={setBusinessUnitFilter}
                        categories={categories}
                        entrepreneurs={entrepreneurs}
                        businessUnits={businessUnits}
                    />
                </div>

                <div className="bg-dark text-white px-4 py-3 border-bottom">
                    <h6 className="mb-0 text-uppercase">Listado</h6>
                </div>
                <div className="table-responsive bg-body">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="text-uppercase text-muted small">
                            <tr>
                                <th className="border-0 px-4 py-3">Producto</th>
                                <th className="border-0 py-3">Categoría</th>
                                <th className="border-0 py-3">Emprendedor</th>
                                <th className="border-0 py-3">Sede</th>
                                <th className="border-0 px-4 py-3 text-end">Acciones</th>
                            </tr>
                        </thead>
                        <ProductsTable
                            products={products}
                            isLoading={isLoading}
                            onEdit={handleOpenModal}
                            onDelete={handleConfirmDelete}
                        />
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <ProductModal
                    product={selectedProduct}
                    categories={categories}
                    entrepreneurs={entrepreneurs}
                    businessUnits={businessUnits}
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

export default ProductsPage;
