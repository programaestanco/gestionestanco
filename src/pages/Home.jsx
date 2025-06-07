import React, { useEffect, useState } from "react";
import RegistroPaquete from "../components/RegistroPaquete";
import Estanterias from "../components/Estanterias";
import ListaPaquetes from "../components/ListaPaquetes";
import { obtenerPaquetes } from "../services/paquetesService";
import "../styles/home.css";

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
    <div className="home-container">
      <header className="home-header">
        <h1>Gestión de Paquetes</h1>
        <p>Visualiza, organiza y controla todos los paquetes desde un único lugar.</p>
      </header>

      {loading ? (
        <div className="loading-indicator">Cargando paquetes...</div>
      ) : (
        <>
          <Estanterias paquetes={paquetes} />
          <RegistroPaquete paquetes={paquetes} actualizarPaquetes={cargarPaquetes} />
          <ListaPaquetes paquetes={paquetes} actualizarPaquetes={cargarPaquetes} />
        </>
      )}
    </div>
  );
}
