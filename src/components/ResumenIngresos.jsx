import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaEuroSign, FaEye, FaEyeSlash, FaTrophy } from "react-icons/fa";
import "../styles/resumenIngresos.css";
import IngresosMonetarios from "./IngresosMonetarios";
const PRECIO_POR_ENTREGA = 0.25;
const EMPRESAS = [
  "Amazon", "Seur", "CorreosExpress", "DHL", "GLS",
  "UPS", "CTT", "Celeritas", "MRW", "Otros"
];

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#14b8a6", "#f43f5e", "#ec4899", "#6366f1", "#6b7280"
];

export default function ResumenIngresos({ paquetes }) {
  const [resumen, setResumen] = useState({});
  const [detalleDiario, setDetalleDiario] = useState([]);
  const [total, setTotal] = useState(0);
  const [ganadora, setGanadora] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarIngresos, setMostrarIngresos] = useState(false);
  const ITEMS_POR_PAGINA = 10;

  useEffect(() => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    const ingresosPorEmpresa = {};
    const ingresosPorDia = {};

    EMPRESAS.forEach((empresa) => {
      ingresosPorEmpresa[empresa] = 0;
    });

    paquetes.forEach((p) => {
      if (p.estado !== "entregado") return;

      const empresa = EMPRESAS.includes(p.compania) ? p.compania : "Otros";
      const fecha = new Date(p.fecha_entregado || p.updated_at || p.created_at);
      const año = fecha.getFullYear();
      const mes = fecha.getMonth();

      if (mes === mesActual && año === añoActual) {
        const dia = fecha.toISOString().split("T")[0];
        ingresosPorEmpresa[empresa] += PRECIO_POR_ENTREGA;

        if (!ingresosPorDia[dia]) ingresosPorDia[dia] = {};
        if (!ingresosPorDia[dia][empresa]) ingresosPorDia[dia][empresa] = 0;
        ingresosPorDia[dia][empresa] += PRECIO_POR_ENTREGA;
      }
    });

    const totalGlobal = Object.values(ingresosPorEmpresa).reduce((acc, val) => acc + val, 0);

    const filasDetalladas = Object.entries(ingresosPorDia)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([dia, empresas]) => {
        const fila = { dia };
        EMPRESAS.forEach((e) => {
          fila[e] = empresas[e] || 0;
        });
        return fila;
      });

    const empresaTop = Object.entries(ingresosPorEmpresa)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    setResumen(ingresosPorEmpresa);
    setDetalleDiario(filasDetalladas);
    setTotal(totalGlobal);
    setGanadora(empresaTop);
  }, [paquetes]);

  const getIngresoHoy = () => {
    const hoyISO = new Date().toISOString().split("T")[0];
    return detalleDiario.find(d => d.dia === hoyISO)
      ? EMPRESAS.reduce((acc, e) => acc + (detalleDiario.find(d => d.dia === hoyISO)[e] || 0), 0)
      : 0;
  };

  const getRecordIngreso = () => {
    return detalleDiario.reduce((max, fila) => {
      const totalDia = EMPRESAS.reduce((acc, e) => acc + (fila[e] || 0), 0);
      return Math.max(max, totalDia);
    }, 0);
  };

  const dataGrafico = EMPRESAS.map((empresa, i) => ({
    name: empresa,
    value: resumen[empresa] || 0,
    fill: COLORS[i % COLORS.length]
  })).filter((e) => e.value > 0);

  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const paginados = detalleDiario.slice(inicio, inicio + ITEMS_POR_PAGINA);
  const totalPaginas = Math.ceil(detalleDiario.length / ITEMS_POR_PAGINA);

  return (
    <div className="resumen-ingresos">
      <div className="resumen-contenido">
        <IngresosMonetarios />
        <h2><i className="fas fa-chart-line"></i> Ingresos por empresa (mes actual)</h2>

        <div className="card-doble resumen-general-ingresos">
          <div className="card-doble-icon"><FaEuroSign /></div>
          <div className="card-doble-contenido">
            <div className="linea-dato">
              <span>Ingresos hoy</span>
              <strong className="valor verde">
                {mostrarIngresos ? `${getIngresoHoy().toFixed(2)}€` : "****"}
              </strong>
            </div>
            <div className="linea-dato">
              <span>Ingreso total</span>
              <strong className="valor azul">
                {mostrarIngresos ? `${total.toFixed(2)}€` : "****"}
              </strong>
              <span className="toggle-ojo" onClick={() => setMostrarIngresos(v => !v)}>
                {mostrarIngresos ? <FaEyeSlash /> : <FaEye />}
              </span>
              <span className="badge-record">
                <FaTrophy style={{ marginRight: "6px", color: "#0d6efd" }} />
                Récord diario: {getRecordIngreso().toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

        <div className="grafico-pastel">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataGrafico}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {dataGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <table className="tabla-ingresos">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Ingresos (€)</th>
            </tr>
          </thead>
          <tbody>
            {EMPRESAS.map((empresa) => {
              const ingreso = (resumen[empresa] || 0).toFixed(2);
              const esTop = empresa === ganadora;
              return (
                <tr key={empresa} className={esTop ? "top-empresa" : ""}>
                  <td>{empresa}</td>
                  <td>
                    {ingreso}
                    {esTop && (
                      <span className="triangulo-verde" title="Empresa con más ingresos">
                        ▲
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{total.toFixed(2)} €</strong></td>
            </tr>
          </tfoot>
        </table>

        <h3 className="detalle-dia">Detalle por día y empresa</h3>
        <table className="tabla-detalle">
          <thead>
            <tr>
              <th>Día</th>
              {EMPRESAS.map((e) => (
                <th key={e}>{e}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {paginados.map((fila) => {
              const totalFila = EMPRESAS.reduce((acc, e) => acc + (fila[e] || 0), 0);
              return (
                <tr key={fila.dia}>
                  <td>{new Date(fila.dia).toLocaleDateString("es-ES")}</td>
                  {EMPRESAS.map((e) => (
                    <td key={e}>{(fila[e] || 0).toFixed(2)}</td>
                  ))}
                  <td><strong>{totalFila.toFixed(2)}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {totalPaginas > 1 && (
          <div className="paginacion-detalle">
            <button onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))} disabled={paginaActual === 1}>
              ⬅️
            </button>
            <span>Página {paginaActual} de {totalPaginas}</span>
            <button onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas}>
              ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
