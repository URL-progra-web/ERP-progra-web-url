import React, { useState } from "react";
import { FiPackage, FiSettings } from "react-icons/fi";
import { useInventoryAdjustments } from "../hooks/useInventoryAdjustments";
import InventoryFilters from "../components/InventoryFilters";
import InventoryAdjustmentTable from "../components/InventoryAdjustmentTable";
import InventoryAdjustmentModal from "../components/InventoryAdjustmentModal";
import TransactionTypeModal from "../components/TransactionTypeModal";
import TransactionTypeList from "../components/TransactionTypeList";
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

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [alertConfig, setAlertConfig] = useState(null);

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

  const handleOpenTypeModal = (type = null) => {
    setSelectedType(type);
    setIsTypeModalOpen(true);
  };

  const handleCloseTypeModal = () => {
    setSelectedType(null);
    setIsTypeModalOpen(false);
  };

  const handleSaveType = async (data) => {
    try {
      if (selectedType) {
        await updateTransactionType(selectedType.name, data);
        showAlert(
          "success",
          "Tipo actualizado",
          "El tipo de transacción se actualizó correctamente.",
        );
      } else {
        await createTransactionType(data);
        showAlert(
          "success",
          "Tipo creado",
          "El tipo de transacción se creó correctamente.",
        );
      }
      handleCloseTypeModal();
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        "No se pudo guardar el tipo de transacción.";
      showAlert("danger", "Error", message);
    }
  };

  const handleDeleteType = async (name) => {
    try {
      await deleteTransactionType(name);
      showAlert(
        "success",
        "Tipo eliminado",
        "El tipo de transacción se eliminó correctamente.",
      );
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        "No se pudo eliminar el tipo de transacción.";
      showAlert("danger", "Error", message);
    }
  };

  const showAlert = (type, header, content) => {
    setAlertConfig({
      type,
      header,
      content,
      onClose: () => setAlertConfig(null),
    });
  };

  const handleSave = async (data) => {
    try {
      await createAdjustment(data);
      showAlert(
        "success",
        "Ajuste registrado",
        "El ajuste de inventario se ha registrado correctamente.",
      );
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        "No se pudo registrar el ajuste de inventario.";
      showAlert("danger", "Error", message);
    }
  };

  return (
    <div className="container-fluid p-0">
      <PageHeader
        title="Ajuste de Inventario"
        subtitle={`${products.length} producto(s) disponible(s)`}
        icon={FiPackage}
        isDark
        actionLabel="Configurar Tipos"
        actionIcon={FiSettings}
        onAction={() => handleOpenTypeModal(null)}
      />

      {error && <AppAlert type="danger" header="Error" content={error} />}

      <AppCard accent="var(--bs-primary)" className="mb-4">
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

      <AppCard accent="var(--bs-secondary)">
        <AppCard.Section label="Tipos de Transacción">
          <div className="table-responsive bg-body">
            <table className="table table-hover mb-0 align-middle">
              <thead className="text-uppercase text-muted small">
                <tr>
                  <th className="border-0 px-4 py-3">Nombre</th>
                  <th className="border-0 py-3">Tipo</th>
                  <th className="border-0 py-3">Descripción</th>
                  <th className="border-0 px-4 py-3 text-end">Acciones</th>
                </tr>
              </thead>
              <TransactionTypeList
                types={transactionTypes}
                onEdit={handleOpenTypeModal}
                onDelete={handleDeleteType}
                isLoading={isLoading}
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

      <TransactionTypeModal
        isOpen={isTypeModalOpen}
        transactionType={selectedType}
        onClose={handleCloseTypeModal}
        onSave={handleSaveType}
        onDelete={handleDeleteType}
      />

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
