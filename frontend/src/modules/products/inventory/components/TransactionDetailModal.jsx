import React from "react";
import {
  FiPackage,
  FiUser,
  FiHash,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import AppModal from "~/core/components/AppModal";

const TransactionDetailModal = ({ isOpen, transaction, userMap, onClose }) => {
  if (!isOpen || !transaction) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getFactorBadge = (factor) => {
    if (factor === 1) {
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle fs-6">
          Entrada (+1)
        </span>
      );
    }
    return (
      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle fs-6">
        Salida (-1)
      </span>
    );
  };

  return (
    <AppModal
      isOpen={isOpen}
      title={`Detalles de la Transacción #${transaction.id}`}
      accent="var(--bs-primary)"
      onClose={onClose}
      size="lg"
      footer={
        <div
          className="d-flex justify-content-end gap-2 px-4 py-3"
          style={{ borderTop: "1px solid var(--bs-border-color)" }}
        >
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-light h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                <FiCalendar className="me-2" /> Fecha y Hora
              </h6>
              <p className="card-text fw-semibold">
                {formatDate(transaction.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-light h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                <FiPackage className="me-2" /> Producto/Variante
              </h6>
              <p className="card-text fw-semibold">
                {transaction.variant_sku || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-light h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                Tipo de Transacción
              </h6>
              <div className="mb-2">
                {getFactorBadge(transaction.transaction_type?.factor)}
              </div>
              <p className="card-text">
                <strong>Nombre:</strong> {transaction.transaction_type?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-light h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                <FiUser className="me-2" /> Usuario
              </h6>
              <p className="card-text fw-semibold">
                {userMap?.[transaction.user] || (
                  <span className="text-muted fst-italic">No disponible</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-light h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                Cantidad
              </h6>
              <p className="card-text fw-bold fs-4">{transaction.quantity}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-light h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                UOM Seleccionada
              </h6>
              <p className="card-text fw-semibold">
                {transaction.selected_uom_name || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-light h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                UOM Base
              </h6>
              <p className="card-text fw-semibold">
                {transaction.base_uom_name || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {transaction.reference && (
          <div className="col-12">
            <div className="card border-light">
              <div className="card-body">
                <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                  <FiFileText className="me-2" /> Referencia
                </h6>
                <p className="card-text">{transaction.reference}</p>
              </div>
            </div>
          </div>
        )}

        {transaction.notes && (
          <div className="col-12">
            <div className="card border-light">
              <div className="card-body">
                <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                  <FiFileText className="me-2" /> Notas
                </h6>
                <p className="card-text">{transaction.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default TransactionDetailModal;
