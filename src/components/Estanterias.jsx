import React from "react";
import "../styles/estanterias.css";

const BALDAS = Array.from({ length: 25 }, (_, i) => `B${i + 1}`);

export default function Estanterias({ paquetes }) {
  const conteo = paquetes.reduce((acc, p) => {
    if (p.estado === "entregado") return acc; // Excluir paquetes entregados
    acc[p.compartimento] = (acc[p.compartimento] || 0) + 1;
    return acc;
  }, {});

  const getColorClass = (cantidad) => {
    if (cantidad === 0) return "verde";
    if (cantidad < 10) return "amarillo";
    return "rojo";
  };

  const columnas = Array.from({ length: 5 }, (_, colIdx) =>
    BALDAS.slice(colIdx * 5, colIdx * 5 + 5)
  );

  return (
    <section className="estanterias">
      <h2 className="estanterias-titulo">
        <i className="fas fa-warehouse"></i> Estanterías
      </h2>
      <div className="estanteria-columnas">
        {columnas.map((col, colIdx) => (
          <div key={colIdx} className="columna">
            <h4>Columna {colIdx + 1}</h4>
            {col.map((b) => {
              const cantidad = conteo[b] || 0;
              return (
                <div key={b} className={`estanteria ${getColorClass(cantidad)}`}>
                  <div className="estanteria-label">{b}</div>
                  <div className="estanteria-info">
                    <i className="fas fa-box"></i> {cantidad} paquete{cantidad !== 1 ? "s" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
