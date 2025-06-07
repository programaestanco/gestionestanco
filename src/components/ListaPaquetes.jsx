import React, { useState } from "react";
import {
  eliminarPaquete,
  entregarPaquete,
} from "../services/paquetesService";
import "../styles/listaPaquetes.css";

export default function ListaPaquetes({ paquetes, actualizarPaquetes }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCompania, setFiltroCompania] = useState("");
  const [filtroBalda, setFiltroBalda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("pendiente");

  const filtrados = paquetes.filter((p) => {
    const coincideBusqueda = !busqueda || p.cliente.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCompania = !filtroCompania || p.compania === filtroCompania;
    const coincideBalda = !filtroBalda || p.compartimento === filtroBalda;
    const coincideEstado = filtroEstado === "todos" || p.estado === filtroEstado;

    return coincideBusqueda && coincideCompania && coincideBalda && coincideEstado;
  });

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este paquete?")) return;
    await eliminarPaquete(id);
    await actualizarPaquetes();
  };

  const handleEntregar = async (id) => {
    await entregarPaquete(id);
    await actualizarPaquetes();
  };

  return (
    <div className="lista-paquetes">
      <h2>
        <i className="fas fa-boxes-stacked"></i> Lista de Paquetes
      </h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select value={filtroCompania} onChange={(e) => setFiltroCompania(e.target.value)}>
          <option value="">Todas las compañías</option>
          {[...new Set(paquetes.map(p => p.compania))].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select value={filtroBalda} onChange={(e) => setFiltroBalda(e.target.value)}>
          <option value="">Todas las baldas</option>
          {[...new Set(paquetes.map(p => p.compartimento))].map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>

        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="pendiente">Pendientes</option>
          <option value="entregado">Entregados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <p className="sin-paquetes">No hay paquetes que coincidan.</p>
      ) : (
        <table className="tabla-paquetes">
          <thead>
            <tr>
              <th><i className="fas fa-user"></i> Cliente</th>
              <th><i className="fas fa-truck"></i> Compañía</th>
              <th><i className="fas fa-layer-group"></i> Balda</th>
              <th><i className="fas fa-calendar-day"></i> Fecha</th>
              <th><i className="fas fa-tag"></i> Estado</th>
              <th><i className="fas fa-cogs"></i></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td data-label="Cliente">{p.cliente}</td>
                <td data-label="Compañía">{p.compania}</td>
                <td data-label="Balda">{p.compartimento}</td>
                <td data-label="Fecha">{new Date(p.fecha_recibido).toLocaleDateString()}</td>
                <td
                  data-label="Estado"
                  className={p.estado === "entregado" ? "estado-entregado" : "estado-pendiente"}
                >
                  {p.estado === "entregado"
                    ? `Entregado (${p.precio} €)`
                    : "Pendiente"}
                </td>
                <td data-label="Acciones">
                  {p.estado !== "entregado" && (
                    <button className="btn btn-entregar" onClick={() => handleEntregar(p.id)}>
                      <i className="fas fa-check"></i>
                    </button>
                  )}
                  <button className="btn btn-eliminar" onClick={() => handleEliminar(p.id)}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
