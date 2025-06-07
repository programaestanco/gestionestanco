import React from "react";
import "../styles/estanterias.css";

const BALDAS = Array.from({ length: 25 }, (_, i) => `B${i + 1}`);

export default function Estanterias({ paquetes }) {
  const conteo = paquetes.reduce((acc, p) => {
    acc[p.compartimento] = (acc[p.compartimento] || 0) + 1;
    return acc;
  }, {});

  const getColorClass = (cantidad) => {
    if (cantidad === 0) return "verde";
    if (cantidad < 10) return "amarillo";
    return "rojo";
  };

  return (
    <div className="estanterias">
      <h2 className="estanterias-titulo">
        <i className="fas fa-warehouse"></i> Estanterías
      </h2>
      <div className="estanteria-grid">
        {BALDAS.map((b) => {
          const cantidad = conteo[b] || 0;
          return (
            <div key={b} className={`estanteria ${getColorClass(cantidad)}`}>
              <strong>{b}</strong>
              <small>
                <i className="fas fa-box"></i> {cantidad} paquete{cantidad !== 1 ? "s" : ""}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
