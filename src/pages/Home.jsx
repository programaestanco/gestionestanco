import React, { useEffect, useState } from "react";
import RegistroPaquete from "../components/RegistroPaquete";
import Estanterias from "../components/Estanterias";

export default function Home() {
  const [paquetes, setPaquetes] = useState(() => {
    const guardados = localStorage.getItem("paquetes");
    return guardados ? JSON.parse(guardados) : [];
  });

  useEffect(() => {
    localStorage.setItem("paquetes", JSON.stringify(paquetes));
  }, [paquetes]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📦 Gestión de Paquetes</h1>
      <Estanterias paquetes={paquetes} />
      <RegistroPaquete paquetes={paquetes} setPaquetes={setPaquetes} />
    </div>
  );
}
