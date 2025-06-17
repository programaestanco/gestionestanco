import React, { useEffect, useState } from "react";
import RegistroPaquete from "../components/RegistroPaquete";
import ListaPaquetes from "../components/ListaPaquetes";
import Estanterias from "../components/Estanterias";
import ResumenIngresos from "../components/ResumenIngresos";
import DashboardLayout from "../components/DashboardLayout"; // nuevo layout lateral
import { obtenerPaquetes } from "../services/paquetesService";
import "../styles/home.css";

export default function Home() {
  const [paquetes, setPaquetes] = useState([]);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const cargarPaquetes = async () => {
    setActualizando(true);
    try {
      const data = await obtenerPaquetes();
      setPaquetes(data);
    } catch (err) {
      console.error("Error al cargar paquetes:", err);
    } finally {
      setActualizando(false);
      setLoadingInicial(false);
    }
  };

  useEffect(() => {
    cargarPaquetes();
  }, []);

  return (
    <DashboardLayout>
      <div className="home-header-area">
        <div>
          <h1>Hola, Amparo</h1>
        </div>
        <div>
          <RegistroPaquete
            paquetes={paquetes}
            actualizarPaquetes={cargarPaquetes}
          />
        </div>
      </div>

      {loadingInicial ? (
        <div className="loading-indicator">Cargando paquetes...</div>
      ) : (
        <div className="home-grid">
          <div className="home-left">
            <ListaPaquetes
              paquetes={paquetes}
              actualizarPaquetes={cargarPaquetes}
              cargando={actualizando}
            />
          </div>

          <div className="home-right">
            <ResumenIngresos paquetes={paquetes} />
            <Estanterias paquetes={paquetes} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
