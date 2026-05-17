import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import TableActions from "~/core/components/TableActions";

export const TransactionsTab = ({
  transactionTypes,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
        <span className="text-muted">Cargando tipos de transacción…</span>
      </div>
    );
  }

  if (transactionTypes.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted mb-0">
          No hay tipos de transacción configurados.
        </p>
        <small className="text-muted">
          Crea uno nuevo usando el botón "Nuevo Tipo".
        </small>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0 align-middle">
        <thead className="text-uppercase text-muted small">
          <tr>
            <th className="border-0 px-4 py-3">Nombre</th>
            <th className="border-0 py-3">Factor</th>
            <th className="border-0 py-3">Descripción</th>
            <th className="border-0 px-4 py-3 text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {transactionTypes.map((type) => (
            <tr key={type.name} className="border-bottom border-light-subtle">
              <td className="px-4 py-3">
                <span className="fw-semibold text-body">{type.name}</span>
              </td>
              <td className="py-3">
                <span
                  className={`badge ${
                    type.factor === 1
                      ? "bg-success bg-opacity-10 text-success border border-success-subtle"
                      : "bg-warning bg-opacity-10 text-warning border border-warning-subtle"
                  }`}
                >
                  {type.factor === 1 ? "Entrada (+1)" : "Salida (-1)"}
                </span>
              </td>
              <td className="py-3 text-secondary">
                <code>{type.factor}</code>
              </td>
              <td className="py-3 text-secondary">
                {type.description || (
                  <span className="fst-italic text-muted">Sin descripción</span>
                )}
              </td>
              <td className="px-4 py-3 text-end">
                <TableActions
                  actions={[
                    {
                      icon: FiEdit2,
                      onClick: () => onEdit(type),
                      title: "Editar",
                      variant: "primary",
                    },
                    {
                      icon: FiTrash2,
                      onClick: () => onDelete(type),
                      title: "Eliminar",
                      variant: "danger",
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
