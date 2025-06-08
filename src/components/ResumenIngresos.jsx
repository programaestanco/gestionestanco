import React, { useEffect, useState } from "react";
import "../styles/resumenIngresos.css";

const PRECIO_POR_ENTREGA = 0.25;
const EMPRESAS = [
  "Amazon", "Seur", "CorreosExpress", "DHL", "GLS",
  "UPS", "CTT", "Celeritas", "MRW", "Otros"
];

export default function ResumenIngresos({ paquetes }) {
  const [mostrar, setMostrar] = useState(false);
  const [resumen, setResumen] = useState({});
  const [detalleDiario, setDetalleDiario] = useState([]);
  const [total, setTotal] = useState(0);
  const [ganadora, setGanadora] = useState(null);

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

    const filasDetalladas = Object.entries(ingresosPorDia).map(([dia, empresas]) => {
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

  return (
    <div className="resumen-ingresos-wrapper">
      <button className="toggle-resumen" onClick={() => setMostrar(!mostrar)}>
        <i className={`fas fa-chevron-${mostrar ? "up" : "down"}`}></i>
        Ingresos
      </button>

      <div className={`resumen-ingresos ${!mostrar ? "oculto" : ""}`}>
        <div className="resumen-contenido">
          <h2><i className="fas fa-chart-line"></i> Resumen por empresa (Mes actual)</h2>
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
              {detalleDiario.map((fila) => {
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
        </div>
      </div>
    </div>
  );
}
