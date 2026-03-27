import React, { useState, useMemo } from "react";
import { receiptsMocks } from "../../receipts.mocks";

const ReceiptsTable = ({ fromDate, toDate }) => {
  const data = receiptsMocks.receipts;

  // 🔹 PAGINACIÓN
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // 🔹 FILTRO POR FECHA
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const date = new Date(item.issued_at);

      if (fromDate && new Date(fromDate) > date) return false;
      if (toDate && new Date(toDate) < date) return false;

      return true;
    });
  }, [data, fromDate, toDate]);

  // 🔹 PAGINACIÓN LÓGICA
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const paginatedData = filteredData.slice(start, end);

  return (
    <div className="card">
      <div className="card-body">
        {/* TABLA */}
        <table className="table table-striped">
          <thead>
            <tr>
              <th># Recibo</th>
              <th>Emitido por</th>
              <th>Total</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id}>
                  <td>{item.receipt_number}</td>
                  <td>{item.issued_by.name}</td>
                  <td>Q {item.grand_total}</td>
                  <td>
                    {new Date(item.issued_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No hay datos
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        <div className="d-flex justify-content-between">
          <button
            className="btn btn-outline-primary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>

          <span>
            Página {page} de {totalPages || 1}
          </span>

          <button
            className="btn btn-outline-primary"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptsTable;