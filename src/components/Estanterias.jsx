import React from "react";

const BALDAS = Array.from({ length: 25 }, (_, i) => `B${i + 1}`);

export default function Estanterias({ paquetes }) {
  const conteo = paquetes.reduce((acc, p) => {
    acc[p.compartimento] = (acc[p.compartimento] || 0) + 1;
    return acc;
  }, {});

  const getColor = (cantidad) => {
    if (cantidad === 0) return "#a3f7b5";
    if (cantidad < 10) return "#fff3b0";
    return "#ff7b7b";
  };

  return (
    <div>
      <h2>🗂️ Estanterías</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
        {BALDAS.map((b) => {
          const cantidad = conteo[b] || 0;
          return (
            <div
              key={b}
              style={{
                backgroundColor: getColor(cantidad),
                border: "1px solid #999",
                padding: "0.5rem",
                height: "60px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <strong>{b}</strong>
              <small>📦 {cantidad} paquete{cantidad !== 1 ? "s" : ""}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
