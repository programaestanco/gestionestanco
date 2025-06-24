import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { FaChartLine } from "react-icons/fa";
import { obtenerVolumenPaquetes } from "../services/paquetesService";
import "../styles/VolumenPaquetes.css";

export default function VolumenPaquetes() {
  const [vista, setVista] = useState("anual");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [datos, setDatos] = useState([]);
  const [error, setError] = useState(null);

  const debeElegirFecha = ["diaria", "semanal", "mensual", "historial"].includes(vista);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const data = await obtenerVolumenPaquetes(vista, debeElegirFecha ? fecha : undefined);

        const ordenar = (data) => {
          if (vista === "mensual" || vista === "diaria") {
            return data.sort((a, b) => parseInt(a.periodo) - parseInt(b.periodo));
          } else if (vista === "semanal") {
            const orden = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
            return data.sort((a, b) => orden.indexOf(a.periodo) - orden.indexOf(b.periodo));
          } else if (vista === "anual") {
            const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            return data.sort((a, b) => meses.indexOf(a.periodo) - meses.indexOf(b.periodo));
          } else if (vista === "historial") {
            return data.sort((a, b) => new Date(a.periodo) - new Date(b.periodo));
          }
          return data;
        };

        setDatos(ordenar(data));
        setError(null);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setDatos([]);
        setError(err.message || "Error inesperado");
      }
    };

    obtenerDatos();
  }, [vista, fecha]);

  const ejesXLabel = {
    mensual: "Día del Mes",
    semanal: "Día de la Semana",
    anual: "Mes",
    diaria: "Hora del Día",
    historial: "Fecha",
  };

  const formatoEjeX = (tick) => {
    if (vista === "diaria") return `${tick}h`;
    if (vista === "historial") {
      const d = new Date(tick);
      return isNaN(d) ? tick : `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    }
    return tick;
  };

  return (
    <div className="grafico-hubspot">
      <div className="cabecera-grafico">
        <div>
          <h3><FaChartLine /> Volumen de Paquetes <small style={{ fontWeight: "normal" }}>({vista === "historial" ? "Histórico completo" : vista.charAt(0).toUpperCase() + vista.slice(1)})</small></h3>
          <p className="ejes-ayuda">
            Eje X: {ejesXLabel[vista]} · Eje Y: Cantidad de paquetes
          </p>
        </div>
        <div className="botones-vista">
          {["anual", "mensual", "semanal", "diaria", "historial"].map((tipo) => (
            <button
              key={tipo}
              className={vista === tipo ? "activo" : ""}
              onClick={() => setVista(tipo)}
            >
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {debeElegirFecha && (
        <div className="selector-fecha">
          Ver por fecha:{" "}
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
      )}

      {error ? (
        <p className="error-carga">⚠ Error al cargar los datos: {error}</p>
      ) : (!datos || datos.length === 0) ? (
        <p style={{ padding: "1rem", color: "#999" }}>Sin datos disponibles aún.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="periodo"
              tickFormatter={formatoEjeX}
              label={{ value: ejesXLabel[vista], position: "insideBottom", offset: -5 }}
            />
            <YAxis
              allowDecimals={false}
              label={{ value: "Cantidad de Paquetes", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value, name, props) => {
                if (props.dataKey === "recibidos") return [`${value} paquetes`, "Recibidos"];
                if (props.dataKey === "entregados") return [`${value} paquetes`, "Entregados"];
                return [value, name];
              }}
            />
            <Legend
              formatter={(value) => {
                if (value === "recibidos") return "Recibidos";
                if (value === "entregados") return "Entregados";
                return value;
              }}
            />
            <Line type="monotone" dataKey="recibidos" stroke="#3b82f6" dot />
            <Line type="monotone" dataKey="entregados" stroke="#10b981" dot />
            {vista === "historial" && <Brush dataKey="periodo" height={30} stroke="#8884d8" />}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
