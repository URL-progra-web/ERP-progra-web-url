import React, { useState } from 'react';
import { FiPackage } from 'react-icons/fi';
import { useInventoryAdjustments } from '../hooks/useInventoryAdjustments';
import InventoryFilters from '../components/InventoryFilters';
import InventoryAdjustmentTable from '../components/InventoryAdjustmentTable';
import InventoryAdjustmentModal from '../components/InventoryAdjustmentModal';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
import PageHeader from '~/core/components/PageHeader';

const InventoryAdjustmentsPage = () => {
    const {
        products, categories, transactionTypes,
        isLoading, error,
        searchInput, setSearchInput,
        handleSearch,
        categoryFilter, setCategoryFilter,
        createAdjustment,
    } = useInventoryAdjustments();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [adjustmentType, setAdjustmentType] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);

    const handleAddStock = (product) => {
        setSelectedProduct(product);
        setAdjustmentType('add');
        setIsModalOpen(true);
    };

    const handleRemoveStock = (product) => {
        setSelectedProduct(product);
        setAdjustmentType('remove');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedProduct(null);
        setAdjustmentType(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data) => {
        try {
            await createAdjustment(data);
            setAlertConfig({
                type: 'success',
                header: 'Ajuste registrado',
                content: 'El ajuste de inventario se ha registrado correctamente.',
                onClose: () => setAlertConfig(null),
            });
        } catch {
            setAlertConfig({
                type: 'danger',
                header: 'Error',
                content: 'No se pudo registrar el ajuste de inventario.',
                onClose: () => setAlertConfig(null),
            });
        }
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Ajuste de Inventario"
                subtitle={`${products.length} producto(s) disponible(s)`}
                icon={FiPackage}
                isDark
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
                        <InventoryFilters
                            searchInput={searchInput}
                            onSearchChange={setSearchInput}
                            onSearch={handleSearch}
                            categoryFilter={categoryFilter}
                            onCategoryChange={setCategoryFilter}
                            categories={categories}
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
                            <InventoryAdjustmentTable
                                products={products}
                                isLoading={isLoading}
                                onAddStock={handleAddStock}
                                onRemoveStock={handleRemoveStock}
                            />
                        </table>
                    </div>
                </AppCard.Section>
            </AppCard>

            {isModalOpen && (
                <InventoryAdjustmentModal
                    isOpen={isModalOpen}
                    product={selectedProduct}
                    transactionTypes={transactionTypes}
                    adjustmentType={adjustmentType}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}

            {alertConfig && (
                <AppAlert
                    type={alertConfig.type}
                    header={alertConfig.header}
                    content={alertConfig.content}
                    onClose={alertConfig.onClose}
                />
            )}
        </div>
    );
};

export default InventoryAdjustmentsPage;
