import React, { useEffect, useState } from "react";
import "../styles/resumenIngresos.css";

const PRECIO_POR_ENTREGA = 0.25;

export default function ResumenIngresos({ paquetes }) {
  const [resumen, setResumen] = useState({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const añoAnterior = mesActual === 0 ? añoActual - 1 : añoActual;

    const porEmpresa = {};
    let totalGlobal = 0;

    paquetes.forEach((p) => {
      const fecha = new Date(p.fecha_entregado || p.updated_at || p.created_at);
      if (p.estado !== "entregado") return;

      const empresa = p.empresa || "Desconocida";
      const esActual =
        fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
      const esAnterior =
        fecha.getMonth() === mesAnterior && fecha.getFullYear() === añoAnterior;

      if (!porEmpresa[empresa]) {
        porEmpresa[empresa] = {
          actual: 0,
          anterior: 0,
        };
      }

      if (esActual) {
        porEmpresa[empresa].actual += PRECIO_POR_ENTREGA;
        totalGlobal += PRECIO_POR_ENTREGA;
      } else if (esAnterior) {
        porEmpresa[empresa].anterior += PRECIO_POR_ENTREGA;
      }
    });

    setResumen(porEmpresa);
    setTotal(totalGlobal);
  }, [paquetes]);

  return (
    <div className="resumen-ingresos">
      <h2><i className="fas fa-chart-line"></i> Ingresos por Empresa (Mes actual)</h2>
      <div className="ingresos-empresas">
        {Object.entries(resumen).map(([empresa, datos]) => {
          const diferencia = datos.actual - datos.anterior;
          const sube = diferencia > 0;
          const igual = diferencia === 0;

          return (
            <div className="empresa-card" key={empresa}>
              <div className="empresa-nombre">{empresa}</div>
              <div className="empresa-valor">{datos.actual.toFixed(2)} €</div>
              <div
                className={`empresa-diferencia ${
                  igual ? "neutral" : sube ? "positivo" : "negativo"
                }`}
              >
                {igual ? (
                  <span>= 0.00 €</span>
                ) : (
                  <>
                    <i className={`fas fa-arrow-${sube ? "up" : "down"}`}></i>
                    {Math.abs(diferencia).toFixed(2)} €
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="total-ingresos">
        <strong>Total global:</strong> {total.toFixed(2)} €
      </div>
    </div>
  );
}
