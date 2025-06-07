import React, { useState } from "react";
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
  const [loading, setLoading] = useState(false);

  const sugerirBalda = () => {
    const conteo = paquetes.reduce((acc, p) => {
      acc[p.compartimento] = (acc[p.compartimento] || 0) + 1;
      return acc;
    }, {});
    return BALDAS.sort((a, b) => (conteo[a] || 0) - (conteo[b] || 0))[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cliente.trim()) {
      alert("Debes introducir un nombre de cliente.");
      return;
    }

    try {
      setLoading(true);
      await registrarPaquete({
        cliente: cliente.trim(),
        compania,
        compartimento: sugerirBalda(),
      });
      setCliente("");
      setCompania(COMPANIAS[0]);
      await actualizarPaquetes();
    } catch (err) {
      alert("Hubo un error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-paquete">
      <h2><i className="fas fa-plus-circle"></i> Añadir nuevo paquete</h2>
      <form onSubmit={handleSubmit} className="form-paquete">
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
        <select
          value={compania}
          onChange={(e) => setCompania(e.target.value)}
        >
          {COMPANIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}
