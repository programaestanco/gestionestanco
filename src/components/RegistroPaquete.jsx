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
  const [loading, setLoading] = useState(false);
  const [baldaSugerida, setBaldaSugerida] = useState("");

  const calcularBalda = () => {
    const conteo = paquetes.reduce((acc, p) => {
      acc[p.compartimento] = (acc[p.compartimento] || 0) + 1;
      return acc;
    }, {});

    const columnas = Array.from({ length: 5 }, (_, i) =>
      BALDAS.slice(i * 5, i * 5 + 5)
    );

    const columnaOrdenada = columnas
      .map((col) => {
        const total = col.reduce((sum, b) => sum + (conteo[b] || 0), 0);
        return { total, baldas: col };
      })
      .sort((a, b) => a.total - b.total);

    const columnaMenosLlena = columnaOrdenada[0].baldas;
    return [...columnaMenosLlena].sort(
      (a, b) => (conteo[a] || 0) - (conteo[b] || 0)
    )[0];
  };

  useEffect(() => {
    if (paquetes.length > 0) {
      const sugerida = calcularBalda();
      setBaldaSugerida(sugerida);
    }
  }, [paquetes]);

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
        compartimento: baldaSugerida,
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
      <h2>
        <i className="fas fa-plus-circle"></i> Registrar nuevo paquete
      </h2>

      <form onSubmit={handleSubmit} className="form-paquete">
        <div className="form-group">
          <label><i className="fas fa-user"></i> Cliente</label>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label><i className="fas fa-truck"></i> Compañía</label>
          <select
            value={compania}
            onChange={(e) => setCompania(e.target.value)}
          >
            {COMPANIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-guardar" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {baldaSugerida && (
        <div className="sugerencia-balda">
          <i className="fas fa-lightbulb"></i> Balda sugerida:&nbsp;
          <strong>{baldaSugerida}</strong>
        </div>
      )}
    </div>
  );
}
