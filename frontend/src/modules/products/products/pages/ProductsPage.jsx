import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiPackage, FiUploadCloud } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import ProductsFilters from '../components/ProductsFilters';
import ProductsTable from '../components/ProductsTable';
import ProductModal from '../components/ProductModal';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
import AppPagination from '~/core/components/AppPagination';
import PageHeader from '~/core/components/PageHeader';

const ProductsPage = () => {
    const navigate = useNavigate();
    const {
        products, count, numPages, page, setPage, categories, entrepreneurs, businessUnits, uoms,
        isLoading, error,
        searchInput, setSearchInput,
        handleSearch,
        categoryFilter, setCategoryFilter,
        entrepreneurFilter, setEntrepreneurFilter,
        businessUnitFilter, setBusinessUnitFilter,
        baseUomFilter, setBaseUomFilter,
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
                subtitle={`${count} producto(s) registrado(s)`}
                icon={FiPackage}
                actionLabel="Nuevo Producto"
                actionIcon={FiPlus}
                onAction={() => handleOpenModal()}
                actions={(
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                        onClick={() => navigate('/dashboard/admin/products/bulk')}
                    >
                        <FiUploadCloud size={15} />
                        Carga masiva de productos
                    </button>
                )}
            />

            {error && (
                <AppAlert
                    type="danger"
                    header="Error"
                    content={error}
                />
            )}

            <AppCard accent="var(--bs-primary)">
                <AppCard.Section label="Filtros">
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
                            baseUomFilter={baseUomFilter}
                            onBaseUomChange={setBaseUomFilter}
                            categories={categories}
                            entrepreneurs={entrepreneurs}
                            businessUnits={businessUnits}
                            uoms={uoms}
                        />
                    </div>
                </AppCard.Section>

                <AppCard.Section label="Listado">
                    <div className="table-responsive bg-body">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="text-uppercase text-muted small">
                                <tr>
                                    <th className="border-0 px-4 py-3">Producto</th>
                                    <th className="border-0 py-3">Categoría</th>
                                    <th className="border-0 py-3">Emprendedor</th>
                                    <th className="border-0 py-3">Sede</th>
                                    <th className="border-0 py-3">UOM Base</th>
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

                    <AppPagination
                        page={page}
                        numPages={numPages}
                        count={count}
                        onPageChange={setPage}
                    />
                </AppCard.Section>
            </AppCard>

            {isModalOpen && (
                <ProductModal
                    product={selectedProduct}
                    categories={categories}
                    entrepreneurs={entrepreneurs}
                    businessUnits={businessUnits}
                    uoms={uoms}
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
