import React, { useState } from "react";
import ReceiptsTable from "../components/ReceiptsTable";

const ReceiptsPage = () => {
  // Estado para filtros
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="container-fluid p-3">
      <h2 className="mb-4">Listado de Recibos</h2>

      {/* FILTROS */}
      <div className="card mb-3">
        <div className="card-body">
          <h5>Filtros</h5>

          <div className="row">
            <div className="col-md-4">
              <label>Desde</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label>Hasta</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <ReceiptsTable fromDate={fromDate} toDate={toDate} />
    </div>
  );
};

export default ReceiptsPage;