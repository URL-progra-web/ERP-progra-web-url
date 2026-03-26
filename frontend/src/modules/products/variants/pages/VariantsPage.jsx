import React, { useState } from 'react';
import { FiPlus, FiLayers } from 'react-icons/fi';
import { useVariants } from '../hooks/useVariants';
import VariantsFilters from '../components/VariantsFilters';
import VariantsTable from '../components/VariantsTable';
import VariantModal from '../components/VariantModal';
import AppAlert from '~/core/components/AppAlert';
import PageHeader from '~/core/components/PageHeader';

const VariantsPage = () => {
    const {
        variants,
        products,
        entrepreneurs,
        businessUnits,
        colors,
        sizes,
        uoms,
        isLoading,
        error,
        setError,
        searchInput, setSearchInput,
        handleSearch,
        activeFilter, setActiveFilter,
        productFilter, setProductFilter,
        entrepreneurFilter, setEntrepreneurFilter,
        businessUnitFilter, setBusinessUnitFilter,
        colorFilter, setColorFilter,
        sizeFilter, setSizeFilter,
        uomFilter, setUomFilter,
        resetFilters,
        saveVariant,
        deleteVariant,
    } = useVariants();

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState(null);

    const handleOpenModal = (variant = null) => {
        setSelectedVariant(variant);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedVariant(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data) => {
        await saveVariant(data, selectedVariant?.id);
        handleCloseModal();
    };

    const handleConfirmDelete = (variant) => {
        setAlertConfig({
            type: 'danger',
            header: '¿Eliminar esta variante?',
            content: `Se eliminará la variante "${variant.sku}" del producto "${variant.product_name}". Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            onConfirm: async () => {
                await deleteVariant(variant.id);
                setAlertConfig(null);
            },
        });
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Variantes de Productos"
                subtitle={`${variants.length} variante(s) registrada(s)`}
                icon={FiLayers}
                actionLabel="Nueva Variante"
                actionIcon={FiPlus}
                onAction={() => handleOpenModal()}
                isDark
            />

            {error && (
                <AppAlert
                    type="danger"
                    header="Error"
                    content={error}
                    onClose={() => setError(null)}
                />
            )}

            <div className="rounded-4 border shadow-sm overflow-hidden bg-body">
                <div className="bg-dark text-white px-4 py-3 border-bottom">
                    <h6 className="mb-0 text-uppercase">Filtros</h6>
                </div>

                <div className="p-3 p-md-4 border-bottom">
                    <VariantsFilters
                        searchInput={searchInput}
                        onSearchChange={setSearchInput}
                        onSearch={handleSearch}
                        activeFilter={activeFilter}
                        onActiveChange={setActiveFilter}
                        productFilter={productFilter}
                        onProductChange={setProductFilter}
                        entrepreneurFilter={entrepreneurFilter}
                        onEntrepreneurChange={setEntrepreneurFilter}
                        businessUnitFilter={businessUnitFilter}
                        onBusinessUnitChange={setBusinessUnitFilter}
                        colorFilter={colorFilter}
                        onColorChange={setColorFilter}
                        sizeFilter={sizeFilter}
                        onSizeChange={setSizeFilter}
                        uomFilter={uomFilter}
                        onUomChange={setUomFilter}
                        products={products}
                        entrepreneurs={entrepreneurs}
                        businessUnits={businessUnits}
                        colors={colors}
                        sizes={sizes}
                        uoms={uoms}
                        onReset={resetFilters}
                    />
                </div>

                <div className="bg-dark text-white px-4 py-3 border-bottom">
                    <h6 className="mb-0 text-uppercase">Listado</h6>
                </div>

                <div className="table-responsive bg-body">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="text-uppercase text-muted small">
                            <tr>
                                <th className="border-0 px-4 py-3">Producto / SKU</th>
                                <th className="border-0 py-3">Color</th>
                                <th className="border-0 py-3">Emprendedor/Proveedor</th>
                                <th className="border-0 py-3">Sede</th>
                                <th className="border-0 py-3">Talla</th>
                                <th className="border-0 py-3">U. Medida</th>
                                <th className="border-0 py-3">Costo</th>
                                <th className="border-0 py-3">Precio</th>
                                <th className="border-0 py-3">Stock / Estado</th>
                                <th className="border-0 px-4 py-3 text-end">Acciones</th>
                            </tr>
                        </thead>

                        <VariantsTable
                            variants={variants}
                            isLoading={isLoading}
                            onEdit={handleOpenModal}
                            onDelete={handleConfirmDelete}
                        />
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <VariantModal
                    variant={selectedVariant}
                    products={products}
                    colors={colors}
                    sizes={sizes}
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

export default VariantsPage;
