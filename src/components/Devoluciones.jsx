import React, { useEffect, useState } from "react";
import { eliminarPaquete } from "../services/paquetesService";
import "../styles/devoluciones.css";

export default function Devoluciones({ paquetes, actualizarPaquetes }) {
  const [devoluciones, setDevoluciones] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [toast, setToast] = useState("");

  const diasLimite = 20;

  useEffect(() => {
    const ahora = new Date();
    const vencidos = paquetes.filter((p) => {
      const fecha = new Date(p.fecha_recibido);
      const diferenciaDias = (ahora - fecha) / (1000 * 60 * 60 * 24);
      return diferenciaDias >= diasLimite && p.estado === "pendiente";
    });
    setDevoluciones(vencidos);

    if (vencidos.length > 0) {
      setToast(`⚠ Hay ${vencidos.length} paquetes con más de ${diasLimite} días sin recoger.`);
      setTimeout(() => setToast(""), 5000);
    }
  }, [paquetes]);

  const toggleSeleccionado = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const eliminarSeleccionados = async () => {
    for (const id of seleccionados) {
      await eliminarPaquete(id);
    }
    actualizarPaquetes();
    setSeleccionados([]);
  };

  return (
    <div className="devoluciones">
      <h2><i className="fas fa-undo-alt"></i> Devoluciones</h2>
      {toast && <div className="toast-aviso">{toast}</div>}
      {devoluciones.length === 0 ? (
        <p>No hay paquetes vencidos.</p>
      ) : (
        <>
          <table className="tabla-devoluciones">
            <thead>
              <tr>
                <th></th>
                <th>Cliente</th>
                <th>Compañía</th>
                <th>Balda</th>
                <th>Fecha</th>
                <th>Días</th>
              </tr>
            </thead>
            <tbody>
              {devoluciones.map((p) => {
                const dias = Math.floor((new Date() - new Date(p.fecha_recibido)) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(p.id)}
                        onChange={() => toggleSeleccionado(p.id)}
                      />
                    </td>
                    <td>{p.cliente}</td>
                    <td>{p.compania}</td>
                    <td>{p.compartimento}</td>
                    <td>{new Date(p.fecha_recibido).toLocaleDateString()}</td>
                    <td>{dias} días</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            className="btn btn-eliminar"
            onClick={eliminarSeleccionados}
            disabled={seleccionados.length === 0}
          >
            <i className="fas fa-trash-alt"></i> Eliminar seleccionados
          </button>
        </>
      )}
    </div>
  );
}
