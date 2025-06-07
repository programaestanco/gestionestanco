import React, { useState } from "react";
import {
  eliminarPaquete,
  entregarPaquete,
} from "../services/paquetesService";

export default function ListaPaquetes({ paquetes, actualizarPaquetes }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCompania, setFiltroCompania] = useState("");
  const [filtroBalda, setFiltroBalda] = useState("");

  const filtrados = paquetes.filter((p) => {
    return (
      (!busqueda || p.cliente.toLowerCase().includes(busqueda.toLowerCase())) &&
      (!filtroCompania || p.compania === filtroCompania) &&
      (!filtroBalda || p.compartimento === filtroBalda)
    );
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
    <div style={{ marginTop: "2rem" }}>
      <h2>📋 Lista de paquetes</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
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
      </div>

      {filtrados.length === 0 ? (
        <p>No hay paquetes que coincidan.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>👤 Cliente</th>
              <th>🚚 Compañía</th>
              <th>📍 Compartimento</th>
              <th>📅 Fecha</th>
              <th>💰 Estado</th>
              <th>⚙️</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td>{p.cliente}</td>
                <td>{p.compania}</td>
                <td>{p.compartimento}</td>
                <td>{new Date(p.fecha_recibido).toLocaleDateString()}</td>
                <td>
                  {p.estado === "entregado"
                    ? `✅ Entregado (${p.precio}€)`
                    : "🕓 Pendiente"}
                </td>
                <td>
                  {p.estado !== "entregado" && (
                    <button onClick={() => handleEntregar(p.id)}>✅ Entregar</button>
                  )}{" "}
                  <button onClick={() => handleEliminar(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
