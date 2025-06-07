import React, { useEffect, useState } from "react";
import RegistroPaquete from "../components/RegistroPaquete";
import Estanterias from "../components/Estanterias";
import ListaPaquetes from "../components/ListaPaquetes";
import { obtenerPaquetes } from "../services/paquetesService";
import ResumenIngresos from "../components/ResumenIngresos";
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
        <div className="header-content">
          <h1 className="header-title">Gestión de Paquetes</h1>
          <p className="header-subtitle">Organiza y controla todos los paquetes desde un único lugar.</p>
        </div>
      </header>

      <main className="home-main">
        {loading ? (
          <div className="loading-indicator">Cargando paquetes...</div>
        ) : (
          <>
          <RegistroPaquete paquetes={paquetes} actualizarPaquetes={cargarPaquetes} />
            <Estanterias paquetes={paquetes} />           
            <ListaPaquetes paquetes={paquetes} actualizarPaquetes={cargarPaquetes} />
            <ResumenIngresos paquetes={paquetes} />
            
          </>
        )}
      </main>
    </div>
  );
}
