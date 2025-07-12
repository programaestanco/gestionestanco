import React, { useEffect, useState } from "react";
import RegistroPaquete from "../components/RegistroPaquete";
import ListaPaquetes from "../components/ListaPaquetes";
import Estanterias from "../components/Estanterias";
import ResumenIngresos from "../components/ResumenIngresos";
import DashboardLayout from "../components/DashboardLayout";
import { obtenerPaquetes } from "../services/paquetesService";
import "../styles/home.css";

export default function Home() {
  const [paquetes, setPaquetes] = useState([]);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [total, setTotal] = useState(0);
  const [cargandoMas, setCargandoMas] = useState(false);

  const cargarPaquetes = async (pagina = 0, resetear = false) => {
    if (pagina === 0) setLoadingInicial(true);
    setActualizando(true);
    try {
      const { data, total } = await obtenerPaquetes(pagina * 500);
      setPaquetes(prev =>
        resetear ? data : [...prev, ...data]
      );
      setTotal(total);
    } catch (err) {
      console.error("Error al cargar paquetes:", err);
    } finally {
      setActualizando(false);
      setLoadingInicial(false);
      setCargandoMas(false);
    }
  };

  useEffect(() => {
    cargarPaquetes(0, true); // Primera carga
  }, []);

  const cargarSiguientePagina = () => {
    const siguiente = pagina + 1;
    if ((siguiente * 500) < total) {
      setPagina(siguiente);
      setCargandoMas(true);
      cargarPaquetes(siguiente);
    }
  };

  return (
    <DashboardLayout>
      <div className="home-header-area">
        <div>
          <h1>Hola, Amparo</h1>
        </div>
        <div>
          <RegistroPaquete
            paquetes={paquetes}
            actualizarPaquetes={() => cargarPaquetes(0, true)}
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
              actualizarPaquetes={() => cargarPaquetes(0, true)}
              cargando={actualizando}
            />

            {(paquetes.length < total) && (
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <button onClick={cargarSiguientePagina} disabled={cargandoMas}>
                  {cargandoMas ? "Cargando más..." : "Cargar más paquetes"}
                </button>
              </div>
            )}
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
