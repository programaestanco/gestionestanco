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
import { FaEuroSign } from "react-icons/fa";
import "../styles/VolumenPaquetes.css"; // Reutilizamos mismo estilo

export default function IngresosMonetarios() {
  const [vista, setVista] = useState("anual");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [datos, setDatos] = useState([]);

  const debeElegirFecha = vista === "diaria" || vista === "mensual" || vista === "historial";

  useEffect(() => {
    const url = `/api/stats/ingresos?periodo=${vista}${debeElegirFecha ? `&fecha=${fecha}` : ""}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
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
      })
      .catch((err) => console.error("Error al cargar datos:", err));
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

  if (!datos || datos.length === 0) {
    return (
      <div className="grafico-hubspot">
        <div className="cabecera-grafico">
          <h3><FaEuroSign /> Ingresos Monetarios ({vista})</h3>
        </div>
        <p style={{ padding: "1rem", color: "#999" }}>Sin datos disponibles aún.</p>
      </div>
    );
  }

  return (
    <div className="grafico-hubspot">
      <div className="cabecera-grafico">
        <div>
          <h3><FaEuroSign /> Ingresos Monetarios <small style={{ fontWeight: "normal" }}>({vista.charAt(0).toUpperCase() + vista.slice(1)})</small></h3>
          <p className="ejes-ayuda">
            Eje X: {ejesXLabel[vista]} · Eje Y: Ingresos (€)
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
          Ver por fecha: <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      )}

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="periodo" tickFormatter={formatoEjeX} label={{ value: ejesXLabel[vista], position: "insideBottom", offset: -5 }} />
          <YAxis
            allowDecimals={true}
            label={{ value: "Ingresos (€)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip formatter={(value) => [`${value.toFixed(2)} €`, "Ingresos"]} />
          <Legend formatter={() => "Ingresos (€)"} />
          <Line type="monotone" dataKey="ingresos" stroke="#f59e0b" dot />
          {vista === "historial" && <Brush dataKey="periodo" height={30} stroke="#f59e0b" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
