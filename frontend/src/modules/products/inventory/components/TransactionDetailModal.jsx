import React from "react";
import {
  FiX,
  FiPackage,
  FiUser,
  FiHash,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";

const TransactionDetailModal = ({ isOpen, transaction, onClose }) => {
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
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-light border-bottom">
            <h5 className="modal-title fw-bold">
              <FiHash className="me-2" />
              Detalles de la Transacción #{transaction.id}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-4">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card border-light h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                      <FiCalendar className="me-2" />
                      Fecha y Hora
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
                      <FiPackage className="me-2" />
                      Producto/Variante
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
                      <strong>Nombre:</strong>{" "}
                      {transaction.transaction_type?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-light h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                      <FiUser className="me-2" />
                      Usuario
                    </h6>
                    <p className="card-text fw-semibold">
                      {transaction.user || (
                        <span className="text-muted fst-italic">
                          No disponible
                        </span>
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
                    <p className="card-text fw-bold fs-4">
                      {transaction.quantity}
                    </p>
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

              <div className="col-md-6">
                <div className="card border-light h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                      Cantidad en UOM Base
                    </h6>
                    <p className="card-text fw-bold fs-5">
                      {transaction.base_quantity}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-light h-100">
                  <div className="card-body">
                    <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                      Multiplicador de Conversión
                    </h6>
                    <p className="card-text fw-semibold">
                      {transaction.conversion_multiplier}
                    </p>
                  </div>
                </div>
              </div>

              {transaction.reference && (
                <div className="col-12">
                  <div className="card border-light">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-3 text-muted text-uppercase small">
                        <FiFileText className="me-2" />
                        Referencia
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
                        <FiFileText className="me-2" />
                        Notas
                      </h6>
                      <p className="card-text">{transaction.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer bg-light border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <FiX className="me-2" />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TransactionDetailModal;
