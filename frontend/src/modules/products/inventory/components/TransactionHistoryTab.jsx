import React from "react";
import { FiEye } from "react-icons/fi";
import TableActions from "~/core/components/TableActions";

const TransactionHistoryTab = ({
  transactions,
  isLoading,
  variants,
  transactionTypes,
  variantFilter,
  setVariantFilter,
  typeFilter,
  setTypeFilter,
  onViewDetails,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFactorBadge = (factor) => {
    if (factor === 1) {
      return (
        <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle">
          Entrada
        </span>
      );
    }
    return (
      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle">
        Salida
      </span>
    );
  };

  return (
    <div>
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label small text-muted text-uppercase">
            Filtrar por Variante (SKU)
          </label>
          <select
            className="form-select"
            value={variantFilter}
            onChange={(e) => setVariantFilter(e.target.value)}
          >
            <option value="">Todas las variantes</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.sku} - {variant.product_name || "N/A"}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label small text-muted text-uppercase">
            Filtrar por Tipo de Transacción
          </label>
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {transactionTypes.map((type) => (
              <option key={type.name} value={type.name}>
                {type.name} ({type.factor === 1 ? "Entrada" : "Salida"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary spinner-border-sm me-2"></div>
          <span className="text-muted">Cargando transacciones...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-0">No hay transacciones registradas.</p>
          <small className="text-muted">
            Las transacciones aparecerán aquí cuando realices ajustes de
            inventario.
          </small>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="text-uppercase text-muted small">
              <tr>
                <th className="border-0 px-4 py-3">Fecha</th>
                <th className="border-0 py-3">Producto</th>
                <th className="border-0 py-3">Tipo</th>
                <th className="border-0 py-3">Cantidad</th>
                <th className="border-0 py-3">UOM</th>
                <th className="border-0 py-3">Referencia</th>
                <th className="border-0 py-3">Usuario</th>
                <th className="border-0 px-4 py-3 text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-bottom border-light-subtle"
                >
                  <td className="px-4 py-3">
                    <span className="text-body small">
                      {formatDate(transaction.created_at)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="fw-semibold text-body">
                      {transaction.variant_sku || "N/A"}
                    </span>
                  </td>
                  <td className="py-3">
                    {getFactorBadge(transaction.transaction_type?.factor)}
                    <span className="ms-2 small">
                      {transaction.transaction_type?.name}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="fw-semibold">{transaction.quantity}</span>
                  </td>
                  <td className="py-3 text-secondary">
                    <span className="badge bg-light text-dark border">
                      {transaction.selected_uom_name || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 text-secondary">
                    {transaction.reference || (
                      <span className="fst-italic text-muted">
                        Sin referencia
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-secondary">
                    {transaction.user || (
                      <span className="fst-italic text-muted">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <TableActions
                      actions={[
                        {
                          icon: FiEye,
                          onClick: () => onViewDetails(transaction),
                          title: "Ver detalles",
                          variant: "primary",
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryTab;
