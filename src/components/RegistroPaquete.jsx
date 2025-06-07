import React, { useState } from "react";

const BALDAS = Array.from({ length: 25 }, (_, i) => `B${i + 1}`);
const COMPANIAS = [
  "Seur", "Amazon", "UPS", "GLS", "CTT",
  "Celeritas", "MRW", "Correos Express", "Otros"
];

export default function RegistroPaquete({ paquetes, setPaquetes }) {
  const [cliente, setCliente] = useState("");
  const [compania, setCompania] = useState(COMPANIAS[0]);

  const sugerirBalda = () => {
    const conteo = paquetes.reduce((acc, p) => {
      acc[p.compartimento] = (acc[p.compartimento] || 0) + 1;
      return acc;
    }, {});
    return BALDAS.sort((a, b) => (conteo[a] || 0) - (conteo[b] || 0))[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cliente.trim()) {
      alert("Debes introducir un nombre de cliente.");
      return;
    }

    const nuevo = {
      cliente: cliente.trim(),
      compania,
      compartimento: sugerirBalda(),
    };

    setPaquetes([...paquetes, nuevo]);
    setCliente("");
    setCompania(COMPANIAS[0]);
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>➕ Añadir nuevo paquete</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          style={{ marginRight: "1rem", padding: "0.5rem" }}
        />
        <select value={compania} onChange={(e) => setCompania(e.target.value)} style={{ marginRight: "1rem", padding: "0.5rem" }}>
          {COMPANIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Guardar</button>
      </form>
    </div>
  );
}
