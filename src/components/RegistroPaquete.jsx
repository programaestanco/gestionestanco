import React, { useState, useEffect, useCallback } from "react";
import { registrarPaquete } from "../services/paquetesService";
import { FaBoxOpen, FaLightbulb, FaCheckCircle } from "react-icons/fa";
import "../styles/registroPaquete.css";

const BALDAS = Array.from({ length: 25 }, (_, i) => `B${i + 1}`);
const COMPANIAS = [
  "Seur", "Amazon", "UPS", "GLS", "CTT",
  "Celeritas", "MRW", "CorreosExpress", "DHL", "Zeleris", "Nacex", "Envialia", "Otros"
];

export default function RegistroPaquete({ paquetes, actualizarPaquetes }) {
  const [cliente, setCliente] = useState("");
  const [compania, setCompania] = useState(() => {
    return localStorage.getItem("ultimaCompania") || COMPANIAS[0];
  });
  const [compartimento, setCompartimento] = useState("");
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compartimentoAnimado, setCompartimentoAnimado] = useState(false);

  const calcularBaldaSugerida = useCallback(() => {
    const conteo = paquetes.reduce((acc, p) => {
      if (p.estado === "entregado") return acc;
      acc[p.compartimento] = (acc[p.compartimento] || 0) + 1;
      return acc;
    }, {});

    const columnas = Array.from({ length: 5 }, (_, colIdx) =>
      BALDAS.slice(colIdx * 5, colIdx * 5 + 5)
    );

    const columnasOrdenadas = columnas
      .map((col) => {
        const total = col.reduce((sum, b) => sum + (conteo[b] || 0), 0);
        return { total, baldas: col };
      })
      .sort((a, b) => a.total - b.total);

    const menosLlena = columnasOrdenadas[0].baldas;
    return menosLlena.sort((a, b) => (conteo[a] || 0) - (conteo[b] || 0))[0];
  }, [paquetes]);

  useEffect(() => {
    setCompartimento(calcularBaldaSugerida());
  }, [paquetes, calcularBaldaSugerida]);

  useEffect(() => {
    setCompartimentoAnimado(true);
    const timeout = setTimeout(() => setCompartimentoAnimado(false), 500);
    return () => clearTimeout(timeout);
  }, [compartimento]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cliente.trim()) return alert("Introduce un nombre de cliente.");
    try {
      setLoading(true);
      await registrarPaquete({
        cliente: cliente.trim(),
        compania,
        compartimento
      });
      setCliente("");
      setExito(true);
      actualizarPaquetes();
      setCompartimento(calcularBaldaSugerida());
      setTimeout(() => setExito(false), 2500);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const conteo = paquetes.reduce((acc, p) => {
    if (p.estado === "entregado") return acc;
    acc[p.compartimento] = (acc[p.compartimento] || 0) + 1;
    return acc;
  }, {});

  const getColorClass = (cantidad) => {
    if (cantidad <= 4) return "verde";
    if (cantidad < 10) return "naranja";
    return "rojo";
  };

  const columnas = Array.from({ length: 5 }, (_, colIdx) =>
    BALDAS.slice(colIdx * 5, colIdx * 5 + 5)
  );

  return (
    <div className="registro-paquete">
      <div className="titulo-registro">
        <FaBoxOpen className="icono-registro" />
        <h2>AÑADIR NUEVO PAQUETE</h2>
      </div>

      <form className="form-paquete" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />

        <select
          value={compania}
          onChange={(e) => {
            setCompania(e.target.value);
            localStorage.setItem("ultimaCompania", e.target.value);
          }}
        >
          {COMPANIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="info-sugerencias">
          <span>
            <FaLightbulb className="icono-sugerencia" />
            <strong>Sugerido:</strong> {calcularBaldaSugerida()}
          </span>
          <span className={`seleccionado-animado ${compartimentoAnimado ? 'activo' : ''}`}>
            <FaCheckCircle className="icono-sugerencia" />
            <strong>Seleccionado:</strong> {compartimento}
          </span>
        </div>

        <div className="balda-selector">
          {columnas.map((col, idx) => (
            <div key={idx} className="columna-baldas">
              {col.map((b) => {
                const cantidad = conteo[b] || 0;
                const activa = compartimento === b;
                return (
                  <button
                    key={b}
                    type="button"
                    className={`balda-boton ${getColorClass(cantidad)} ${activa ? "activa" : ""}`}
                    onClick={() => setCompartimento(b)}
                  >
                    {b}
                    <small>{cantidad} pkg</small>
                  </button>
                );
              })}
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
            <FaCheckCircle className="icono-registro" />
            ¡Paquete almacenado con éxito!
          </div>
        </div>
      )}
    </div>
  );
}
