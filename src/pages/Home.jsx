import React, { useEffect, useState } from "react";
import RegistroPaquete from "../components/RegistroPaquete";
import Estanterias from "../components/Estanterias";
import { obtenerPaquetes } from "../services/paquetesService";

export default function Home() {
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPaquetes = async () => {
    setLoading(true);
    try {
      const data = await obtenerPaquetes();
      setPaquetes(data);
    } catch (err) {
      console.error("Error al cargar paquetes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPaquetes();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📦 Gestión de Paquetes</h1>
      {loading ? <p>Cargando paquetes...</p> : <>
        <Estanterias paquetes={paquetes} />
        <RegistroPaquete paquetes={paquetes} actualizarPaquetes={cargarPaquetes} />
      </>}
    </div>
  );
}
