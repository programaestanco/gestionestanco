import React, { useState, useEffect } from "react";
import { registrarPaquete } from "../services/paquetesService";
import "../styles/registroPaquete.css";

const BALDAS = Array.from({ length: 25 }, (_, i) => `B${i + 1}`);
const COMPANIAS = [
  "Seur", "Amazon", "UPS", "GLS", "CTT",
  "Celeritas", "MRW", "Correos Express", "Otros"
];

export default function RegistroPaquete({ paquetes, actualizarPaquetes }) {
  const [cliente, setCliente] = useState("");
  const [compania, setCompania] = useState(COMPANIAS[0]);
  const [baldaSugerida, setBaldaSugerida] = useState("");
  const [baldaSeleccionada, setBaldaSeleccionada] = useState("");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const columnas = Array.from({ length: 5 }, (_, colIdx) =>
    BALDAS.slice(colIdx * 5, colIdx * 5 + 5)
  );

  const calcularBaldaSugerida = () => {
    const conteo = paquetes.reduce((acc, p) => {
      acc[p.compartimento] = (acc[p.compartimento] || 0) + 1;
      return acc;
    }, {});
    const columnasOrdenadas = columnas
      .map((col) => {
        const total = col.reduce((sum, b) => sum + (conteo[b] || 0), 0);
        return { total, baldas: col };
      })
      .sort((a, b) => a.total - b.total);

    const menosLlena = columnasOrdenadas[0].baldas;
    return menosLlena.sort((a, b) => (conteo[a] || 0) - (conteo[b] || 0))[0];
  };

  useEffect(() => {
    const sugerida = calcularBaldaSugerida();
    setBaldaSugerida(sugerida);
    setBaldaSeleccionada(sugerida);
  }, [paquetes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cliente.trim()) {
      alert("Introduce un nombre de cliente.");
      return;
    }

    try {
      setLoading(true);
      await registrarPaquete({
        cliente: cliente.trim(),
        compania,
        compartimento: baldaSeleccionada,
      });
      setCliente("");
      setCompania(COMPANIAS[0]);
      setExito(true);
      actualizarPaquetes(); // sin await
      setTimeout(() => setExito(false), 3000);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-paquete">
      <h2><i className="fas fa-plus-circle"></i> Añadir nuevo paquete</h2>

      <form className="form-paquete" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
        <select value={compania} onChange={(e) => setCompania(e.target.value)}>
          {COMPANIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="info-sugerencias">
          <p><strong>💡 Sugerido:</strong> {baldaSugerida}</p>
          <p><strong>✅ Seleccionado:</strong> {baldaSeleccionada}</p>
        </div>

        <div className="balda-selector">
          {columnas.map((col, idx) => (
            <div key={idx} className="columna-baldas">
              {col.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`balda-boton ${baldaSeleccionada === b ? "activa" : ""}`}
                  onClick={() => setBaldaSeleccionada(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar paquete"}
        </button>
      </form>

      {exito && (
        <div className="modal-exito1">
          <div className="modal-contenido">
            <i className="fas fa-check-circle"></i>
            ¡Paquete almacenado con éxito!
          </div>
        </div>
      )}
    </div>
  );
}
