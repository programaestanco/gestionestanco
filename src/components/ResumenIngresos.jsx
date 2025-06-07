import React from "react";
import "../styles/resumenIngresos.css";

const PRECIO_POR_ENTREGA = 0.25; // 💡 Puedes cambiarlo en el futuro

export default function ResumenIngresos({ paquetes }) {
  const entregados = paquetes.filter(p => p.estado === "entregado").length;
  const ingresos = entregados * PRECIO_POR_ENTREGA;

  return (
    <div className="resumen-ingresos">
      <i className="fas fa-coins"></i>
      Ingresos generados: <strong>{ingresos.toFixed(2)} €</strong>
    </div>
  );
}
