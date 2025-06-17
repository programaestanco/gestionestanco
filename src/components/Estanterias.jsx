import React, { useState } from "react";
import "../styles/estanterias.css";

const BALDAS = Array.from({ length: 25 }, (_, i) => `B${i + 1}`);

export default function Estanterias({ paquetes }) {
  const [baldaActiva, setBaldaActiva] = useState(null);

  const conteo = paquetes.reduce((acc, p) => {
    if (p.estado === "entregado") return acc;
    acc[p.compartimento] = (acc[p.compartimento] || []);
    acc[p.compartimento].push(p.cliente);
    return acc;
  }, {});

  const getColorClass = (cantidad) => {
    if (cantidad === 0) return "verde";
    if (cantidad < 7) return "amarillo";
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
      <div className="grid-estanterias-5x5">
        {columnas.map((col, idx) => (
          <div key={idx} className="columna-estanteria">
            <h4>Columna {idx + 1}</h4>
            {col.map((b) => {
              const paquetesEnBalda = conteo[b] || [];
              const activa = baldaActiva === b;
              return (
                <div
                  key={b}
                  className={`estanteria ${getColorClass(paquetesEnBalda.length)} ${activa ? "activa" : ""}`}
                  onClick={() => setBaldaActiva(activa ? null : b)}
                >
                  <div className="estanteria-label">
                    {b} <span>({paquetesEnBalda.length} PAQUETES)</span>
                  </div>
                  <ul className="lista-paquetes-balda">
                    {paquetesEnBalda.map((nombre, i) => (
                      <li key={i}><i className="fas fa-user"></i> {nombre}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
