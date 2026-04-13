import React, { useState } from "react";
import { FiPackage, FiPlus } from "react-icons/fi";
import FilterTabs from "~/core/components/FilterTabs";
import { useInventoryAdjustments } from "../hooks/useInventoryAdjustments";
import { useInventoryPageState } from "../hooks/useInventoryPageState";
import InventoryFilters from "../components/InventoryFilters";
import InventoryAdjustmentTable from "../components/InventoryAdjustmentTable";
import InventoryAdjustmentModal from "../components/InventoryAdjustmentModal";
import TransactionTypeModal from "../components/TransactionTypeModal";
import TransactionTypeList from "../components/TransactionTypeList";
import { TransactionsTab } from "../components/TransactionsTab";
import AppAlert from "~/core/components/AppAlert";
import AppCard from "~/core/components/AppCard";
import PageHeader from "~/core/components/PageHeader";

const InventoryAdjustmentsPage = () => {
  const {
    products,
    categories,
    transactionTypes,
    isLoading,
    error,
    setError,
    searchInput,
    setSearchInput,
    handleSearch,
    categoryFilter,
    setCategoryFilter,
    createAdjustment,
    createTransactionType,
    updateTransactionType,
    deleteTransactionType,
  } = useInventoryAdjustments();

  const {
    activeTab,
    setActiveTab,
    typeModal,
    setTypeModal,
    alertConfig,
    closeAlert,
    handleSaveType,
    handleDeleteType,
    handleSaveAdjustment,
  } = useInventoryPageState({
    createTransactionType,
    updateTransactionType,
    deleteTransactionType,
    createAdjustment,
    setError,
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddStock = (product) => {
    setSelectedProduct(product);
    setAdjustmentType("add");
    setIsModalOpen(true);
  };

  const handleRemoveStock = (product) => {
    setSelectedProduct(product);
    setAdjustmentType("remove");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setAdjustmentType(null);
    setIsModalOpen(false);
  };

  const tabOptions = [
    {
      value: "adjustments",
      label: "Ajuste de Inventario",
      badge: products.length,
    },
    {
      value: "types",
      label: "Tipos de Transacción",
      badge: transactionTypes.length,
    },
  ];

  return (
    <div className="container-fluid p-0">
      <PageHeader
        title="Ajuste de Inventario"
        subtitle="Gestiona el stock de tus productos"
        icon={FiPackage}
        actionLabel={activeTab === "types" ? "Nuevo Tipo" : null}
        actionIcon={FiPlus}
        onAction={() => setTypeModal("new")}
        isDark
      />

      {error && (
        <AppAlert
          type="danger"
          header="Error"
          content={error}
          onClose={() => {}}
        />
      )}

      <AppCard accent="var(--bs-primary)">
        <AppCard.Section label="Tipo">
          <div className="p-3 p-md-4 border-bottom">
            <FilterTabs
              options={tabOptions}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </AppCard.Section>

        <AppCard.Section
          label={
            activeTab === "adjustments" ? "Productos" : "Tipos de Transacción"
          }
        >
          <div className="p-3 p-md-4">
            {activeTab === "adjustments" && (
              <>
                <InventoryFilters
                  searchInput={searchInput}
                  onSearchChange={setSearchInput}
                  onSearch={handleSearch}
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  categories={categories}
                />
                <div className="table-responsive bg-body mt-3">
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="text-uppercase text-muted small">
                      <tr>
                        <th className="border-0 px-4 py-3">Producto</th>
                        <th className="border-0 py-3">Categoría</th>
                        <th className="border-0 py-3">Emprendedor</th>
                        <th className="border-0 py-3">Sede</th>
                        <th className="border-0 py-3">UOM Base</th>
                        <th className="border-0 px-4 py-3 text-end">
                          Acciones
                        </th>
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
              </>
            )}

            {activeTab === "types" && (
              <div className="table-responsive bg-body">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="text-uppercase text-muted small">
                    <tr>
                      <th className="border-0 px-4 py-3">Nombre</th>
                      <th className="border-0 py-3">Factor</th>
                      <th className="border-0 py-3">Descripción</th>
                      <th className="border-0 px-4 py-3 text-end">Acciones</th>
                    </tr>
                  </thead>
                  <TransactionTypeList
                    types={transactionTypes}
                    onEdit={setTypeModal}
                    onDelete={handleDeleteType}
                    isLoading={isLoading}
                  />
                </table>
              </div>
            )}
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
          onSave={handleSaveAdjustment}
        />
      )}

      <TransactionTypeModal
        isOpen={!!typeModal}
        transactionType={typeModal === "new" ? null : typeModal}
        onClose={() => setTypeModal(null)}
        onSave={handleSaveType}
        onDelete={handleDeleteType}
      />

      {alertConfig && (
        <AppAlert
          type={alertConfig.type}
          header={alertConfig.header}
          content={alertConfig.content}
          confirmLabel={alertConfig.confirmLabel}
          onConfirm={alertConfig.onConfirm}
          onClose={closeAlert}
        />
      )}
    </div>
  );
};

export default InventoryAdjustmentsPage;
